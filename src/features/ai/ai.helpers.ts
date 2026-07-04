import { ProgressService } from '@/core/learning/progress.service';
import { LearningState } from '@/core/learning/learning.types';
import { IdService } from '@/core/ids/id.service';
import { UserProfile } from '@/features/auth/auth.types';
import { VocabularyService } from '@/features/vocabulary';
import {
  AICoachContext,
  AICoachMode,
  AICoachModeId,
  AICoachResult,
  AIPromptTemplate,
} from './ai.types';

export const AI_COACH_MODES: AICoachMode[] = [
  {
    id: 'site_report_writer',
    name: 'Site Report Writer',
    description: 'Turn rough site notes into a clear daily engineering report.',
    operation: 'rewriteText',
    placeholder:
      'Paste rough site observations, progress notes, constraints, manpower, delays, and actions.',
    templateIds: ['hospital_electrical_site_report', 'commissioning_update'],
  },
  {
    id: 'consultant_reply_assistant',
    name: 'Consultant Reply Assistant',
    description:
      'Draft respectful, technically precise replies to consultant comments.',
    operation: 'rewriteText',
    placeholder:
      'Paste the consultant comment and your rough technical response.',
    templateIds: ['consultant_inspection_comment', 'material_submittal_reply'],
  },
  {
    id: 'technical_email_assistant',
    name: 'Technical Email Assistant',
    description: 'Convert rough notes into professional project emails.',
    operation: 'rewriteText',
    placeholder:
      'Paste rough email notes for a client, consultant, supplier, or subcontractor.',
    templateIds: ['material_submittal_reply', 'generator_testing_issue'],
  },
  {
    id: 'ncr_response_assistant',
    name: 'NCR Response Assistant',
    description:
      'Structure non-conformance responses with cause, correction, and prevention.',
    operation: 'generatePractice',
    placeholder:
      'Paste the NCR description, root cause, correction, and evidence available.',
    templateIds: ['qa_qc_ncr_response'],
  },
  {
    id: 'delay_explanation_assistant',
    name: 'Delay Explanation Assistant',
    description: 'Explain project delays clearly without sounding defensive.',
    operation: 'rewriteText',
    placeholder:
      'Paste the delay reason, impact, mitigation, and revised date.',
    templateIds: ['cable_tray_delay'],
  },
  {
    id: 'meeting_preparation_coach',
    name: 'Meeting Preparation Coach',
    description:
      'Prepare talking points, risks, decisions, and action wording.',
    operation: 'generateStudyPlan',
    placeholder:
      'Describe the meeting topic, attendees, open issues, and decision needed.',
    templateIds: ['fat_preparation', 'fire_alarm_integration_issue'],
  },
  {
    id: 'vocabulary_explainer',
    name: 'Vocabulary Explainer',
    description:
      'Explain engineering vocabulary with examples and collocations.',
    operation: 'generatePractice',
    placeholder:
      'Enter engineering terms you want explained in simple professional English.',
  },
  {
    id: 'grammar_explainer',
    name: 'Grammar Explainer',
    description: 'Explain grammar problems inside engineering sentences.',
    operation: 'analyzeText',
    placeholder: 'Paste sentences that sound wrong or unclear.',
  },
  {
    id: 'roleplay_simulator',
    name: 'Roleplay Simulator',
    description:
      'Practice realistic engineer-to-consultant or engineer-to-client dialogue.',
    operation: 'generatePractice',
    placeholder:
      'Describe the roleplay scenario, your role, and the other person.',
  },
  {
    id: 'daily_learning_planner',
    name: 'Daily Learning Planner',
    description:
      'Create a focused daily practice plan from your current progress.',
    operation: 'generateStudyPlan',
    placeholder:
      'Tell the copilot how much time you have today and your priority.',
  },
  {
    id: 'career_mentor',
    name: 'Career Mentor',
    description:
      'Connect English practice with interviews, promotion, and international roles.',
    operation: 'analyzeProgress',
    placeholder:
      'Describe a career conversation, interview answer, or professional goal.',
  },
  {
    id: 'writing_reviewer',
    name: 'Writing Reviewer',
    description:
      'Review any engineering text for tone, grammar, clarity, and CEFR signal.',
    operation: 'evaluateEngineeringEnglish',
    placeholder:
      'Paste your engineering message, report paragraph, email, or response.',
  },
  {
    id: 'document_analysis_assistant',
    name: 'Document Upload & Analysis',
    description:
      'Upload a document (PDF, TXT, DOCX) to summarize and analyze technical constraints.',
    operation: 'rewriteText',
    placeholder:
      'Upload your document or paste its content here to get a professional summary and analysis of technical requirements.',
  },
  {
    id: 'linkedin_optimizer',
    name: 'LinkedIn Profile Optimizer',
    description:
      'Optimize your professional bio, experience descriptions, and headlines for international engineering roles.',
    operation: 'rewriteText',
    placeholder:
      'Paste your current LinkedIn headline, about summary, and job descriptions.',
  },
  {
    id: 'custom_scenario_generator',
    name: 'Custom Scenario Generator',
    description:
      'Generate custom technical English reading or writing exercises from your uploaded documents.',
    operation: 'generatePractice',
    placeholder:
      'Describe the scenario you want to practice based on your documents (e.g., NCR negotiation, safety briefing).',
  },
  {
    id: 'project_copilot_agent',
    name: 'Project Copilot Agent',
    description:
      'Dynamic project copilot assistant using your active workspace memory and custom rules.',
    operation: 'rewriteText',
    placeholder:
      'Ask the Copilot Agent anything about the project scope, standards, or guidelines in your active workspace.',
  },
  {
    id: 'cv_optimizer',
    name: 'CV / Resume Optimizer',
    description:
      'Optimize your professional engineering CV/Resume experience bullet points and profiles for global jobs.',
    operation: 'rewriteText',
    placeholder:
      'Paste your current CV introduction, target job description, or skills list to optimize.',
  },
];

