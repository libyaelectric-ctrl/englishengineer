/**
 * Engineering discipline topic progression for the Learning Path pipeline.
 *
 * Each discipline has an ordered list of topics that represent the progression
 * from foundational (A1-A2) through operational (B1), technical (B2), to
 * contractual & leadership (C1-C2) levels.
 *
 * Topics are derived from real-world engineering vocabulary domains and
 * match the CEFR band progression in the vocabulary corpus.
 */
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

export const DISCIPLINE_TOPIC_KEYWORDS: Record<EngineeringDiscipline, string[]> = {
  architecture: [
    'Safety Protocols',
    'Drawing Standards',
    'Spatial Planning',
    'Material Specifications',
    'BIM Fundamentals',
    'Structural Concepts',
    'Environmental Controls',
    'Construction Documentation',
    'Design Coordination',
    'Project Management',
  ],

  chemical: [
    'Process Safety',
    'Chemical Handling',
    'Lab Equipment',
    'Process Flow Diagrams',
    'Reaction Engineering',
    'Distillation Systems',
    'Heat Exchangers',
    'Process Control',
    'Environmental Compliance',
    'Plant Operations',
  ],

  civil: [
    'Site Safety',
    'Surveying Tools',
    'Concrete Technology',
    'Soil Mechanics',
    'Structural Steel',
    'Foundation Systems',
    'Road & Pavement',
    'Bridge Engineering',
    'Hydraulic Structures',
    'Project Supervision',
  ],

  electrical: [
    'Safety Standards',
    'Multimeters & Tools',
    'Circuit Schematics',
    'Fault Diagnostics',
    'Power Distribution',
    'Automation & Control',
    'High Voltage Grid',
    'Transformers',
    'Protection Relays',
    'Substation Operations',
  ],

  electronics: [
    'ESD Protection',
    'Component Testing',
    'PCB Design',
    'Soldering Techniques',
    'Signal Analysis',
    'Embedded Programming',
    'FPGA Configuration',
    'RF Systems',
    'Semiconductor Fabrication',
    'Product Validation',
  ],

  hse: [
    'Risk Assessment',
    'PPE Requirements',
    'Fire Safety',
    'Confined Space Entry',
    'Lockout/Tagout',
    'Incident Investigation',
    'Environmental Monitoring',
    'Emergency Response',
    'Audit & Compliance',
    'Safety Leadership',
  ],

  industrial: [
    'Workplace Organization',
    'Time Study',
    'Quality Control',
    'Inventory Management',
    'Lean Manufacturing',
    'Supply Chain Basics',
    'Production Planning',
    'Continuous Improvement',
    'Six Sigma Methods',
    'Operations Management',
  ],

  mechanical: [
    'Safety Protocols',
    'Technical Tools',
    'Systems Basics',
    'Diagnostics',
    'Troubleshooting',
    'Automation & Control',
    'Thermodynamics',
    'Fluid Mechanics',
    'Structural Rigidity',
    'Plant Commissioning',
  ],

  mechatronics: [
    'Sensor Calibrations',
    'Actuator Tools',
    'Microcontroller IO',
    'PID Diagnostics',
    'PLC Troubleshooting',
    'Robotics & Control',
    'Signal Processing',
    'Pneumatics & Hydraulics',
    'Vision Systems',
    'Autonomous Operations',
  ],

  software: [
    'Git Protocols',
    'Dev Environment',
    'Data Structures',
    'Code Review & QA',
    'API Troubleshooting',
    'System Architecture',
    'Distributed Systems',
    'Cloud Pipelines',
    'Security & Auth',
    'Tech Leadership',
  ],
};

/**
 * Get topic keywords for a discipline.
 * Falls back to a generic engineering progression if discipline not found.
 */
export const getDisciplineTopics = (discipline: EngineeringDiscipline): string[] => {
  return (
    DISCIPLINE_TOPIC_KEYWORDS[discipline] || [
      'Foundational Concepts',
      'Technical Vocabulary',
      'Systems Understanding',
      'Diagnostics',
      'Problem Solving',
      'Process Control',
      'Advanced Applications',
      'Specialized Operations',
      'Project Coordination',
      'Leadership',
    ]
  );
};
