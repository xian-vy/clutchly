'use client';

import { getReptileLineage } from '@/app/api/reptiles/lineage';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Badge } from '@/components/ui/badge';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';
import { Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { CircleHelp, Mars, Venus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

interface ReptileNode extends Reptile {
  children: ReptileNode[];
  parents: {
    dam: ReptileNode | null;
    sire: ReptileNode | null;
  };
}

interface ReptileTreeProps {
  reptileId: string;
}

interface CustomNodeData {
  name: string;
  species_name?: string;
  sex: string;
  isParent?: 'dam' | 'sire';
  generation?: number;
  breeding_line?: string;
  morph_name: string;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isParentOf?: string;
  selectedReptileName : string;
}

const CustomNode = ({ data}: NodeProps<CustomNodeData>) => (
  <div
    className={cn(
      'px-4 py-2 shadow-lg rounded-md border border-input bg-card dark:bg-slate-900/60 min-w-[200px] transition-all duration-300',
      data.isSelected && 
        'ring-1 ring-primary shadow-2xl bg-primary/5 border-primary z-50',
      data.isHighlighted && !data.isSelected && 
        'ring-1 ring-amber-500 shadow-xl bg-amber-50 dark:bg-amber-900/30 border-amber-500 z-40',
      data.isParentOf && 
        (data.isParent === 'dam' 
          ? 'ring-1 ring-red-500 shadow-xl bg-red-50 dark:bg-red-900/30 border-red-500 z-40'
          : 'ring-1 ring-blue-500 shadow-xl bg-blue-50 dark:bg-blue-900/30 border-blue-500 z-40')
    )}
  >
    <Handle type="target" position={Position.Top} />
    <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-3">
              <div className="font-bold">{data.name || 'Unknown'}</div>
              <>
                {data.sex === 'male' ? (
                  <Mars className="h-4 w-4 text-blue-400"/>
                ) : data.sex === 'female' ? (
                  <Venus className="h-4 w-4 text-red-500"/>
                ) :(
                  <CircleHelp className="h-4 w-4 text-muted-foreground"/>
                )}
              </>
        </div>
        <div className="text-[0.8rem] text-muted-foreground">{data.morph_name || 'N/A'}</div>
        <div className="flex gap-2 justify-center flex-wrap w-full">
          {data.generation && (
            <Badge variant="outline">Gen {data.generation}</Badge>
          )}
          {data.breeding_line && (
            <Badge variant="secondary">{data.breeding_line}</Badge>
          )}
          {data.isParentOf && (
            <p className='text-sm bg-muted-foreground/20 px-2 py-1 rounded-md'>
              {data.isParent === 'dam' ? 'Dam of' : 'Sire of'} {data.selectedReptileName}
            </p>
          )}
        </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = { custom: CustomNode };

// Create a flow component that uses the ReactFlow hooks inside the provider context
function Flow({ reptileId }: { reptileId: string }) {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedReptile, setSelectedReptile] = useState<string>(reptileId);
  const [highlightedNodes, setHighlightedNodes] = useState<{
    dam: string | null,
    sire: string | null,
    child: string | null
  }>({
    dam: null,
    sire: null,
    child: null
  });
  
  const { morphs } = useMorphsStore();
  
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Keep track of parent-child relationships for quick lookup
  const [parentRelationships, setParentRelationships] = useState<Map<string, {
    dam: string | null,
    sire: string | null
  }>>(new Map());

  const createFlowElements = useCallback(
    (reptileTree: ReptileNode) => {
      const flowNodes: Node<CustomNodeData>[] = [];
      const flowEdges: Edge[] = [];
      const nodeMap = new Map<string, Node<CustomNodeData>>();
      const parentChildMap = new Map<string, {
        dam: string | null,
        sire: string | null
      }>();
      
      // First, extract all nodes from the tree with an iterative approach
      const allTreeNodes = new Map<string, ReptileNode>();
      
      // Non-recursive function to collect all nodes in the tree
      function collectAllNodes(rootNode: ReptileNode) {
        const queue: ReptileNode[] = [rootNode];
        
        while (queue.length > 0) {
          const node = queue.shift()!;
          if (allTreeNodes.has(node.id)) continue;
          
          allTreeNodes.set(node.id, node);
          
          // Store parent relationships
          parentChildMap.set(node.id, {
            dam: node.parents.dam?.id || null,
            sire: node.parents.sire?.id || null
          });
          
          // Add parents to queue
          if (node.parents.dam) queue.push(node.parents.dam);
          if (node.parents.sire) queue.push(node.parents.sire);
          
          // Add children to queue
          for (const child of node.children) {
            queue.push(child);
          }
        }
      }
      
      collectAllNodes(reptileTree);
      
      // Store parent relationships for later use
      setParentRelationships(parentChildMap);
      
      // Calculate generations for each node (iterative approach)
      const generationMap = new Map<string, number>();
      generationMap.set(reptileId, 0); // Set the root node to generation 0
      
      let hasChanges = true;
      while (hasChanges) {
        hasChanges = false;
        
        // Process all nodes
        for (const [id, node] of allTreeNodes.entries()) {
          const currentGen = generationMap.get(id);
          
          // Process parents (parents are one generation up)
          if (currentGen !== undefined) {
            const parentGen = currentGen - 1;
            
            if (node.parents.dam && !generationMap.has(node.parents.dam.id)) {
              generationMap.set(node.parents.dam.id, parentGen);
              hasChanges = true;
            }
            
            if (node.parents.sire && !generationMap.has(node.parents.sire.id)) {
              generationMap.set(node.parents.sire.id, parentGen);
              hasChanges = true;
            }
          }
          
          // Process children (children are one generation down)
          if (currentGen !== undefined) {
            const childGen = currentGen + 1;
            
            for (const child of node.children) {
              if (!generationMap.has(child.id)) {
                generationMap.set(child.id, childGen);
                hasChanges = true;
              }
            }
          }
        }
      }
      
      // Group nodes by generation
      const nodesByGeneration = new Map<number, string[]>();
      for (const [id, gen] of generationMap.entries()) {
        if (!nodesByGeneration.has(gen)) {
          nodesByGeneration.set(gen, []);
        }
        nodesByGeneration.get(gen)!.push(id);
      }
      
      // Helper function to create a node
      function createNode(reptileNode: ReptileNode) {
        if (nodeMap.has(reptileNode.id)) {
          return nodeMap.get(reptileNode.id)!;
        }
        
        const generation = generationMap.get(reptileNode.id) || 0;
        const nodesInGeneration = nodesByGeneration.get(generation) || [];
        const position = nodesInGeneration.indexOf(reptileNode.id);
        
        // Constants for layout
        const Y_SPACING = 200;
        const NODE_WIDTH = 250;
        const HORIZONTAL_SPACING = 50;
        
        // Calculate horizontal position
        const totalWidth = (nodesInGeneration.length * NODE_WIDTH) + 
                          ((nodesInGeneration.length - 1) * HORIZONTAL_SPACING);
        const startX = -totalWidth / 2;
        
        const x = startX + (position * (NODE_WIDTH + HORIZONTAL_SPACING));
        const y = generation * Y_SPACING;
        
        // Create the flow node
        const morphName = morphs.find((m: Morph) => m.id.toString() === reptileNode.morph)?.name || 'Unknown';
        
        const isParentOf = highlightedNodes.child && 
          (highlightedNodes.dam === reptileNode.id || highlightedNodes.sire === reptileNode.id) ? 
          highlightedNodes.child : undefined;
          
        const isParent = highlightedNodes.dam === reptileNode.id ? 'dam' : 
                         highlightedNodes.sire === reptileNode.id ? 'sire' : undefined;
        
        const flowNode: Node<CustomNodeData> = {
          id: reptileNode.id,
          position: { x, y },
          type: 'custom',
          data: {
            name: reptileNode.name,
            species_name: reptileNode.species,
            sex: reptileNode.sex,
            generation: reptileNode.generation,
            breeding_line: reptileNode.breeding_line,
            morph_name: morphName,
            isSelected: reptileNode.id === selectedReptile,
            isHighlighted: reptileNode.id === highlightedNodes.dam || reptileNode.id === highlightedNodes.sire,
            isParentOf: isParentOf,
            isParent: isParent,
            selectedReptileName : reptiles.find((r: Reptile) => r.id.toString() === selectedReptile)?.name || 'Unknown',
          },
        };
        
        nodeMap.set(reptileNode.id, flowNode);
        flowNodes.push(flowNode);
        
        return flowNode;
      }
      
       // Create all nodes first
       for (const node of allTreeNodes.values()) {
        createNode(node);
      }
      
      // Then create all edges
      const processedEdges = new Set<string>();
      
      for (const [id, node] of allTreeNodes.entries()) {
        // Add parent edges
        if (node.parents.dam) {
          const edgeId = `${node.parents.dam.id}-${id}`;
          if (!processedEdges.has(edgeId)) {
            const isHighlighted = 
              (highlightedNodes.child === id && highlightedNodes.dam === node.parents.dam.id);
            
            flowEdges.push({
              id: edgeId,
              source: node.parents.dam.id,
              target: id,
              type: 'smoothstep',
              style: { 
                stroke: '#e91e63', 
                strokeWidth: isHighlighted ? 2 : 1,
                opacity: isHighlighted ? 1 : 0.75,
              },
              labelBgPadding: [4, 2],
              labelBgBorderRadius: 4,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#e91e63',
              },
              animated: isHighlighted,
            });
            processedEdges.add(edgeId);
          }
        }
        
        if (node.parents.sire) {
          const edgeId = `${node.parents.sire.id}-${id}`;
          if (!processedEdges.has(edgeId)) {
            const isHighlighted = 
              (highlightedNodes.child === id && highlightedNodes.sire === node.parents.sire.id);
              
            flowEdges.push({
              id: edgeId,
              source: node.parents.sire.id,
              target: id,
              type: 'smoothstep',
              style: { 
                stroke: '#2196f3', 
                strokeWidth: isHighlighted ? 2 : 1,
                opacity: isHighlighted ? 1 : 0.75,
              },
              labelBgPadding: [4, 2],
              labelBgBorderRadius: 4,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#2196f3',
              },
              animated: isHighlighted,
            });
            processedEdges.add(edgeId);
          }
        }
      }
      
      return { nodes: flowNodes, edges: flowEdges };
    },
    [morphs, reptileId, selectedReptile, highlightedNodes],
  );

  useEffect(() => {
    const loadLineage = async () => {
      try {
        if (!reptileId || reptiles.length === 0) return;
        
        // Pass cached reptiles to the lineage function
        const lineageData = await getReptileLineage(reptileId, reptiles);
        const { nodes, edges } = createFlowElements(lineageData);
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error('Failed to load reptile lineage:', error);
        setNodes([]);
        setEdges([]);
      }
    };
    
    loadLineage();
  }, [reptileId, createFlowElements, reptiles]);

  // Function to handle node click
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    
    setSelectedReptile(node.id);
    
    // Find parents for this node
    const parentInfo = parentRelationships.get(node.id);
    
    // Update highlighted nodes
    setHighlightedNodes({
      dam: parentInfo?.dam || null,
      sire: parentInfo?.sire || null,
      child: node.id
    });
 
  }, [parentRelationships]);

  // Add legend component
  const Legend = () => (
    <div className="absolute bottom-24 right-8 bg-white dark:bg-slate-900 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-800 z-10">
      <div className="text-sm font-medium mb-2">Legend</div>
      <div className="flex items-center mb-1">
        <div className="w-4 h-0.5 bg-blue-400 mr-2"></div>
        <div className="flex items-center">
          <span className="text-xs mr-1">Sire</span>
          <Mars className="h-3 w-3 text-blue-400" />
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
        <div className="flex items-center">
          <span className="text-xs mr-1">Dam</span>
          <Venus className="h-3 w-3 text-red-500" />
        </div>
      </div>
    </div>
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.5 }}
      minZoom={0.1}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      attributionPosition="bottom-left"
    >
      <Controls />
      <Background />
      <Legend />
    </ReactFlow>
  );
}

// Main component that wraps everything with the ReactFlowProvider
export function ReptileTree({ reptileId }: ReptileTreeProps) {
  return (
    <div style={{ width: '100%', height: '800px' }}>
      <ReactFlowProvider>
        <Flow reptileId={reptileId} />
      </ReactFlowProvider>
    </div>
  );
}