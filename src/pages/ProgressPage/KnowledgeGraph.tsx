import { Network } from 'lucide-react';
import { GRAPH_NODES, GRAPH_LINKS, type GraphNode } from '@/pages/CurriculumPage/curriculum-data';

export const KnowledgeGraph = ({
  selectedGraphNode,
  setSelectedGraphNode,
}: {
  selectedGraphNode: GraphNode | null;
  setSelectedGraphNode: (node: GraphNode | null) => void;
}) => {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Knowledge Graph
          </h3>
        </div>
        <p className="text-[11px] text-muted-copy mt-0.5">
          Click nodes to explore connections.
        </p>
      </div>
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-surface-hover select-none">
        <svg viewBox="0 0 800 500" className="h-full w-full">
          {GRAPH_LINKS.map((link, idx) => {
            const source = GRAPH_NODES.find((n) => n.id === link.source);
            const target = GRAPH_NODES.find((n) => n.id === link.target);
            if (!source || !target) return null;
            const isHighlighted = selectedGraphNode
              ? selectedGraphNode.id === source.id ||
                selectedGraphNode.id === target.id
              : false;
            return (
              <line
                key={idx}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={
                  isHighlighted ? 'var(--color-primary, #6366f1)' : '#e2e8f0'
                }
                strokeWidth={isHighlighted ? 2.5 : 1.2}
                strokeDasharray={
                  link.source.startsWith('topic') ||
                  link.target.startsWith('topic')
                    ? '4 4'
                    : undefined
                }
                opacity={selectedGraphNode && !isHighlighted ? 0.2 : 0.6}
                className="transition-all duration-300"
              />
            );
          })}
          {GRAPH_NODES.map((node) => {
            const isSelected = selectedGraphNode?.id === node.id;
            const isHighlighted = selectedGraphNode
              ? selectedGraphNode.id === node.id ||
                selectedGraphNode.connections.includes(node.id)
              : true;
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
                  opacity={isHighlighted ? 1 : 0.25}
                  className="transition-all duration-300"
                />
                <text
                  y={node.size + 14}
                  textAnchor="middle"
                  className="text-[10px] font-medium"
                  fill="currentColor"
                  opacity={isHighlighted ? 1 : 0.25}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
        {!selectedGraphNode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-muted-copy animate-pulse">
              Click a node to explore
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