export const AI_PROMPT_TEMPLATES: AIPromptTemplate[] = [
  {
    id: 'hospital_electrical_site_report',
    title: 'Hospital Electrical Site Report',
    description: 'Daily report for electrical works inside a hospital project.',
    modeId: 'site_report_writer',
    prompt:
      'Write a professional site report for hospital electrical works. Notes: LV panel delivery completed, cable pulling started in basement level B2, access delay near operating theatre corridor, 18 electricians on site, consultant inspection planned tomorrow, action required from civil team to clear blocked riser opening.',
  },
  {
    id: 'lv_panel_issue',
    title: 'LV Panel Issue',
    description: 'Explain a technical issue found in a low-voltage panel.',
    modeId: 'technical_email_assistant',
    prompt:
      'Draft a technical email explaining an LV panel issue. Notes: phase B busbar hotspot found during thermographic inspection, 85 degrees Celsius under load, possible loose joint or oxidation, request shutdown window for cleaning, retorque, and reinspection.',
  },
  {
    id: 'cable_tray_delay',
    title: 'Cable Tray Delay',
    description: 'Delay explanation with mitigation actions.',
    modeId: 'delay_explanation_assistant',
    prompt:
      'Prepare a delay explanation for cable tray installation. Notes: delivery of heavy-duty tray supports delayed by supplier, installation affected on level 4 corridor, mitigation is resequencing manpower to level 2 and requesting partial delivery by Friday.',
  },
  {
    id: 'consultant_inspection_comment',
    title: 'Consultant Inspection Comment',
    description: 'Respond to a consultant site inspection comment.',
    modeId: 'consultant_reply_assistant',
    prompt:
      'Draft a consultant reply. Comment: cable tray clearance above ceiling is insufficient near gridline C4. Contractor note: tray can be lowered by 75 mm after coordination with HVAC duct route. Include action, target date, and evidence to submit.',
  },
  {
    id: 'material_submittal_reply',
    title: 'Material Submittal Reply',
    description: 'Formal reply for missing material submittal details.',
    modeId: 'consultant_reply_assistant',
    prompt:
      'Write a material submittal reply. Notes: consultant requested updated pump curve, warranty certificate, and country of origin. Supplier will issue revised documents today. Contractor will resubmit under same submittal reference with revision 02.',
  },
  {
    id: 'generator_testing_issue',
    title: 'Generator Testing Issue',
    description: 'Explain generator test observations and next action.',
    modeId: 'technical_email_assistant',
    prompt:
      'Draft a technical email for generator testing issue. Notes: transient voltage dip reached 14 percent during 50 percent step load, frequency recovered within 2.8 seconds, fuel pressure dip observed, need to adjust bypass regulator before second test run.',
  },
  {
    id: 'fire_alarm_integration_issue',
    title: 'Fire Alarm Integration Issue',
    description: 'Meeting prep for fire alarm interface problem.',
    modeId: 'meeting_preparation_coach',
    prompt:
      'Prepare meeting talking points for fire alarm integration issue. Notes: smoke detector activation does not close fire smoke damper on level 3, BMS point mapping may be incorrect, elevator recall must remain isolated during retest.',
  },
  {
    id: 'fat_preparation',
    title: 'FAT Preparation',
    description: 'Checklist and meeting language for FAT.',
    modeId: 'meeting_preparation_coach',
    prompt:
      'Prepare a FAT meeting brief for LV control panels. Include agenda, required documents, test instruments calibration, loop checks, dielectric test, primary current injection sample, acceptance criteria, and open risks.',
  },
  {
    id: 'commissioning_update',
    title: 'Commissioning Update',
    description: 'Status update for commissioning progress.',
    modeId: 'site_report_writer',
    prompt:
      'Write a commissioning update. Notes: chilled water pump testing completed, BMS trend logs pending, two valve actuators failed feedback signal, TAB team scheduled tomorrow, final witness test targeted next Tuesday.',
  },
  {
    id: 'qa_qc_ncr_response',
    title: 'QA/QC NCR Response',
    description: 'Corrective response for non-conformance.',
    modeId: 'ncr_response_assistant',
    prompt:
      'Draft an NCR response. Non-conformance: cable tray installed without approved support spacing. Root cause: outdated shop drawing used by subcontractor. Correction: add intermediate supports and submit photo evidence. Prevention: drawing control briefing and latest revision stamp check before installation.',
  },
  {
    id: 'cv_optimization_sample',
    title: 'CV Bullet Point Optimizer',
    description: 'Enhance resume bullet points to highlight impact and metrics.',
    modeId: 'cv_optimizer',
    prompt:
      'Optimize these CV bullet points for a Senior Electrical Engineer. Rough points: "Responsible for electrical design. Led a team of 4. Did cable sizing and calculations. Attended site meetings and coordinated with other teams."',
  },
  {
    id: 'linkedin_headline_bio',
    title: 'LinkedIn Headline & Bio',
    description: 'Draft a compelling global-ready LinkedIn bio and headline.',
    modeId: 'linkedin_optimizer',
    prompt:
      'Draft an optimized LinkedIn headline and professional summary. Context: I am a Civil Project Engineer with 6 years experience in tunnel construction. I want to highlight my knowledge of NATM tunneling method, international project coordination, and PM skills.',
  },
  {
    id: 'custom_ncr_roleplay',
    title: 'Custom Roleplay Scenario',
    description: 'Generate a roleplay script based on technical scope.',
    modeId: 'custom_scenario_generator',
    prompt:
      'Generate a custom engineering communication scenario. Scenario focus: A dispute over concrete compressive strength results at 28 days (found to be 32 MPa instead of the specified 40 MPa). Provide a roleplay script practicing negotiation with a client representative.',
  },
  {
    id: 'workspace_copilot_scope',
    title: 'Workspace Memory Inquiry',
    description: 'Query project guidelines and rules from memory.',
    modeId: 'project_copilot_agent',
    prompt:
      'Analyze the active project guidelines in my workspace. Based on these rules, what are the key communication protocols and documentation standards we need to enforce for subcontractor submittals?',
  },
];

