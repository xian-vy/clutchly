'use client';

import { getReptileLineage } from '@/app/api/reptiles/lineage';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';
import { Reptile } from '@/lib/types/reptile';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
  NodeChange,
  ReactFlowProvider,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import GroupNode from './GroupNode';
import Legend from './Legend';
import { CustomNodeData, ReptileNode } from './types';

interface FlowChartProps {
  reptileId: string;
  reptiles : Reptile[];
  isFeature? :boolean
}
function Flow({ reptileId,reptiles,isFeature }: FlowChartProps) {
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
  const [initialLayoutDone, setInitialLayoutDone] = useState<boolean>(false);
  // Use a ref instead of state for positions to avoid re-renders
  const nodePositionsRef = useRef<Map<string, { x: number, y: number }>>(new Map());
  
  const { morphs } = useMorphsStore();
  
  // Define node types with memo to pass reptiles prop
  const customNodeTypes = useMemo(() => ({
    custom: (props: NodeProps<CustomNodeData>) => <CustomNode {...props} reptiles={reptiles} />,
    group: (props: NodeProps<CustomNodeData>) => <GroupNode {...props} reptiles={reptiles} />
  }), [reptiles]);

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
        const HORIZONTAL_SPACING = 100;
        
        // Get position either from memory or calculate new position
        let x, y;
        
        if (initialLayoutDone && nodePositionsRef.current.has(reptileNode.id)) {
          // Use stored position if available after initial layout
          const storedPosition = nodePositionsRef.current.get(reptileNode.id)!;
          x = storedPosition.x;
          y = storedPosition.y;
        } else {
          // Calculate horizontal position
          const totalWidth = (nodesInGeneration.length * NODE_WIDTH) + 
                            ((nodesInGeneration.length - 1) * HORIZONTAL_SPACING);
          const startX = -totalWidth / 2;
          
          x = startX + (position * (NODE_WIDTH + HORIZONTAL_SPACING));
          y = generation * Y_SPACING;
        }
        
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
          const HORIZONTAL_SPACING = 100;
          
          // Calculate x position - find other parent and position between them if possible
          let x = 0;
          let y = 0;
          let partnerNodeId = null;
          
          if (initialLayoutDone && nodePositionsRef.current.has(groupNodeId)) {
            // Use stored position if available after initial layout
            const storedPosition = nodePositionsRef.current.get(groupNodeId)!;
            x = storedPosition.x;
            y = storedPosition.y;
          } else {
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
            
            y = generation * Y_SPACING;
          }
          
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
    [morphs, reptileId, selectedReptile, highlightedNodes, initialLayoutDone, reptiles],
  );

  useEffect(() => {
    const loadLineage = async () => {
      try {
        if (!reptileId || reptiles.length === 0) return;
        
        // Pass cached reptiles to the lineage function
        const lineageData = await getReptileLineage(reptileId, reptiles);
        
        // Create the initial layout
        const { nodes, edges } = createFlowElements(lineageData);
        
        // Set the initial layout
        setNodes(nodes);
        setEdges(edges);
        
        // Store all initial node positions in the ref
        nodePositionsRef.current = new Map();
        nodes.forEach(node => {
          nodePositionsRef.current.set(node.id, { x: node.position.x, y: node.position.y });
        });
        
        // Mark initial layout as complete
        setInitialLayoutDone(true);
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

    // Find parents for this node
    const parentInfo = parentRelationships.get(node.id);
    
    // Batch state updates to improve performance
    setSelectedReptile(node.id);
    setHighlightedNodes({
      dam: parentInfo?.dam || null,
      sire: parentInfo?.sire || null,
      child: node.id
    });
  }, [parentRelationships, selectedReptile]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes to nodes
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        
        // Only update positions for position type changes
        changes.forEach(change => {
          if (change.type === 'position' && change.position) {
            nodePositionsRef.current.set(change.id, { 
              x: change.position.x, 
              y: change.position.y 
            });
          }
        });
        
        return updatedNodes;
      });
    },
    [setNodes]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={customNodeTypes}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.5 }}
      minZoom={0.1}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      attributionPosition="bottom-left"
      nodesDraggable={true}
      onNodesChange={onNodesChange} 
      proOptions={{ hideAttribution: true }}
    >
      {!isFeature && <Legend /> }
      <Controls />
      <Background />
    </ReactFlow>
  );
}

// Main component that wraps everything with the ReactFlowProvider
const FlowChart = ({ reptileId, reptiles, isFeature }: FlowChartProps) => {
  return (
    <div style={{ width: '100%', height:  isFeature ? '500px' : "800px"}}>
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
        <Flow reptileId={reptileId} reptiles={reptiles} isFeature={isFeature} />
      </ReactFlowProvider>
    </div>
  );
};

export default FlowChart; 