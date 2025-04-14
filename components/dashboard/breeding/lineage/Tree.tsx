'use client';

import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  Position,
  NodeProps,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useEffect, useState } from 'react';
import { getReptileLineage } from '@/app/api/reptiles/lineage';
import { Badge } from '@/components/ui/badge';
import { SEX_COLORS } from '@/lib/constants/colors';
import { Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';

interface ReptileNode extends Reptile {
  children?: ReptileNode[];
  species_name?: string;
  parents?: {
    dam?: Reptile | null,
    sire?: Reptile | null,
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
}

const CustomNode = ({ data }: NodeProps<CustomNodeData>) => (
  <div className={cn(
    "px-4 py-2 shadow-lg rounded-md border bg-card min-w-[200px]",
    data.isParent === 'dam' && "border-pink-500",
    data.isParent === 'sire' && "border-blue-500"
  )}>
    <Handle type="target" position={Position.Top} />
    <div className="flex flex-col gap-1.5">
      <div className="font-bold">{data.name}</div>
      <div className="text-[0.8rem] text-muted-foreground">{data.morph_name}</div>

      <div className="flex gap-2 justify-center flex-wrap w-full">
        <Badge
          variant="custom"
          className={SEX_COLORS[data.sex.toLowerCase() as keyof typeof SEX_COLORS]}
        >
          {data.sex}
        </Badge>
        {data.generation && (
          <Badge variant="outline">
            Gen {data.generation}
          </Badge>
        )}
        {data.breeding_line && (
          <Badge variant="secondary">
            {data.breeding_line}
          </Badge>
        )}
      </div>
      {data.isParent && (
        <Badge variant="outline" className="mt-1 w-full flex justify-center">
          {data.isParent === 'dam' ? 'Dam' : 'Sire'}
        </Badge>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = {
  custom: CustomNode,
};

export function ReptileTree({ reptileId }: ReptileTreeProps) {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const {morphs} = useMorphsStore();

  const layoutNodes = useCallback((tree: ReptileNode, x = 0, y = 0, level = 0) => {
    const NODE_WIDTH = 250; 
    const LEVEL_HEIGHT = 200; 
    
    const nodes: Node<CustomNodeData>[] = [];
    const edges: Edge[] = [];
  
    // Create node for current reptile
    nodes.push({
      id: tree.id,
      position: { x, y },
      type: 'custom',
      data: {
        name: tree.name,
        species_name: tree.species_name,
        sex: tree.sex,
        generation: tree.generation,
        breeding_line: tree.breeding_line,
        morph_name: morphs.find((morph: Morph) => morph.id.toString() === tree.morph)?.name || '',
      },
    });
  
    // Process parents
    if (tree.parents) {
      if (tree.parents.dam) {
        const damX = x - NODE_WIDTH;
        const damY = y - LEVEL_HEIGHT;
        
        edges.push({
          id: `${tree.parents.dam.id}-${tree.id}`,
          source: tree.parents.dam.id,
          target: tree.id,
          type: 'smoothstep',
        });
  
        const damLayout = layoutNodes(tree.parents.dam, damX, damY, level - 1);
        damLayout.nodes[0].data.isParent = 'dam'; // Add parent type to first node
        nodes.push(...damLayout.nodes);
        edges.push(...damLayout.edges);
      }
  
      if (tree.parents.sire) {
        const sireX = x + NODE_WIDTH;
        const sireY = y - LEVEL_HEIGHT;
  
        edges.push({
          id: `${tree.parents.sire.id}-${tree.id}`,
          source: tree.parents.sire.id,
          target: tree.id,
          type: 'smoothstep',
        });
  
        const sireLayout = layoutNodes(tree.parents.sire, sireX, sireY, level - 1);
        sireLayout.nodes[0].data.isParent = 'sire'; // Add parent type to first node
        nodes.push(...sireLayout.nodes);
        edges.push(...sireLayout.edges);
      }
    }
  
    // Process children
    if (tree.children && tree.children.length > 0) {
      const childrenWidth = NODE_WIDTH * tree.children.length;
      const startX = x - (childrenWidth / 2) + (NODE_WIDTH / 2);
  
      tree.children.forEach((child, index) => {
        const childX = startX + (index * NODE_WIDTH);
        const childY = y + LEVEL_HEIGHT;
  
        // Create edge from parent to child
        edges.push({
          id: `${tree.id}-${child.id}`,
          source: tree.id,
          target: child.id,
          type: 'smoothstep',
          sourceHandle: Position.Bottom,
          targetHandle: Position.Top,
        });
  
        // Recursively layout child nodes
        const childLayout = layoutNodes(child, childX, childY, level + 1);
        nodes.push(...childLayout.nodes);
        edges.push(...childLayout.edges);
      });
    }
  
    return { nodes, edges };
  }, []);

  useEffect(() => {
    const loadLineage = async () => {
      try {
        const lineageData = await getReptileLineage(reptileId);
        const layout = layoutNodes(lineageData);
        setNodes(layout.nodes);
        setEdges(layout.edges);
      } catch (error) {
        console.error('Failed to load reptile lineage:', error);
      }
    };

    loadLineage();
  }, [reptileId, layoutNodes]);

  return (
    <div style={{ width: '100%', height: '800px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4}}
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}