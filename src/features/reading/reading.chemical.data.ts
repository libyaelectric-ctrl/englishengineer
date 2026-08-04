import type { ReadingMission } from './reading.types';

export const CHEMICAL_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'chemical_a2_chemical_storage_notice',
    title: 'Safety Notice — Chemical Storage Area',
    description:
      'Read a short safety notice about the chemical storage area and find the main rules.',
    discipline: 'Chemical Engineering',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText:
      'SAFETY NOTICE. Chemical storage area B-4. Only trained workers may enter this area. Always wear your safety glasses and gloves inside. Do not eat or drink near the drums. Every chemical drum must have a label. Read the label before you open any drum. If you see a leak, do not touch it. Tell your supervisor at once. The spill kit is next to the door. In an emergency, use the eye wash station near the exit. The safety data sheet (SDS) for every chemical is in the folder at the entrance. Keep the area clean and dry. — Plant Manager.',
    vocabulary: [
      {
        term: 'chemical storage',
        definition: 'A controlled area where chemicals are kept safely in drums or tanks.',
        context: 'Chemical storage area B-4.',
        turkishTranslation: 'kimyasal depolama',
      },
      {
        term: 'label',
        definition: 'A written or printed sign on a container that tells you what is inside.',
        context: 'Every chemical drum must have a label.',
        turkishTranslation: 'etiket',
      },
      {
        term: 'leak',
        definition: 'A hole or crack that lets liquid or gas escape from a container or pipe.',
        context: 'If you see a leak, do not touch it.',
        turkishTranslation: 'sızıntı',
      },
      {
        term: 'spill kit',
        definition: 'A set of materials used to clean up a chemical spill safely.',
        context: 'The spill kit is next to the door.',
        turkishTranslation: 'dökülme müdahale seti',
      },
      {
        term: 'safety data sheet (SDS)',
        definition:
          'A document that describes the hazards of a chemical and how to handle it safely.',
        context: 'The safety data sheet (SDS) for every chemical is in the folder at the entrance.',
        turkishTranslation: 'güvenlik bilgi formu',
      },
    ],
    questions: [
      {
        id: 'chem_a2_q1',
        type: 'multiple_choice',
        questionText: 'Who may enter the chemical storage area?',
        choices: [
          'A) All visitors',
          'B) Only trained workers',
          'C) Only the plant manager',
          'D) Anyone with gloves',
        ],
        correctAnswer: 'B',
        explanation: 'The notice states: "Only trained workers may enter this area."',
      },
      {
        id: 'chem_a2_q2',
        type: 'true_false',
        questionText: 'You should touch a leak to check what chemical it is.',
        correctAnswer: 'false',
        explanation:
          'The notice says: "If you see a leak, do not touch it. Tell your supervisor at once."',
      },
      {
        id: 'chem_a2_q3',
        type: 'keyword_answer',
        questionText: 'Where is the spill kit?',
        keywords: ['next to the door', 'door'],
        correctAnswer: 'next to the door',
        explanation: 'The notice says: "The spill kit is next to the door."',
      },
    ],
    xpReward: 40,
    coinReward: 15,
    eloReward: 12,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'chemical_b1_permit_to_work',
    title: 'Permit to Work — Pump Maintenance',
    description:
      'Read a permit to work for pump maintenance in a process area and identify the safety conditions.',
    discipline: 'Chemical Engineering',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 8,
    passageText:
      'PERMIT TO WORK — PTW-CH-112. Area: Unit 3, pump P-304. Work: replace mechanical seal. Date: 04 August. Valid until: 18:00 same day. Conditions before work: the pump was isolated from the power supply and locked out with a padlock. The inlet and outlet valves were closed and tagged. The line was drained and flushed with water. A gas test was done at 08:30 and the result was safe. Required PPE: hard hat, safety glasses, chemical gloves and safety boots. A fire extinguisher must stay near the work area because a hot work permit is also needed for the welding job on the base plate. The area supervisor must check the work every two hours. When the job is finished, the mechanic must remove all tools, close the permit and return it to the control room. Do not restart the pump until the control room confirms that the permit is closed.',
    vocabulary: [
      {
        term: 'permit to work',
        definition:
          'A formal written authorisation that allows a hazardous job to be done safely under stated conditions.',
        context: 'PERMIT TO WORK — PTW-CH-112.',
        turkishTranslation: 'çalışma izni',
      },
      {
        term: 'isolate (lock out)',
        definition:
          'To disconnect equipment from energy sources and lock it so it cannot start by accident.',
        context: 'The pump was isolated from the power supply and locked out with a padlock.',
        turkishTranslation: 'izole etmek / kilitlemek',
      },
      {
        term: 'gas test',
        definition:
          'A measurement of the air in an area to check for flammable or poisonous gases before work.',
        context: 'A gas test was done at 08:30 and the result was safe.',
        turkishTranslation: 'gaz ölçümü',
      },
      {
        term: 'mechanical seal',
        definition: 'A device that stops liquid from leaking where a pump shaft enters the casing.',
        context: 'Work: replace mechanical seal.',
        turkishTranslation: 'mekanik salmastra',
      },
      {
        term: 'hot work permit',
        definition:
          'A special permit required for work that creates heat or sparks, such as welding.',
        context: 'A hot work permit is also needed for the welding job on the base plate.',
        turkishTranslation: 'sıcak çalışma izni',
      },
    ],
    questions: [
      {
        id: 'chem_b1_q1',
        type: 'multiple_choice',
        questionText: 'Why is a hot work permit also needed for this job?',
        choices: [
          'A) Because the pump handles hot liquid',
          'B) Because there is a welding job on the base plate',
          'C) Because the gas test failed',
          'D) Because the work continues after 18:00',
        ],
        correctAnswer: 'B',
        explanation:
          'The permit states a fire extinguisher must stay nearby "because a hot work permit is also needed for the welding job on the base plate."',
      },
      {
        id: 'chem_b1_q2',
        type: 'true_false',
        questionText: 'The pump can be restarted as soon as the mechanic finishes the job.',
        correctAnswer: 'false',
        explanation:
          'The permit says: "Do not restart the pump until the control room confirms that the permit is closed."',
      },
      {
        id: 'chem_b1_q3',
        type: 'keyword_answer',
        questionText: 'How often must the area supervisor check the work?',
        keywords: ['every two hours', 'two hours'],
        correctAnswer: 'every two hours',
        explanation: 'The permit requires the area supervisor to check the work every two hours.',
      },
    ],
    xpReward: 45,
    coinReward: 18,
    eloReward: 13,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'chemical_b2_heat_exchanger_inspection_report',
    title: 'Inspection Report — Heat Exchanger E-210',
    description:
      'Read an inspection report describing fouling found inside a shell-and-tube heat exchanger.',
    discipline: 'Chemical Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    passageText:
      'INSPECTION REPORT — E-210, Shell-and-Tube Heat Exchanger, Unit 2. Inspection type: internal, after scheduled shutdown. Scope: bundle pull, visual inspection and hydro test. Findings. Heavy fouling was observed on the tube side, mainly calcium scale near the inlet tubesheet. Approximately 30 percent of the tubes showed partial blockage, which explains the reported drop in heat transfer duty over the last three months. No corrosion was found on the shell side, and the tube bundle passed the hydro test at 1.5 times the design pressure with no visible leakage. Two gaskets on the channel cover were hardened and cracked and must be replaced before recommissioning. Recommendations. The bundle should be chemically cleaned with an approved acid solution and flushed with demineralised water before reinstallation. The inlet strainer upstream of the exchanger should be inspected and cleaned monthly instead of quarterly, because the cooling water quality has degraded since the river intake filter was damaged. The next internal inspection is recommended within 18 months rather than the standard 36. The production team confirmed that a spare gasket set is already in the warehouse. Status: released for cleaning.',
    vocabulary: [
      {
        term: 'fouling',
        definition:
          'The build-up of unwanted deposits, such as scale, on the inside surfaces of equipment.',
        context: 'Heavy fouling was observed on the tube side, mainly calcium scale.',
        turkishTranslation: 'kirlenme / birikinti',
      },
      {
        term: 'heat exchanger',
        definition: 'Equipment that transfers heat between two fluids without mixing them.',
        context: 'Shell-and-Tube Heat Exchanger, Unit 2.',
        turkishTranslation: 'eşanjör / ısı değiştirici',
      },
      {
        term: 'hydro test',
        definition:
          'A pressure test in which equipment is filled with water and pressurised to check for leaks.',
        context: 'The tube bundle passed the hydro test at 1.5 times the design pressure.',
        turkishTranslation: 'hidrostatik test',
      },
      {
        term: 'recommissioning',
        definition: 'The process of returning equipment to safe operation after maintenance.',
        context:
          'Two gaskets on the channel cover were hardened and cracked and must be replaced before recommissioning.',
        turkishTranslation: 'yeniden devreye alma',
      },
      {
        term: 'strainer',
        definition: 'A device with a mesh or screen that removes solids from a flowing liquid.',
        context:
          'The inlet strainer upstream of the exchanger should be inspected and cleaned monthly.',
        turkishTranslation: 'pislik tutucu / filtre',
      },
    ],
    questions: [
      {
        id: 'chem_b2_q1',
        type: 'multiple_choice',
        questionText: 'What explains the drop in heat transfer duty over the last three months?',
        choices: [
          'A) Corrosion on the shell side',
          'B) Hardened gaskets on the channel cover',
          'C) Calcium scale partially blocking about 30 percent of the tubes',
          'D) A failed hydro test',
        ],
        correctAnswer: 'C',
        explanation:
          'The report links heavy calcium scale and partial blockage of about 30 percent of tubes to the reported drop in duty.',
      },
      {
        id: 'chem_b2_q2',
        type: 'true_false',
        questionText: 'The tube bundle leaked during the hydro test.',
        correctAnswer: 'false',
        explanation:
          'The report states the bundle passed the hydro test at 1.5 times design pressure with no visible leakage.',
      },
      {
        id: 'chem_b2_q3',
        type: 'keyword_answer',
        questionText: 'How often should the inlet strainer now be cleaned?',
        keywords: ['monthly', 'every month'],
        correctAnswer: 'monthly',
        explanation:
          'The recommendation changes strainer cleaning from quarterly to monthly because cooling water quality has degraded.',
      },
    ],
    xpReward: 50,
    coinReward: 20,
    eloReward: 14,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'chemical_c1_moc_line_modification',
    title: 'Management of Change — Reactor Feed Line Modification',
    description:
      'Read a formal Management of Change document for a reactor feed line modification and identify the required safety and approval steps.',
    discipline: 'Chemical Engineering',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    passageText:
      'MANAGEMENT OF CHANGE — MOC-2026-0087. Facility: Reactor Unit R-1. Change classification: Major. Description of change. The reactor feed line L-101 shall be rerouted from the north pipe rack to the south pipe rack to allow future installation of an additional feed pump. The modification includes 42 metres of new piping, two new isolation valves, and relocation of one pressure transmitter. The existing line shall remain in service until the new line has passed all pre-commissioning checks, after which the tie-in shall be performed during the planned maintenance window. Risk assessment. A HAZOP study shall be carried out before detailed design is released. Because the line carries flammable liquid above its flash point, any hot work within 15 metres of the tie-in point shall require a dedicated hot work permit supported by a continuous gas detection watch. The safety instrumented function protecting reactor high-level trip shall be verified after transmitter relocation, and the verification shall be witnessed by the process safety engineer. Approval requirements. No procurement shall be initiated until this MOC has been signed by the operations manager, the maintenance manager and the process safety engineer. The change shall not be implemented until the updated P&ID, revised operating procedure and amended relief valve calculation have been issued and approved. Training. All operators assigned to Unit R-1 shall complete a briefing on the revised line-up before the tie-in. Any deviation discovered during implementation shall be reported immediately, and the MOC shall be re-evaluated before work continues. Temporary changes shall not exceed 90 days; any extension requires a new risk assessment. Closure of this MOC shall be confirmed only after successful pre-commissioning, punch list clearance and documentation update in the plant information system.',
    vocabulary: [
      {
        term: 'management of change (MOC)',
        definition:
          'A formal process that reviews and authorises modifications to plant equipment or procedures before they are made.',
        context: 'MANAGEMENT OF CHANGE — MOC-2026-0087.',
        turkishTranslation: 'değişiklik yönetimi',
      },
      {
        term: 'HAZOP',
        definition:
          'A structured study that identifies hazards and operability problems in a process design.',
        context: 'A HAZOP study shall be carried out before detailed design is released.',
        turkishTranslation: 'tehlike ve işletilebilirlik çalışması',
      },
      {
        term: 'tie-in',
        definition: 'The connection point where a new line is joined to an existing system.',
        context: 'The tie-in shall be performed during the planned maintenance window.',
        turkishTranslation: 'bağlantı noktası / tie-in',
      },
      {
        term: 'flash point',
        definition:
          'The lowest temperature at which a liquid gives off enough vapour to ignite briefly.',
        context: 'The line carries flammable liquid above its flash point.',
        turkishTranslation: 'parlama noktası',
      },
      {
        term: 'P&ID',
        definition:
          'A Piping and Instrumentation Diagram showing equipment, piping, valves and instruments.',
        context:
          'The change shall not be implemented until the updated P&ID has been issued and approved.',
        turkishTranslation: 'borulama ve enstrümantasyon diyagramı',
      },
    ],
    questions: [
      {
        id: 'chem_c1_q1',
        type: 'multiple_choice',
        questionText: 'What must happen before detailed design can be released?',
        choices: [
          'A) The old line must be demolished',
          'B) A HAZOP study must be carried out',
          'C) The relief valve must be replaced',
          'D) Operators must complete the briefing',
        ],
        correctAnswer: 'B',
        explanation:
          'The risk assessment section states that a HAZOP study shall be carried out before detailed design is released.',
      },
      {
        id: 'chem_c1_q2',
        type: 'true_false',
        questionText: 'Procurement may start once the operations manager alone signs the MOC.',
        correctAnswer: 'false',
        explanation:
          'No procurement shall be initiated until the MOC is signed by the operations manager, the maintenance manager and the process safety engineer.',
      },
      {
        id: 'chem_c1_q3',
        type: 'keyword_answer',
        questionText: 'What is the maximum duration allowed for temporary changes?',
        keywords: ['90', '90 days', 'ninety days'],
        correctAnswer: '90 days',
        explanation:
          'The document states temporary changes shall not exceed 90 days; extensions require a new risk assessment.',
      },
    ],
    xpReward: 55,
    coinReward: 22,
    eloReward: 15,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
];
