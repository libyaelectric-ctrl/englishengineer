import { motion } from 'motion/react';
import { Brain, Layers, Network, type LucideIcon } from 'lucide-react';
import { type GraphNode } from '@/pages/CurriculumPage/curriculum-data';
import { SkillCard } from './SkillCard';

export const SkillSidebar = ({
  skills,
  eloScores,
  highestSkill,
  lowestSkill,
  totalCEFR,
  rank,
  selectedGraphNode,
  setSelectedGraphNode,
}: {
  skills: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    bgLight: string;
    textDark: string;
  }>;
  eloScores: Record<string, number>;
  highestSkill: { label: string; icon: LucideIcon };
  lowestSkill: { label: string; icon: LucideIcon };
  totalCEFR: string;
  rank: { icon: string; label: string; color: string };
  selectedGraphNode: GraphNode | null;
  setSelectedGraphNode: (node: GraphNode | null) => void;
}) => {
  return (
    <aside className="relative">
      <div className="xl:sticky xl:top-16 space-y-0 border border-[#d9d9e3] bg-white rounded-[4px] shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="px-4 pt-3 pb-2 border-b border-[#d9d9e3]">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-copy flex items-center gap-1.5">
            <Layers className="h-3 w-3" /> Skill Progress
          </h3>
        </div>
        <div className="p-3 space-y-2">
          {skills.map((skill, index) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              elo={eloScores[skill.id]}
              index={index}
            />
          ))}
        </div>

        <div className="px-4 pt-3 pb-2 border-t border-[#d9d9e3]">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-copy flex items-center gap-1.5">
            <Brain className="h-3 w-3" /> Summary
          </h3>
        </div>
        <div className="px-4 pb-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-copy">Strongest</span>
            <span className="font-bold text-success flex items-center gap-1">
              <highestSkill.icon className="h-3 w-3 text-success" />{' '}
              {highestSkill.label}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-copy">Weakest</span>
            <span className="font-bold text-rose-600 flex items-center gap-1">
              <lowestSkill.icon className="h-3 w-3 text-rose-600" />{' '}
              {lowestSkill.label}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-copy">CEFR</span>
            <span className="font-bold text-foreground">{totalCEFR}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-copy">Rank</span>
            <span className="font-bold text-foreground">
              {rank.icon} {rank.label}
            </span>
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 border-t border-[#d9d9e3]">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-copy flex items-center gap-1.5">
              <Network className="h-3 w-3" /> Inspector
            </h3>
            {selectedGraphNode && (
              <button
                onClick={() => setSelectedGraphNode(null)}
                className="text-[10px] font-bold uppercase text-muted-copy hover:text-[#0047bb] cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="px-4 pb-4">
          {selectedGraphNode ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2.5"
            >
              <div className="flex items-center gap-1.5">
                <span className="rounded-[4px] bg-[#0047bb]/10 px-2 py-0.5 text-[10px] font-bold text-[#0047bb] border border-[#0047bb]/25 uppercase">
                  {selectedGraphNode.type}
                </span>
                <span className="text-[10px] font-bold text-foreground px-1.5 py-0.5 rounded-[4px] bg-[#faf8ff] border border-[#d9d9e3]">
                  {selectedGraphNode.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {selectedGraphNode.label}
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-copy leading-4 font-medium">
                  {selectedGraphNode.description}
                </p>
              </div>
              <div className="bg-[#faf8ff] rounded-[4px] p-2.5 border border-[#d9d9e3] shadow-sm">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-muted-copy uppercase">Strength</span>
                  <span className="text-foreground">
                    {selectedGraphNode.strength}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-[4px] bg-[#d9d9e3]">
                  <div
                    className="h-full rounded-[4px] bg-[#0047bb]"
                    style={{ width: `${selectedGraphNode.strength}%` }}
                  />
                </div>
              </div>
              {selectedGraphNode.relatedVocab &&
                selectedGraphNode.relatedVocab.length > 0 && (
                  <div className="border-t border-[#d9d9e3] pt-2">
                    <h4 className="text-[10px] font-bold text-muted-copy uppercase mb-1.5">
                      Related Words
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedGraphNode.relatedVocab.map((word) => (
                        <span
                          key={word}
                          className="rounded-[4px] bg-white border border-[#d9d9e3] px-1.5 py-0.5 text-[10px] font-bold text-foreground"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </motion.div>
          ) : (
            <div className="text-center py-5 rounded-[4px] border border-dashed border-[#d9d9e3] bg-[#faf8ff]">
              <Network className="h-5 w-5 text-muted-copy mx-auto mb-1.5 opacity-40" />
              <p className="text-[11px] text-muted-copy font-bold uppercase tracking-wider">
                Select a node on the graph
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
