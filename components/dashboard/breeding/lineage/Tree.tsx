'use client';

import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Position,
  NodeProps,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { getReptileLineage } from '@/app/api/reptiles/lineage';
import { Badge } from '@/components/ui/badge';
import { Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { CircleHelp, Mars, Venus } from 'lucide-react';

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
}

const CustomNode = ({ data }: NodeProps<CustomNodeData>) => (
  <div
    className={cn(
      'px-4 py-2 shadow-lg rounded-md border border-input bg-card dark:bg-slate-900/60 min-w-[200px] transition-all duration-300',
      data.isSelected && 
        'ring-1 ring-primary shadow-2xl bg-primary/5 border-primary z-50'
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
        </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = { custom: CustomNode };

export function ReptileTree({ reptileId }: ReptileTreeProps) {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { morphs } = useMorphsStore();
  
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Enhanced layoutNodes function with improved positioning algorithm
  const layoutNodes = useCallback(
    (tree: ReptileNode) => {
      const processedNodes = new Map<string, Node<CustomNodeData>>();
      const nodesArray: Node<CustomNodeData>[] = [];
      const edgesArray: Edge[] = [];
      
      // Constants for layout
      const BASE_NODE_WIDTH = 250;
      const LEVEL_HEIGHT = 200;
      const HORIZONTAL_SPACING = 300;

      // First pass: Create all nodes and their basic relationships
      function createNodesAndEdges(
        node: ReptileNode, 
        x = 0, 
        y = 0,
        parentId?: string
      ) {
        // Skip if already processed
        if (processedNodes.has(node.id)) return;
        
        // Create node
        const morphName = morphs.find((m: Morph) => m.id.toString() === node.morph)?.name || 'Unknown';
        const newNode: Node<CustomNodeData> = {
          id: node.id,
          position: { x, y },
          type: 'custom',
          data: {
            name: node.name,
            species_name: node.species,
            sex: node.sex,
            generation: node.generation,
            breeding_line: node.breeding_line,
            morph_name: morphName,
            isSelected: node.id === reptileId,
          },
        };
        
        processedNodes.set(node.id, newNode);
        nodesArray.push(newNode);
        
        // Create edge if this is a child
        if (parentId) {
          const edgeId = `${parentId}-${node.id}`;
          edgesArray.push({
            id: edgeId,
            source: parentId,
            target: node.id,
            type: 'smoothstep',
          });
        }
        
        // Process dam and sire (parents)
        if (node.parents.dam) {
          createNodesAndEdges(node.parents.dam, 0, 0, null);
          edgesArray.push({
            id: `${node.parents.dam.id}-${node.id}`,
            source: node.parents.dam.id,
            target: node.id,
            type: 'smoothstep',
          });
        }
        
        if (node.parents.sire) {
          createNodesAndEdges(node.parents.sire, 0, 0, null);
          edgesArray.push({
            id: `${node.parents.sire.id}-${node.id}`,
            source: node.parents.sire.id,
            target: node.id,
            type: 'smoothstep',
          });
        }
        
        // Process children
        node.children.forEach(child => {
          createNodesAndEdges(child, 0, 0, node.id);
        });
      }
      
      // Initialize with the root node
      createNodesAndEdges(tree);
      
      // Second pass: Calculate generations and assign y-coordinates
      const generationMap = new Map<string, number>();
      
      function calculateGenerations(nodeId: string, generation = 0) {
        const currentGen = generationMap.get(nodeId) ?? -Infinity;
        
        // Only update if this path gives a higher generation number
        if (generation > currentGen) {
          generationMap.set(nodeId, generation);
          
          // Find parents
          for (const edge of edgesArray) {
            if (edge.target === nodeId) {
              calculateGenerations(edge.source, generation - 1);
            }
          }
          
          // Find children
          for (const edge of edgesArray) {
            if (edge.source === nodeId) {
              calculateGenerations(edge.target, generation + 1);
            }
          }
        }
      }
      
      // Start with the selected reptile at generation 0
      calculateGenerations(reptileId);
      
      // Group nodes by generation
      const generationGroups = new Map<number, string[]>();
      for (const [nodeId, gen] of generationMap.entries()) {
        if (!generationGroups.has(gen)) {
          generationGroups.set(gen, []);
        }
        generationGroups.get(gen)!.push(nodeId);
      }
      
      // Third pass: Assign x-coordinates within each generation
      generationGroups.forEach((nodeIds, generation) => {
        const y = generation * LEVEL_HEIGHT;
        const totalWidth = nodeIds.length * HORIZONTAL_SPACING;
        const startX = -totalWidth / 2 + HORIZONTAL_SPACING / 2;
        
        nodeIds.forEach((nodeId, index) => {
          const x = startX + index * HORIZONTAL_SPACING;
          const node = processedNodes.get(nodeId);
          if (node) {
            node.position = { x, y };
          }
        });
      });
      
      return { nodes: nodesArray, edges: edgesArray };
    },
    [morphs, reptileId],
  );

  useEffect(() => {
    const loadLineage = async () => {
      try {
        // Pass cached reptiles to the lineage function
        const lineageData = await getReptileLineage(reptileId, reptiles);
        const { nodes, edges } = layoutNodes(lineageData);
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error('Failed to load reptile lineage:', error);
        setNodes([]);
        setEdges([]);
      }
    };
    
    if (reptileId && reptiles.length > 0) {
      loadLineage();
    }
  }, [reptileId, layoutNodes, reptiles]);

  // Memoize ReactFlow to prevent unnecessary re-renders
  const reactFlow = useMemo(
    () => (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
      </ReactFlow>
    ),
    [nodes, edges],
  );

  return <div style={{ width: '100%', height: '800px' }}>{reactFlow}</div>;
}