export const getCoachModeById = (modeId: AICoachModeId): AICoachMode =>
  AI_COACH_MODES.find((mode) => mode.id === modeId) || AI_COACH_MODES[0];

export const getTemplatesForMode = (
  modeId: AICoachModeId
): AIPromptTemplate[] =>
  AI_PROMPT_TEMPLATES.filter((template) => template.modeId === modeId);

export const summarizeUserProgress = (
  learningState: LearningState
): string[] => {
  const summary = ProgressService.getSummary(learningState);
  return [
    `Level ${summary.level}`,
    `${summary.elo} ELO`,
    `${summary.averageScore}% average score`,
    `${summary.completedMissionsCount}/${summary.totalMissionsCount} missions completed`,
    `${summary.streak} day streak`,
  ];
};

export const getWeakestSkills = (learningState: LearningState): string[] => {
  const skills = ProgressService.getSkillAnalysis(learningState);
  return skills.weakSkills;
};

export const getRecommendedFocus = (learningState: LearningState): string => {
  const weakSkills = getWeakestSkills(learningState).filter(
    (skill) => skill !== 'None'
  );
  if (weakSkills.length > 0) return weakSkills[0];

  const recent = learningState.studySessions.slice(-1)[0]?.module;
  return recent || 'Writing';
};

