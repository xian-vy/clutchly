'use client';

import { getReptileLineage } from '@/app/api/reptiles/lineage';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';
import { HetTrait, Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { CircleHelp, Mars, Venus, Users, Network, Dna } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { VscSnake } from 'react-icons/vsc';
import ReactFlow, {
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeChange,
  NodeProps,
  Position,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

interface ReptileNode extends Reptile {
  children: ReptileNode[];
  childrenWithoutDescendants: Reptile[];
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
  selectedReptileName: string;
  visualTraits: string[];
  hetTraits: HetTrait[];
  isGroupNode?: boolean;
  groupedReptiles?: Reptile[];
  nodeType?: string;
  count?: number;
  parentId?: string;
}

// Special node for showing grouped descendants without offspring
const GroupNode = ({ data, id }: NodeProps<CustomNodeData>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { morphs } = useMorphsStore();
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  return (
    <>
      <div
        className={cn(
          'px-4 py-2 shadow-lg rounded-md border border-dashed border-primary/70 bg-primary/10 dark:bg-primary/20 min-w-[200px] transition-all duration-300 hover:border-primary cursor-pointer',
          data.isSelected && 'ring-1 ring-primary shadow-2xl z-50',
        )}
        style={{ boxShadow: 'none', outline: 'none' }}
        onClick={(e) => {
          e.stopPropagation();
          setDialogOpen(true);
        }}
      >
        <Handle 
          type="target" 
          position={Position.Top} 
          style={{ border: 'none', background: 'transparent' }} 
        />
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="flex items-center gap-2">
            <Dna className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Show {data.count} Offspring</span>
          </div>
          <div className="text-xs text-muted-foreground">Without descendants</div>
        </div>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          style={{ border: 'none', background: 'transparent' }} 
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl lg:max-w-screen-md 2xl:max-w-screen-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Offspring without Descendants</DialogTitle>
          </DialogHeader>
          {data.parentId && (
            <div className="p-3 mb-2 bg-muted/50 rounded-md">
              <div className="font-semibold mb-1">Parents:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.groupedReptiles && data.groupedReptiles.length > 0 && data.groupedReptiles[0].dam_id && (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <Venus className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">
                        {reptiles?.find(r => r.id === data.groupedReptiles?.[0].dam_id)?.name || 'Unknown Dam'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {morphs.find(m => m.id.toString() === reptiles?.find(r => r.id === data.groupedReptiles?.[0].dam_id)?.morph_id.toString())?.name || 'Unknown Morph'}
                      </div>
                    </div>
                  </div>
                )}
                {data.groupedReptiles && data.groupedReptiles.length > 0 && data.groupedReptiles[0].sire_id && (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <Mars className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="font-medium">
                        {reptiles?.find(r => r.id === data.groupedReptiles?.[0].sire_id)?.name || 'Unknown Sire'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {morphs.find(m => m.id.toString() === reptiles?.find(r => r.id === data.groupedReptiles?.[0].sire_id)?.morph_id.toString())?.name || 'Unknown Morph'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
              {data.groupedReptiles?.map((reptile) => {
                const morphName = morphs.find((m: Morph) => m.id.toString() === reptile.morph_id.toString())?.name || 'Unknown';
                return (
                  <div key={reptile.id} className="border rounded-md p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold">{reptile.name}</div>
                      <div>
                        {reptile.sex === 'male' ? (
                          <Mars className="h-4 w-4 text-blue-400" />
                        ) : reptile.sex === 'female' ? (
                          <Venus className="h-4 w-4 text-red-500" />
                        ) : (
                          <CircleHelp className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium mt-1">{morphName}</div>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {reptile.visual_traits?.map((trait, i) => (
                        <Badge key={i} className="bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {reptile.het_traits?.map((trait, i) => (
                        <Badge key={i} className="bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs">
                          {trait.percentage + "% het " + trait.trait}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {reptile.generation && (
                        <Badge variant="outline">Gen {reptile.generation}</Badge>
                      )}
                      {reptile.breeding_line && (
                        <Badge variant="secondary">{reptile.breeding_line}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CustomNode = ({ data}: NodeProps<CustomNodeData>) => (
  <div
    className={cn(
      'px-4 py-2 shadow-lg rounded-md border border-input bg-card dark:bg-slate-900/60 min-w-[200px] transition-all duration-300',
      data.isSelected && 
        'ring-1 ring-primary shadow-2xl  border-primary z-50',
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
        <div className="text-sm  font-medium">{data.morph_name || 'N/A'}</div>
        <div className="flex gap-2 flex-wrap w-full justify-center">
          {data.visualTraits?.map((trait, index) => (
            <Badge key={index} className='bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs' >{trait}</Badge>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap w-full justify-center">
          {data.hetTraits?.map((trait, index) => (
            <Badge key={index} className='bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs'>{trait.percentage + "% het " +  trait.trait}</Badge>
          ))}
        </div>
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

const nodeTypes = { custom: CustomNode, group: GroupNode };

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
        const morphName = morphs.find((m: Morph) => m.id.toString() === reptileNode.morph_id.toString())?.name || 'Unknown';
        
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
            species_name: reptileNode.species_id.toString(),
            sex: reptileNode.sex,
            generation: reptileNode.generation,
            breeding_line: reptileNode.breeding_line,
            morph_name: morphName,
            isSelected: reptileNode.id === selectedReptile,
            isHighlighted: reptileNode.id === highlightedNodes.dam || reptileNode.id === highlightedNodes.sire,
            isParentOf: isParentOf,
            isParent: isParent,
            selectedReptileName : reptiles.find((r: Reptile) => r.id.toString() === selectedReptile)?.name || 'Unknown',
            visualTraits: reptileNode.visual_traits || [],
            hetTraits: reptileNode.het_traits || [],
          },
        };
        
        nodeMap.set(reptileNode.id, flowNode);
        flowNodes.push(flowNode);
        
        return flowNode;
      }
      
      // Create all nodes first
      for (const node of allTreeNodes.values()) {
        createNode(node);
        
        // Add group nodes for children without descendants if any exist
        if (node.childrenWithoutDescendants && node.childrenWithoutDescendants.length > 0) {
          const pairId = node.id; // Use the parent ID that has the grouped children
          const groupNodeId = `group-${pairId}`;
          const generation = (generationMap.get(node.id) || 0) + 1;
          
          // Calculate position for group node
          const nodesInGeneration = nodesByGeneration.get(generation) || [];
          const nodesCount = nodesInGeneration.length;
          
          // Constants for layout (same as regular nodes)
          const Y_SPACING = 200;
          const NODE_WIDTH = 250;
          const HORIZONTAL_SPACING = 50;
          
          // Calculate x position - find other parent and position between them if possible
          let x = 0;
          let partnerNodeId = null;
          
          // Find possible breeding partners (look for common offspring)
          const offspring = node.childrenWithoutDescendants[0]; // First offspring to identify parents
          
          if (offspring) {
            // Check which one of the parents this node is
            if (offspring.dam_id === node.id && offspring.sire_id) {
              partnerNodeId = offspring.sire_id;
            } else if (offspring.sire_id === node.id && offspring.dam_id) {
              partnerNodeId = offspring.dam_id;
            }
          }
          
          // Get partner node position if it exists
          const partnerNode = partnerNodeId ? nodeMap.get(partnerNodeId) : null;
          const currentNode = nodeMap.get(node.id);
          
          if (currentNode && partnerNode) {
            // Position the group node between the two parents
            x = (currentNode.position.x + partnerNode.position.x) / 2;
          } else if (currentNode) {
            // Position slightly to the right of the single parent
            x = currentNode.position.x + NODE_WIDTH / 2 + HORIZONTAL_SPACING;
          } else {
            // Fallback position
            const totalWidth = ((nodesCount + 1) * NODE_WIDTH) + 
                              (nodesCount * HORIZONTAL_SPACING);
            const startX = -totalWidth / 2;
            x = startX + (nodesCount * (NODE_WIDTH + HORIZONTAL_SPACING));
          }
          
          const y = generation * Y_SPACING;
          
          // Create group node
          const groupNode: Node<CustomNodeData> = {
            id: groupNodeId,
            position: { x, y },
            type: 'group',
            data: {
              name: `Children of ${node.name}`,
              sex: 'unknown',
              morph_name: '',
              isGroupNode: true,
              nodeType: 'childrenWithoutDescendants',
              count: node.childrenWithoutDescendants.length,
              groupedReptiles: node.childrenWithoutDescendants,
              parentId: node.id,
              selectedReptileName: '',
              visualTraits: [],
              hetTraits: [],
            },
            style: {
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }
          };
          
          flowNodes.push(groupNode);
          
          // Add edge from parent to group
          flowEdges.push({
            id: `${node.id}-${groupNodeId}`,
            source: node.id,
            target: groupNodeId,
            type: 'bezier',
            style: { 
              stroke: '#94a3b8', 
              strokeWidth: 1.5,
              strokeOpacity: 0.6,
              strokeDasharray: '5,5',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
            },
          });
          
          // Add edge from partner parent to group if it exists
          if (partnerNodeId && nodeMap.has(partnerNodeId)) {
            flowEdges.push({
              id: `${partnerNodeId}-${groupNodeId}`,
              source: partnerNodeId,
              target: groupNodeId,
              type: 'bezier',
              style: { 
                stroke: '#94a3b8', 
                strokeWidth: 1.5,
                strokeOpacity: 0.6,
                strokeDasharray: '5,5',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94a3b8',
              },
            });
          }
        }
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
              type: 'bezier',
              style: { 
                stroke: '#e91e63', 
                strokeWidth: isHighlighted ? 2 : 1.5,
                strokeOpacity: isHighlighted ? 1 : 0.6,
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
              type: 'bezier', 
              style: { 
                stroke: '#2196f3', 
                strokeWidth: isHighlighted ? 2 : 1.5,
                strokeOpacity: isHighlighted ? 1 : 0.6,
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
        
        // Add edges to children with descendants (regular nodes)
        for (const child of node.children) {
          const edgeId = `${id}-${child.id}`;
          if (!processedEdges.has(edgeId)) {
            flowEdges.push({
              id: edgeId,
              source: id,
              target: child.id,
              type: 'bezier',
              style: { 
                stroke: child.sex === 'female' ? '#e91e63' : 
                         child.sex === 'male' ? '#2196f3' : '#94a3b8',
                strokeWidth: 1.5,
                strokeOpacity: 0.6,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: child.sex === 'female' ? '#e91e63' : 
                       child.sex === 'male' ? '#2196f3' : '#94a3b8',
              },
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
    
    // Skip group nodes - they are handled internally
    if (node.type === 'group') return;
    
    // Reset if clicking the same node
    if (selectedReptile === node.id) {
      setSelectedReptile('');
      setHighlightedNodes({
        dam: null,
        sire: null,
        child: null
      });
      return;
    }

    setSelectedReptile(node.id);
    
    // Find parents for this node
    const parentInfo = parentRelationships.get(node.id);
    
    // Update highlighted nodes
    setHighlightedNodes({
      dam: parentInfo?.dam || null,
      sire: parentInfo?.sire || null,
      child: node.id
    });
 
  }, [parentRelationships, selectedReptile]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );


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
      <div className="flex items-center mb-1">
        <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
        <div className="flex items-center">
          <span className="text-xs mr-1">Dam</span>
          <Venus className="h-3 w-3 text-red-500" />
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-0.5 bg-slate-400 dashed mr-2" style={{ borderStyle: 'dashed' }}></div>
        <div className="flex items-center">
          <span className="text-xs mr-1">Grouped Offspring</span>
          <Dna className="h-3 w-3 text-primary" />
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
      nodesDraggable={true}
      onNodesChange={onNodesChange} 
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
      <style jsx global>{`
        /* Override ReactFlow node styling for group nodes */
        .react-flow__node-group {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .react-flow__node-group .react-flow__handle {
          opacity: 0 !important;
        }
      `}</style>
      <ReactFlowProvider>
        <Flow reptileId={reptileId} />
      </ReactFlowProvider>
    </div>
  );
}