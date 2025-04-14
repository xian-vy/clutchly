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
import { SEX_COLORS } from '@/lib/constants/colors';
import { Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';

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
      data.isParent === 'dam' && 'text-red-400',
      data.isParent === 'sire' && 'text-blue-500',
      data.isSelected && 
        'ring-1 ring-primary shadow-2xl  bg-primary/5 border-primary z-50'
    )}
  >
    <Handle type="target" position={Position.Top} />
    <div className="flex flex-col gap-1.5">
      <div className="font-bold">{data.name || 'Unknown'}</div>
      <div className="text-[0.8rem] text-muted-foreground">{data.morph_name || 'N/A'}</div>
      <div className="flex gap-2 justify-center flex-wrap w-full">
        {/* <Badge
          variant="custom"
          className={SEX_COLORS[data.sex.toLowerCase() as keyof typeof SEX_COLORS] || 'bg-gray-500'}
        >
          {data.sex || 'Unknown'}
        </Badge> */}
        {data.generation && (
          <Badge variant="outline">Gen {data.generation}</Badge>
        )}
        {data.breeding_line && (
          <Badge variant="secondary">{data.breeding_line}</Badge>
        )}
      </div>
      {/* {data.isParent && (
        <Badge variant="outline" className="mt-1 w-full flex justify-center">
          {data.isParent === 'dam' ? 'Dam' : 'Sire'}
        </Badge>
      )} */}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = { custom: CustomNode };

export function ReptileTree({ reptileId }: ReptileTreeProps) {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { morphs } = useMorphsStore();

  const layoutNodes = useCallback(
    (tree: ReptileNode, x = 0, y = 0, level = 0, nodeMap = new Map<string, Node<CustomNodeData>>()) => {
      const BASE_NODE_WIDTH = 250;
      const LEVEL_HEIGHT = 200;

      const nodes: Node<CustomNodeData>[] = [];
      const edges: Edge[] = [];

      // Skip if node already processed
      if (nodeMap.has(tree.id)) return { nodes: [], edges: [] };

      // Create node
      const morphName = morphs.find((m: Morph) => m.id.toString() === tree.morph)?.name || 'Unknown';
      const node: Node<CustomNodeData> = {
        id: tree.id,
        position: { x, y },
        type: 'custom',
        data: {
          name: tree.name,
          species_name: tree.species,
          sex: tree.sex,
          generation: tree.generation,
          breeding_line: tree.breeding_line,
          morph_name: morphName,
          isSelected: tree.id === reptileId,  
        },
      };
      nodes.push(node);
      nodeMap.set(tree.id, node);

      // Process parents
      const parentWidth = BASE_NODE_WIDTH * 1.5;
      if (tree.parents) {
        if (tree.parents.dam) {
          const damX = x - parentWidth;
          const damY = y - LEVEL_HEIGHT;
          const damEdgeId = `${tree.parents.dam.id}-${tree.id}`;
          if (!edges.some((e) => e.id === damEdgeId)) {
            edges.push({
              id: damEdgeId,
              source: tree.parents.dam.id,
              target: tree.id,
              type: 'smoothstep',
            });
          }
          const damLayout = layoutNodes(tree.parents.dam, damX, damY, level - 1, nodeMap);
          damLayout.nodes[0]?.data && (damLayout.nodes[0].data.isParent = 'dam');
          nodes.push(...damLayout.nodes);
          edges.push(...damLayout.edges);
        }
        if (tree.parents.sire) {
          const sireX = x + parentWidth;
          const sireY = y - LEVEL_HEIGHT;
          const sireEdgeId = `${tree.parents.sire.id}-${tree.id}`;
          if (!edges.some((e) => e.id === sireEdgeId)) {
            edges.push({
              id: sireEdgeId,
              source: tree.parents.sire.id,
              target: tree.id,
              type: 'smoothstep',
            });
          }
          const sireLayout = layoutNodes(tree.parents.sire, sireX, sireY, level - 1, nodeMap);
          sireLayout.nodes[0]?.data && (sireLayout.nodes[0].data.isParent = 'sire');
          nodes.push(...sireLayout.nodes);
          edges.push(...sireLayout.edges);
        }
      }

      // Process children
      if (tree.children?.length) {
        const childCount = tree.children.length;
        const childrenWidth = BASE_NODE_WIDTH * childCount;
        const startX = x - childrenWidth / 2 + BASE_NODE_WIDTH / 2;

        tree.children.forEach((child, index) => {
          const childX = startX + index * BASE_NODE_WIDTH;
          const childY = y + LEVEL_HEIGHT;
          const edgeId = `${tree.id}-${child.id}`;
          if (!edges.some((e) => e.id === edgeId)) {
            edges.push({
              id: edgeId,
              source: tree.id,
              target: child.id,
              type: 'smoothstep',
              sourceHandle: Position.Bottom,
              targetHandle: Position.Top,
            });
          }
          const childLayout = layoutNodes(child, childX, childY, level + 1, nodeMap);
          nodes.push(...childLayout.nodes);
          edges.push(...childLayout.edges);
        });
      }

      return { nodes, edges };
    },
    [morphs,reptileId],
  );

  useEffect(() => {
    const loadLineage = async () => {
      try {
        const lineageData = await getReptileLineage(reptileId);
        const { nodes, edges } = layoutNodes(lineageData);
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error('Failed to load reptile lineage:', error);
        setNodes([]);
        setEdges([]);
      }
    };
    loadLineage();
  }, [reptileId, layoutNodes]);

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