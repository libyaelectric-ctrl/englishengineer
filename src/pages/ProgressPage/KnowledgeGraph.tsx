import { Network } from 'lucide-react';
import {
  GRAPH_NODES,
  GRAPH_LINKS,
  type GraphNode,
} from '@/pages/CurriculumPage/curriculum-data';

const isLinkHighlighted = (
  link: (typeof GRAPH_LINKS)[number],
  selectedGraphNode: GraphNode | null
): boolean => {
  if (!selectedGraphNode) return false;
  return (
    selectedGraphNode.id === link.source || selectedGraphNode.id === link.target
  );
};

const isNodeHighlighted = (
  node: GraphNode,
  selectedGraphNode: GraphNode | null
): boolean => {
  if (!selectedGraphNode) return true;
  return (
    selectedGraphNode.id === node.id ||
    selectedGraphNode.connections.includes(node.id)
  );
};

const GraphLink = ({
  link,
  idx,
  selectedGraphNode,
}: {
  link: (typeof GRAPH_LINKS)[number];
  idx: number;
  selectedGraphNode: GraphNode | null;
}) => {
  const source = GRAPH_NODES.find((n) => n.id === link.source);
  const target = GRAPH_NODES.find((n) => n.id === link.target);
  if (!source || !target) return null;
  const highlighted = isLinkHighlighted(link, selectedGraphNode);
  return (
    <line
      key={idx}
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke={highlighted ? '#0047bb' : '#e2e8f0'}
      strokeWidth={highlighted ? 2.5 : 1.2}
      strokeDasharray={
        link.source.startsWith('topic') || link.target.startsWith('topic')
          ? '4 4'
          : undefined
      }
      opacity={selectedGraphNode && !highlighted ? 0.2 : 0.6}
      className="transition-all duration-300"
    />
  );
};

const GraphNodeElement = ({
  node,
  selectedGraphNode,
  setSelectedGraphNode,
}: {
  node: GraphNode;
  selectedGraphNode: GraphNode | null;
  setSelectedGraphNode: (node: GraphNode | null) => void;
}) => {
  const isSelected = selectedGraphNode?.id === node.id;
  const highlighted = isNodeHighlighted(node, selectedGraphNode);
  return (
    <g
      key={node.id}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => setSelectedGraphNode(node)}
      className="cursor-pointer"
    >
      <circle
        r={node.size + 6}
        fill="transparent"
        stroke={node.color}
        strokeWidth={isSelected ? 2 : 0}
        opacity={0.4}
        className="transition-all duration-300"
      />
      <circle
        r={node.size}
        fill={node.color}
        opacity={highlighted ? 1 : 0.25}
        className="transition-all duration-300"
      />
      <text
        y={node.size + 14}
        textAnchor="middle"
        className="text-[10px] font-bold"
        fill="currentColor"
        opacity={highlighted ? 1 : 0.25}
      >
        {node.label}
      </text>
    </g>
  );
};

export const KnowledgeGraph = ({
  selectedGraphNode,
  setSelectedGraphNode,
}: {
  selectedGraphNode: GraphNode | null;
  setSelectedGraphNode: (node: GraphNode | null) => void;
}) => {
  return (
    <div className="rounded-[4px] border border-border-soft bg-surface shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="px-5 pt-4 pb-3 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-[#0047bb]" />
          <h3 className="text-sm font-bold text-foreground">Knowledge Graph</h3>
        </div>
        <p className="text-[11px] text-muted-copy mt-0.5 font-medium">
          Click nodes to explore connections.
        </p>
      </div>
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-surface-hover select-none">
        <svg viewBox="0 0 800 500" className="h-full w-full">
          {GRAPH_LINKS.map((link, idx) => (
            <GraphLink
              key={idx}
              link={link}
              idx={idx}
              selectedGraphNode={selectedGraphNode}
            />
          ))}
          {GRAPH_NODES.map((node) => (
            <GraphNodeElement
              key={node.id}
              node={node}
              selectedGraphNode={selectedGraphNode}
              setSelectedGraphNode={setSelectedGraphNode}
            />
          ))}
        </svg>
        {!selectedGraphNode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="bg-surface/80 backdrop-blur-sm px-3 py-1.5 rounded-[4px] border border-border-soft text-xs font-bold text-muted-copy animate-pulse uppercase tracking-wider shadow-sm">
              Click a node to explore
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
