const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'src/features/vocabulary/vocabulary.data.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Diverse sentence replacements — 20+ entries with varied patterns
const varietyFixes = {
  'helmet': 'Always wear your helmet before entering the work area.',
  'panel': 'Did you check the panel door before starting the inspection?',
  'switch': 'Make sure the main switch is off before any maintenance work.',
  'drawing': 'If the drawing had been reviewed earlier, the error could have been prevented.',
  'inspect': 'Please inspect the electrical panel thoroughly this morning.',
  'cable tray': 'Verify the cable tray installation before proceeding to the next phase.',
  'support': 'Always check that the support spacing meets the specification requirements.',
  'complete': 'Is the cable tray work complete and ready for inspection?',
  'inspection request': 'Please submit the inspection request before the next work front opens.',
  'work area': 'Keep the work area clean and safe during all installation activities.',
  'transformer': 'If the transformer oil temperature exceeds the limit, shutdown must be initiated immediately.',
  'switchgear': 'Did the contractor submit the switchgear test certificates on time?',
  'busbar': 'Make sure the busbar torque values are verified before energizing the panel.',
  'circuit breaker': 'Always confirm the circuit breaker is in the OFF position before commencing work.',
  'relay': 'If the protection relay trips, investigate the root cause before resetting.',
  'earthing': 'Verify the earthing conductor is properly bonded before the system goes live.',
  'commissioning': 'Please ensure all commissioning checklist items are completed before handover.',
  'safety': 'Always follow the safety procedures when working near live electrical equipment.',
  'quality': 'Did the quality control team approve the inspection request?',
  'inspection': 'If the inspection reveals nonconformance, initiate corrective action immediately.',
  'risk assessment': 'Make sure the risk assessment is completed before starting any high-risk work.',
  'method statement': 'Please review the method statement before commencing the activity.',
  'handover': 'If the handover documentation is incomplete, the client should not accept the system.',
  'schedule': 'Did you update the schedule to reflect the latest progress information?',
  'procurement': 'Ensure the procurement schedule aligns with the construction timeline.',
  'defect liability period': 'Always document any defects found during the defect liability period.',
  'as-built drawing': 'Please submit the as-built drawing after completing the installation work.',
  'nonconformance report': 'If the NCR is not closed within 30 days, escalate to the project manager.',
  'acceptance criteria': 'Make sure the acceptance criteria are clearly defined before testing begins.',
};

let fixed = 0;
varietyFixes.forEach((newExample, word) => {
  const entry = data.find(e => e.word === word);
  if (entry) {
    entry.example = newExample;
    fixed++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`P4: Updated ${fixed} example sentences with diverse patterns`);
