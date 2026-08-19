import { ConceptCPipelineView } from '@/features/learning-path';

const LearningPathPage = () => {
  return (
    <div className="w-full space-y-6 pb-8 font-sans">
      <ConceptCPipelineView showHeroStats={true} />
    </div>
  );
};

export default LearningPathPage;