export const buildCoachContext = (
  user: UserProfile | null,
  learningState: LearningState
): AICoachContext => {
  const progress = ProgressService.getSummary(learningState);
  const skills = ProgressService.getSkillAnalysis(learningState);
  const vocabulary = VocabularyService.getSummary();
  const recentActivities = learningState.studySessions
    .slice(-5)
    .reverse()
    .map(
      (session) =>
        `${session.module}: ${session.score}% (${session.durationMinutes} min)`
    );

  return {
    userName: user?.displayName || 'Engineer',
    role: user?.role || 'Learner',
    discipline: user?.engineeringDiscipline || 'General Engineering',
    targetLevel: user?.targetLevel || 'B2',
    xp: progress.xp,
    level: progress.level,
    elo: progress.elo,
    streak: progress.streak,
    averageScore: progress.averageScore,
    completedMissions: progress.completedMissionsCount,
    totalMissions: progress.totalMissionsCount,
    weakSkills: skills.weakSkills,
    strongSkills: skills.strongSkills,
    recentActivities,
    weakVocabulary: vocabulary.weakVocabulary
      .map((entry) => entry.word)
      .slice(0, 8),
    wordsLearned: vocabulary.wordsLearned,
    vocabularyRetention: vocabulary.retentionPercentage,
    recommendedFocus: getRecommendedFocus(learningState),
  };
};

export const createCoachSessionId = (): string =>
  IdService.createId('ai_coach');

export const formatCoachResult = (result: AICoachResult): string =>
  [
    `Summary\n${result.summary}`,
    `Professional version\n${result.professionalVersion || result.nativeRewrite}`,
    `Simplified version\n${result.simplifiedVersion || result.summary}`,
    `Strengths\n- ${result.strengths.join('\n- ')}`,
    `Weaknesses\n- ${result.weaknesses.join('\n- ')}`,
    `Corrections\n- ${result.corrections.join('\n- ')}`,
    `Tone feedback\n${result.toneFeedback || 'No tone feedback available.'}`,
    `Grammar notes\n- ${(result.grammarNotes || []).join('\n- ')}`,
    `Technical vocabulary\n- ${result.technicalVocabulary.join('\n- ')}`,
    `Recommended next task\n${result.recommendedNextTask}`,
    `Estimated CEFR impact\n${result.estimatedCefrImpact}`,
    `Engineer ELO impact estimate\n${result.engineerEloImpactEstimate || 'Not estimated.'}`,
  ].join('\n\n');
