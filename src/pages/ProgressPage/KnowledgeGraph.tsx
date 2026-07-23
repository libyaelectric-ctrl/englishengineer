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

  // Split label into lines for clean multi-line display if label is long
  const words = node.label.split(' ');
  const lines =
    words.length > 2
      ? [
          words.slice(0, Math.ceil(words.length / 2)).join(' '),
          words.slice(Math.ceil(words.length / 2)).join(' '),
        ]
      : [node.label];

  return (
    <g
      key={node.id}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => setSelectedGraphNode(node)}
      className="cursor-pointer group"
    >
      <circle
        r={node.size + 6}
        fill="transparent"
        stroke={node.color}
        strokeWidth={isSelected ? 2.5 : 0}
        opacity={0.4}
        className="transition-all duration-300"
      />
      <circle
        r={node.size}
        fill={node.color}
        opacity={highlighted ? 1 : 0.3}
        className="transition-all duration-300 group-hover:scale-110"
      />
      <text
        y={node.size + 14}
        textAnchor="middle"
        className="text-[10px] font-bold select-none"
        fill="currentColor"
        opacity={highlighted ? 1 : 0.4}
      >
        {lines.map((line, i) => (
          <tspan key={i} x="0" dy={i === 0 ? 0 : 12}>
            {line}
          </tspan>
        ))}
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
    <div className="rounded-xl border border-[#0047bb]/25 bg-surface shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="px-5 pt-4 pb-3 border-b border-border-soft flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-[#0047bb]" />
            <h3 className="text-sm font-bold text-foreground">
              Knowledge Graph
            </h3>
          </div>
          <p className="text-[11px] text-muted-copy mt-0.5 font-medium">
            Click nodes to explore connections and target skills.
          </p>
        </div>
      </div>
      <div
        className="relative w-full bg-surface-hover/30 select-none overflow-hidden"
        style={{ minHeight: '340px', maxHeight: '440px' }}
      >
        <svg
          viewBox="0 0 800 460"
          className="w-full h-auto max-h-[420px] mx-auto"
        >
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
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <p className="bg-surface/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#0047bb]/30 text-xs font-bold text-[#0047bb] animate-pulse uppercase tracking-wider shadow-sm">
              Click a node to explore
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
