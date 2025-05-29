'use client';

import { getReptileLineage } from '@/app/api/reptiles/lineage';
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
import ConnectorNode from './ConnectorNode';
import Legend from './Legend';
import { CustomNodeData, ReptileNode } from './types';
import dagre from 'dagre';
import { Expand, Minimize } from 'lucide-react';

interface FlowChartProps {
  reptileId: string;
  reptiles: Reptile[];
  isFeature?: boolean
  morphs : Morph[]
  onExpand?: () => void
  isFullscreen?: boolean
}

// Constants for layout
const NODE_WIDTH = 250;
const NODE_HEIGHT = 120;
const CONNECTOR_SIZE = 40;

// Layout algorithm helper using dagre library
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configure dagre with our chosen separation values
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,  // Increased horizontal separation between nodes
    ranksep: 150, // Vertical separation between ranks
    align: 'DL',  // Changed from UL to DL for better downward alignment
    marginx: 30,  // Increased margin on x-axis
    marginy: 30,  // Increased margin on y-axis
    edgesep: 80,  // Explicit edge separation
    acyclicer: 'greedy', // Add acyclicer for better handling of cycles
    ranker: 'network-simplex' // Use network-simplex algorithm for better hierarchy
  });

  // Add nodes to the dagre graph with their dimensions
  nodes.forEach((node) => {
    let width = NODE_WIDTH;
    let height = NODE_HEIGHT;

    if (node.type === 'connector') {
      width = CONNECTOR_SIZE;
      height = CONNECTOR_SIZE;
    } else if (node.type === 'group') {
      // Use the same dimensions as regular nodes for consistent spacing
      width = NODE_WIDTH;
      height = NODE_HEIGHT;
    }

    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to the dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Apply the calculated positions to the nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Fix connector node alignment to be truly centered between its sources
    if (node.type === 'connector' && node.data?.connectedDamId && node.data?.connectedSireId) {
      // Find the parent nodes
      const damNode = nodes.find(n => n.id === node.data.connectedDamId);
      const sireNode = nodes.find(n => n.id === node.data.connectedSireId);
      
      // If both parents exist, position connector centered between them
      if (damNode && sireNode) {
        const damPos = dagreGraph.node(damNode.id);
        const sirePos = dagreGraph.node(sireNode.id);
        
        if (damPos && sirePos) {
          // Center the connector between the two parents
          const centerX = (damPos.x + sirePos.x) / 2;
          return {
            ...node,
            position: {
              x: centerX - CONNECTOR_SIZE / 2,
              y: nodeWithPosition.y - CONNECTOR_SIZE + 70,
            },
          };
        }
      }
    }
    
    // For regular nodes and group nodes, adjust position based on type
    let nodeWidth = NODE_WIDTH;
    let nodeHeight = NODE_HEIGHT;
    
    if (node.type === 'connector') {
      nodeWidth = CONNECTOR_SIZE;
      nodeHeight = CONNECTOR_SIZE;
    } else if (node.type === 'group') {
      // For consistent placement, use regular node dimensions in calculation
      nodeWidth = NODE_WIDTH;
      nodeHeight = NODE_HEIGHT;
    }
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function Flow({ reptileId, reptiles, isFeature, morphs }: FlowChartProps) {
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
  
  
  // Define node types with memo to pass reptiles prop
  const customNodeTypes = useMemo(() => ({
    custom: (props: NodeProps<CustomNodeData>) => <CustomNode {...props} reptiles={reptiles} />,
    group: (props: NodeProps<CustomNodeData>) => <GroupNode {...props} reptiles={reptiles} />,
    connector: (props: NodeProps<CustomNodeData>) => <ConnectorNode {...props} />
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
        
        // Get position either from memory or calculate new position
        let x = 0, y = 0;
        
        if (initialLayoutDone && nodePositionsRef.current.has(reptileNode.id)) {
          // Use stored position if available after initial layout
          const storedPosition = nodePositionsRef.current.get(reptileNode.id)!;
          x = storedPosition.x;
          y = storedPosition.y;
        } else {
          // Set dummy initial positions - we'll use dagre for proper layout later
          x = position * 300;
          y = generation * 200;
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
            selectedReptileName: reptiles.find((r: Reptile) => r.id.toString() === selectedReptile)?.name || 'Unknown',
            visualTraits: reptileNode.visual_traits || [],
            hetTraits: reptileNode.het_traits || [],
            code : reptileNode.reptile_code,
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
      
      // Create connector nodes between parents and their children
      // Store created connector nodes to avoid duplicates
      const createdConnectorNodes = new Map<string, string>(); // Map of damId:sireId -> connectorNodeId
      
      // Process each node that has both parents
      for (const reptileId of allTreeNodes.keys()) {
        const parentInfo = parentChildMap.get(reptileId);
        if (!parentInfo || !parentInfo.dam || !parentInfo.sire) continue;
        
        const damId = parentInfo.dam;
        const sireId = parentInfo.sire;
        
        // Skip if either parent is not in our tree
        if (!nodeMap.has(damId) || !nodeMap.has(sireId)) continue;
        
        // Create a consistent key for the parent pair
        const parentPairKey = damId < sireId 
          ? `${damId}:${sireId}`
          : `${sireId}:${damId}`;
        
        // Check if we already created a connector for this parent pair
        let connectorNodeId: string;
        if (createdConnectorNodes.has(parentPairKey)) {
          connectorNodeId = createdConnectorNodes.get(parentPairKey)!;
        } else {
          // Create a new connector node
          connectorNodeId = `connector-${parentPairKey}`;
          createdConnectorNodes.set(parentPairKey, connectorNodeId);
          
          // Initial dummy position - will be adjusted by dagre later
          const connectorNode: Node<CustomNodeData> = {
            id: connectorNodeId,
            position: { x: 0, y: 0 },
            type: 'connector',
            data: {
              name: 'Connector',
              sex: 'unknown',
              morph_name: '',
              isConnectorNode: true,
              connectedDamId: damId,
              connectedSireId: sireId,
              connectedChildrenIds: [reptileId],
              selectedReptileName: '',
              visualTraits: [],
              hetTraits: [],
              code : '',
            }
          };
          
          flowNodes.push(connectorNode);
          
          // Add edges from both parents to the connector node
          // Dam edge (female parent)
          flowEdges.push({
            id: `${damId}-${connectorNodeId}`,
            source: damId,
            target: connectorNodeId,
            type: 'smoothstep',
            style: { 
              stroke: '#e91e63', 
              strokeWidth: 1.5,
            },
            animated: selectedReptile === reptileId, // Animate if this is the selected reptile's parent line
          });
          
          // Sire edge (male parent)
          flowEdges.push({
            id: `${sireId}-${connectorNodeId}`,
            source: sireId,
            target: connectorNodeId,
            type: 'smoothstep',
            style: { 
              stroke: '#2196f3', 
              strokeWidth: 1.5,
            },
            animated: selectedReptile === reptileId, // Animate if this is the selected reptile's parent line
          });
        }
        
        // Add edge from connector to child
        const isHighlighted = highlightedNodes.child === reptileId;
        
        // Add an edge from the connector to the child
        flowEdges.push({
          id: `${connectorNodeId}-${reptileId}`,
          source: connectorNodeId,
          target: reptileId,
          type: 'smoothstep',
          style: { 
            stroke: '#555', 
            strokeWidth: isHighlighted ? 2 : 1.5,
            strokeDasharray: '5,5', // Make all offspring connections dashed
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#555',
          },
          animated: isHighlighted,
        });
      }
      
      // Create group nodes for children without descendants
      const createdGroupNodes = new Map<string, string>(); // Map of parentPair -> groupNodeId
      
      for (const node of allTreeNodes.values()) {
        // Skip if no children without descendants
        if (!node.childrenWithoutDescendants || node.childrenWithoutDescendants.length === 0) {
          continue;
        }
        
        // Get the first offspring to find both parents
        const offspring = node.childrenWithoutDescendants[0];
        if (!offspring || !offspring.dam_id || !offspring.sire_id) {
          continue;
        }
        
        // Create a consistent key for the parent pair
        const parentPairKey = offspring.dam_id < offspring.sire_id 
          ? `${offspring.dam_id}:${offspring.sire_id}`
          : `${offspring.sire_id}:${offspring.dam_id}`;
        
        // Skip if we already created a group node for this parent pair
        if (createdGroupNodes.has(parentPairKey)) {
          continue;
        }
        
        // Get both parent nodes
        const damId = offspring.dam_id;
        const sireId = offspring.sire_id;
        
        if (!nodeMap.has(damId) || !nodeMap.has(sireId)) {
          continue;
        }
        
        // Record that we've created a group node for this parent pair
        const groupNodeId = `group-${parentPairKey}`;
        createdGroupNodes.set(parentPairKey, groupNodeId);
        
        // Initial dummy position - will be adjusted by dagre later
        const groupNode: Node<CustomNodeData> = {
          id: groupNodeId,
          position: { x: 0, y: 0 },
          type: 'group',
          data: {
            name: `Children without descendants`,
            sex: 'unknown',
            morph_name: '',
            isGroupNode: true,
            nodeType: 'childrenWithoutDescendants',
            count: node.childrenWithoutDescendants.length,
            groupedReptiles: node.childrenWithoutDescendants,
            parentIds: [damId, sireId], // Store both parent IDs
            parentNames: [
              reptiles.find((r: Reptile) => r.id === damId)?.name || 'Unknown Dam',
              reptiles.find((r: Reptile) => r.id === sireId)?.name || 'Unknown Sire'
            ],
            selectedReptileName: '',
            visualTraits: [],
            hetTraits: [],
            code : '',
          },
          style: {
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }
        };
        
        flowNodes.push(groupNode);
        
        // Check if a connector node exists for this parent pair
        const connectorKey = parentPairKey;
        const connectorNodeId = createdConnectorNodes.get(connectorKey);
        
        if (connectorNodeId) {
          // Connect the group node to the connector
          flowEdges.push({
            id: `${connectorNodeId}-${groupNodeId}`,
            source: connectorNodeId,
            target: groupNodeId,
            type: 'smoothstep',
            style: { 
              stroke: '#555',  // Changed to gray
              strokeWidth: 1.5,
              strokeDasharray: '5,5', // Make all offspring connections dashed
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#555', // Changed to gray
            },
          });
        } else {
          // If no connector node exists, connect directly to parents (fallback)
          // Dam edge (female)
          flowEdges.push({
            id: `${damId}-${groupNodeId}`,
            source: damId,
            target: groupNodeId,
            type: 'smoothstep',
            style: { 
              stroke: '#555',  // Changed to gray
              strokeWidth: 1.5,
              strokeDasharray: '5,5', // Make all offspring connections dashed
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#555', // Changed to gray
            },
          });
          
          // Sire edge (male)
          flowEdges.push({
            id: `${sireId}-${groupNodeId}`,
            source: sireId,
            target: groupNodeId,
            type: 'smoothstep',
            style: { 
              stroke: '#555',  // Changed to gray
              strokeWidth: 1.5,
              strokeDasharray: '5,5', // Make all offspring connections dashed
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#555', // Changed to gray
            },
          });
        }
      }
      
      // Then create all edges
      const processedEdges = new Set<string>();
      
      for (const [id, node] of allTreeNodes.entries()) {
        // Skip adding direct parent edges since we're now using connector nodes
        // Only add edges for nodes that don't have both parents (since those are handled by connector nodes)
        const parentPairKey = node.parents.dam && node.parents.sire 
          ? (node.parents.dam.id < node.parents.sire.id 
              ? `${node.parents.dam.id}:${node.parents.sire.id}`
              : `${node.parents.sire.id}:${node.parents.dam.id}`)
          : null;

        const hasConnector = parentPairKey && 
                           node.parents.dam && 
                           node.parents.sire && 
                           nodeMap.has(node.parents.dam.id) && 
                           nodeMap.has(node.parents.sire.id) &&
                           // Check if a connector node exists for this parent pair
                           createdConnectorNodes.has(parentPairKey);
        
        if (!hasConnector) {
          // Add parent edges for nodes with only one parent
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
                type: 'smoothstep', 
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
        }
        
        // Add edges to children with descendants (regular nodes)
        for (const child of node.children) {
          const edgeId = `${id}-${child.id}`;
          if (!processedEdges.has(edgeId)) {
            // Check if a connector node exists for this parent-child relationship
            const childParentPairKey = child.parents.dam && child.parents.sire &&
              (child.parents.dam.id === id || child.parents.sire.id === id)
              ? (child.parents.dam.id < child.parents.sire.id 
                  ? `${child.parents.dam.id}:${child.parents.sire.id}`
                  : `${child.parents.sire.id}:${child.parents.dam.id}`)
              : null;
              
            const childHasConnector = childParentPairKey && createdConnectorNodes.has(childParentPairKey);
            
            // Only add the edge if there's no connector node handling this relationship
            if (!childHasConnector) {
              flowEdges.push({
                id: edgeId,
                source: id,
                target: child.id,
                type: 'smoothstep',
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
      }
      
      // Apply automatic layout using dagre
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);
      
      return { nodes: layoutedNodes, edges: layoutedEdges };
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
      onInit={(instance)=> instance.fitView()}
      zoomOnScroll={isFeature ? false : true}  
    >
      {!isFeature &&
       <>
          <Background />
          <Legend />
          <Controls />
       </> 
      }     
    </ReactFlow>
  );
}

// Main component that wraps everything with the ReactFlowProvider
const FlowChart = ({ reptileId, reptiles, isFeature, morphs,onExpand,isFullscreen }: FlowChartProps) => {
  const handleExpand = () => {
    if (onExpand) onExpand();
  };
  return (
    <div className={`relative w-full h-[600px] lg:h-[800px] 3xl:!h-[1000px]`}>
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
        
        /* Styles for connector nodes */
        .react-flow__node-connector {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .react-flow__node-connector .react-flow__handle {
          opacity: 0 !important;
        }
      `}</style>
      {isFullscreen ? 
          <Minimize onClick={handleExpand} className="h-4 w-4 hover:scale-125 text-muted-foreground absolute top-2 right-2 cursor-pointer z-20" /> : 
          isFeature ?  <></> :  <Expand onClick={handleExpand} className="h-4 w-4 hover:scale-125 text-muted-foreground absolute top-2 right-2 cursor-pointer z-20" />
      }
      <ReactFlowProvider>
        <Flow isFullscreen={isFullscreen} onExpand={onExpand} reptileId={reptileId} reptiles={reptiles} isFeature={isFeature} morphs={morphs} />
      </ReactFlowProvider>
    </div>
  );
};

export default FlowChart;