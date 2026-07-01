import { ReadingMission } from './reading.types';
import { STARTER_READING_MISSIONS } from './reading.starter.data';

const CORE_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'elec_site_inspection',
    title: 'Electrical Site Inspection Report',
    description:
      'Analyze physical substation installation checks and safety grounding compliance reports.',
    discipline: 'Electrical Engineering',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    passageText:
      'The site inspection of the Phase 3 Substation (Sub-03) was conducted on June 22, 2026. The primary scope was verifying physical installation parameters for the 11kV/415V dry-type transformer and associated MV switchgear. Observations indicate that the transformer enclosure fails to meet the specified IP23 rating due to unsealed cable gland plates at the base, which leaves openings larger than 12.5mm. Furthermore, the neutral grounding conductor was found to be incorrectly sized; a 70mm² copper conductor was installed instead of the specified 120mm² copper conductor as detailed in the approved shop drawing (Ref: EL-SUB-03-SD-04). This undersizing presents a severe thermal risk during system-level unbalanced fault conditions, which could lead to excessive heating and mechanical degradation of the neutral path. The contractor must replace this grounding conductor before system-level energization can be sanctioned. Insulation resistance testing (megger test) of the primary windings showed highly satisfactory results at 5,000 MΩ, which is well above the minimum standard threshold of 100 MΩ required for safe energization.',
    vocabulary: [
      {
        term: 'IP23 rating',
        definition:
          'An Ingress Protection rating indicating that the enclosure protects against solid objects larger than 12.5mm and spraying water up to 60 degrees from vertical.',
        context:
          'The enclosure fails to meet the specified IP23 rating due to unsealed cable gland plates.',
      },
      {
        term: 'dry-type transformer',
        definition:
          'An electrical transformer where the core and windings are cooled by natural or forced air circulation rather than being immersed in liquid.',
        context:
          'Verifying physical installation parameters for the 11kV/415V dry-type transformer.',
      },
      {
        term: 'neutral grounding conductor',
        definition:
          'A conductor used to connect the neutral point of an electrical system to the earth grounding grid to stabilize voltage and provide a fault return path.',
        context:
          'The neutral grounding conductor was found to be incorrectly sized.',
      },
      {
        term: 'megger test',
        definition:
          'A high-voltage insulation resistance test used to measure the electrical resistance of insulators, ensuring no current leakage.',
        context:
          'Insulation resistance testing (megger test) of the primary windings showed satisfactory results.',
      },
    ],
    questions: [
      {
        id: 'q1_1',
        type: 'multiple_choice',
        questionText:
          'What is the main physical reason the transformer enclosure failed to achieve the specified IP23 rating?',
        choices: [
          'A) Unsealed cable gland plates at the base of the enclosure.',
          'B) The neutral grounding conductor was undersized.',
          'C) Primary windings failed the megger insulation test.',
          'D) Excessive heating degraded the surrounding metal framework.',
        ],
        correctAnswer: 'A',
        explanation:
          'The passage explicitly states that the enclosure lacks the IP23 rating because of the unsealed cable gland plates at the base, leaving gaps larger than 12.5mm.',
      },
      {
        id: 'q1_2',
        type: 'keyword_answer',
        questionText:
          'What copper grounding conductor size (in mm²) was specified in the approved shop drawing EL-SUB-03-SD-04?',
        correctAnswer: '120',
        keywords: ['120', '120mm²', '120mm'],
        explanation:
          'The approved shop drawing specified a 120mm² copper conductor, but the contractor incorrectly installed a 70mm² one.',
      },
      {
        id: 'q1_3',
        type: 'true_false',
        questionText:
          'The primary windings insulation resistance megger test failed to meet the minimum safe standard threshold.',
        correctAnswer: 'false',
        explanation:
          'The insulation resistance test was highly satisfactory at 5,000 MΩ, which is well above the minimum threshold of 100 MΩ.',
      },
      {
        id: 'q1_4',
        type: 'short_answer',
        questionText:
          'What severe risk is introduced if the undersized neutral grounding conductor is left unchanged during unbalanced fault conditions?',
        correctAnswer:
          'An undersized grounding conductor risks severe thermal heating, excessive temperatures, and mechanical degradation of the neutral path.',
        keywords: [
          'heating',
          'thermal',
          'degradation',
          'temperature',
          'fire',
          'burn',
        ],
        explanation:
          'An undersized neutral conductor will experience excessive heating and potential mechanical degradation because it cannot safely carry the neutral fault current.',
      },
    ],
    xpReward: 60,
    coinReward: 20,
    eloReward: 15,
  },
  {
    id: 'lv_panel_issue',
    title: 'LV Panel Issue Report',
    description:
      'Diagnose overheating busbars, harmonics, and thermographic survey deviations in low-voltage distribution boards.',
    discipline: 'Electrical Engineering',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    passageText:
      'During a routine thermal imaging survey of Low Voltage Distribution Board 2 (LV-DB-02), an anomaly was captured on the Phase B incoming copper busbar joint. The thermogram indicated a hotspot temperature of 114°C, while Phases A and C registered normal operational temperatures of 46°C and 49°C, respectively. This severe temperature differential (ΔT > 65°C) indicates high contact resistance, most likely caused by a loose bolted connection or oxidation on the contact mating surface. Under full load, this joint presents an active safety hazard. Furthermore, a secondary investigation utilizing a power quality analyzer identified high total harmonic distortion (THD-I) of 22% in the neutral path, which exceeds the specified limit of 8% outlined in IEEE 519. This distortion is attributed to the high density of non-linear switched-mode power supplies in the IT server cluster. The contractor is advised to perform immediate torque verification to 45 Nm on all busbar connections and schedule the installation of an active harmonic filter (AHF) to suppress neutral currents.',
    vocabulary: [
      {
        term: 'busbar',
        definition:
          'A metallic bar or strip, typically made of copper or aluminum, that conducts electricity within a switchboard, distribution board, or substation.',
        context:
          'An anomaly was captured on the Phase B incoming copper busbar joint.',
      },
      {
        term: 'contact resistance',
        definition:
          'The resistance to current flow across the mating surfaces of electrical contacts, which increases significantly when connections are loose or oxidized.',
        context:
          'This temperature differential indicates high contact resistance.',
      },
      {
        term: 'THD-I',
        definition:
          'Total Harmonic Distortion of current, representing the ratio of the sum of the powers of all harmonic frequencies to the power of the fundamental frequency.',
        context:
          'The secondary investigation identified a high total harmonic distortion (THD-I) of 22%.',
      },
      {
        term: 'active harmonic filter',
        definition:
          'A power electronics device that dynamically monitors harmonic currents and injects equal but opposite phase-shifted currents to cancel them out.',
        context:
          'Schedule the installation of an active harmonic filter (AHF) to suppress neutral currents.',
      },
    ],
    questions: [
      {
        id: 'q2_1',
        type: 'multiple_choice',
        questionText:
          'What is the most probable physical cause for the Phase B busbar hotspot temperature reaching 114°C?',
        choices: [
          'A) Inadequate active harmonic filter suppression.',
          'B) High contact resistance due to a loose bolted connection or oxidation.',
          'C) Extreme environmental humidity in LV-DB-02.',
          'D) A complete phase-to-phase short circuit in Phase B.',
        ],
        correctAnswer: 'B',
        explanation:
          'A hotspot on a specific phase busbar joint is typical of high contact resistance resulting from loose fasteners or surface oxidation, causing localized heating.',
      },
      {
        id: 'q2_2',
        type: 'keyword_answer',
        questionText:
          'To what specific torque level (in Nm) should the contractor verify and tighten all busbar connections?',
        correctAnswer: '45',
        keywords: ['45', '45 Nm', '45Nm'],
        explanation:
          'The text recommends immediate torque verification to 45 Nm on all busbar connections.',
      },
      {
        id: 'q2_3',
        type: 'true_false',
        questionText:
          'The measured total harmonic distortion (THD-I) of 22% is within the limits set by IEEE 519 standards.',
        correctAnswer: 'false',
        explanation:
          'The measured THD-I is 22%, which exceeds the standard IEEE 519 limit of 8% mentioned in the text.',
      },
      {
        id: 'q2_4',
        type: 'short_answer',
        questionText:
          'What device is recommended to be installed to suppress the high neutral harmonic currents caused by server loads?',
        correctAnswer:
          'An active harmonic filter (AHF) should be installed to suppress neutral harmonic currents.',
        keywords: ['active harmonic filter', 'ahf', 'harmonic filter'],
        explanation:
          'The passage explicitly recommends installing an active harmonic filter (AHF) to suppress the neutral currents caused by non-linear loads.',
      },
    ],
    xpReward: 75,
    coinReward: 25,
    eloReward: 18,
  },
  {
    id: 'generator_load_test',
    title: 'Generator Load Test Report',
    description:
      'Evaluate transient voltage recovery, frequency stability, and fuel consumption curves of emergency diesel generators.',
    discipline: 'Electrical Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    passageText:
      'On June 18, 2026, the emergency diesel generator (EDG-01, rated at 1500 kVA) was subjected to an annual 4-hour load bank test. The test protocol required step load changes to verify transient response and steady-state stability. At 100% load (1200 kW at 0.8 power factor), the generator operated smoothly for 2 hours with exhaust gas temperatures remaining stable at an average of 420°C across all cylinders. A transient step load test of 0% to 60% load demonstrated excellent voltage recovery. The transient voltage dip was restricted to 9.2%, recovering fully to nominal voltage (415V) in 1.4 seconds, well within the 2.0-second tolerance window specified by NFPA 110 Class 1 standards. However, during the final 110% overload test leg (1650 kVA), the coolant temperature rose rapidly, peaking at 98°C, which is dangerously close to the high-temperature shutdown limit of 100°C. This cooling deficiency was traced to a partially clogged radiator core. This must be chemically flushed before the generator can be certified as fully operational for critical hospital facilities.',
    vocabulary: [
      {
        term: 'load bank test',
        definition:
          'A test that applies an electrical load to a generator to verify its performance, stability, and heat dissipation capabilities under controlled conditions.',
        context:
          'The emergency diesel generator was subjected to an annual 4-hour load bank test.',
      },
      {
        term: 'power factor',
        definition:
          'The ratio of actual active power (kW) flowing to the load, to the apparent power (kVA) in the circuit.',
        context:
          'At 100% load (1200 kW at 0.8 power factor), the generator operated smoothly.',
      },
      {
        term: 'transient voltage dip',
        definition:
          'The temporary decrease in voltage that occurs immediately when a sudden electrical load is applied to a generator.',
        context: 'The transient voltage dip was restricted to 9.2%.',
      },
      {
        term: 'high-temperature shutdown',
        definition:
          'A safety mechanism that automatically shuts down the generator if the engine coolant temperature exceeds a predefined safe limit.',
        context:
          'Peaking at 98°C, which is dangerously close to the high-temperature shutdown limit of 100°C.',
      },
    ],
    questions: [
      {
        id: 'q3_1',
        type: 'multiple_choice',
        questionText:
          'What is the NFPA 110 standard tolerance window for full voltage recovery following a step load change?',
        choices: [
          'A) 1.4 seconds',
          'B) 2.0 seconds',
          'C) 4.0 hours',
          'D) 0.8 seconds',
        ],
        correctAnswer: 'B',
        explanation:
          'The passage mentions the nominal voltage recovered in 1.4 seconds, which is within the 2.0-second tolerance window specified by NFPA 110 Class 1.',
      },
      {
        id: 'q3_2',
        type: 'keyword_answer',
        questionText:
          'What temperature (in °C) is the high-temperature shutdown threshold for the generator coolant?',
        correctAnswer: '100',
        keywords: ['100', '100°C', '100 degrees'],
        explanation:
          'The text states that 98°C is dangerously close to the high-temperature shutdown limit of 100°C.',
      },
      {
        id: 'q3_3',
        type: 'true_false',
        questionText:
          'The emergency diesel generator (EDG-01) is currently certified as fully operational for critical hospital usage without any further maintenance.',
        correctAnswer: 'false',
        explanation:
          'The generator cannot be certified as fully operational yet because the clogged radiator core must be chemically flushed first.',
      },
      {
        id: 'q3_4',
        type: 'short_answer',
        questionText:
          'What was identified as the root cause of the rapid coolant temperature increase during the 110% overload test?',
        correctAnswer:
          'The coolant temperature rise was caused by a partially clogged radiator core.',
        keywords: ['clogged radiator', 'radiator core', 'radiator', 'clogged'],
        explanation:
          'The passage explicitly attributes the cooling deficiency and rapid temperature rise during the overload test to a partially clogged radiator core.',
      },
    ],
    xpReward: 50,
    coinReward: 15,
    eloReward: 12,
  },
  {
    id: 'fire_alarm_comm',
    title: 'Fire Alarm Commissioning Note',
    description:
      'Verify SLC loop addressing, strobe synchronization, and interface relays with HVAC dampers and elevators.',
    discipline: 'Building Systems Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    passageText:
      'The commissioning of the fire alarm system for Tower B was completed in accordance with NFPA 72 regulations on May 12, 2026. The Signaled Line Circuit (SLC) loop 1 was fully mapped, verifying 124 addressable devices including smoke detectors, heat detectors, and control modules. End-of-line resistor values were checked and verified to be 4.7kΩ, matching specified system requirements. Strobe light synchronization was confirmed across all egress paths using a digital timer, showing synchronous flash rates of exactly 1 Hz to prevent seizure risks. Interfacing relays with other building systems were tested under alarm simulation. The relay for elevator recall initiated successfully, sending Tower B Elevators 1 and 2 to the primary lobby level. However, a major defect was noted during HVAC integration tests: the fire damper control relays on Floor 4 failed to de-energize the supply fan AHU-04. The contractor must re-wire the auxiliary contact sequence on the motor starter panel to ensure immediate fan shutdown upon alarm initiation.',
    vocabulary: [
      {
        term: 'SLC loop',
        definition:
          'Signaling Line Circuit; a circuit connecting addressable initiating devices (such as detectors and pull stations) and control modules to the fire alarm panel.',
        context: 'The Signaled Line Circuit (SLC) loop 1 was fully mapped.',
      },
      {
        term: 'strobe synchronization',
        definition:
          'The process of flashing all notification strobe lights in a visual zone simultaneously to prevent causing seizures in individuals with photosensitive epilepsy.',
        context:
          'Strobe light synchronization was confirmed across all egress paths.',
      },
      {
        term: 'elevator recall',
        definition:
          'An automated safety system that commands elevators to return to a designated floor and park with doors open when a fire alarm is triggered.',
        context: 'The relay for elevator recall initiated successfully.',
      },
      {
        term: 'fire damper',
        definition:
          'A passive fire protection device used in air conditioning and ventilation ductwork to prevent the spread of fire and smoke inside duct barriers.',
        context:
          'The fire damper control relays on Floor 4 failed to de-energize.',
      },
    ],
    questions: [
      {
        id: 'q4_1',
        type: 'multiple_choice',
        questionText:
          'What is the required flashing rate (frequency) confirmed for notification strobes to mitigate visual seizure risks?',
        choices: ['A) 1 Hz', 'B) 4.7 Hz', 'C) 124 Hz', 'D) 72 Hz'],
        correctAnswer: 'A',
        explanation:
          'The strobe light synchronization test showed a synchronous flash rate of exactly 1 Hz, as explicitly detailed in the text.',
      },
      {
        id: 'q4_2',
        type: 'keyword_answer',
        questionText:
          'What is the resistance value (in kΩ) of the checked and verified end-of-line resistors?',
        correctAnswer: '4.7',
        keywords: ['4.7', '4.7k', '4.7kΩ'],
        explanation:
          'The end-of-line resistor values were checked and verified to be 4.7kΩ.',
      },
      {
        id: 'q4_3',
        type: 'true_false',
        questionText:
          'The HVAC integration tests successfully shut down all supply fans upon fire alarm simulation without any issues.',
        correctAnswer: 'false',
        explanation:
          'The fire damper control relays on Floor 4 failed to de-energize the supply fan AHU-04, which is noted as a major defect.',
      },
      {
        id: 'q4_4',
        type: 'short_answer',
        questionText:
          'What action must the contractor perform to correct the defect found in the Floor 4 HVAC damper integration?',
        correctAnswer:
          'The contractor must re-wire the auxiliary contact sequence on the motor starter panel.',
        keywords: [
          're-wire',
          'auxiliary contact',
          'motor starter',
          'rewire',
          'starter panel',
        ],
        explanation:
          'The passage states the contractor must re-wire the auxiliary contact sequence on the motor starter panel to ensure immediate fan shutdown.',
      },
    ],
    xpReward: 55,
    coinReward: 18,
    eloReward: 13,
  },
  {
    id: 'cable_tray_install',
    title: 'Cable Tray Installation Update',
    description:
      'Verify routing, containment separation distances, load structural margins, and bonding of galvanized cable tray ladders.',
    discipline: 'Electrical Engineering',
    cefrLevel: 'B1',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    passageText:
      'Work on the electrical containment systems along Corridor 2A has progressed to 85% completion. The installation consists of 450mm wide heavy-duty galvanized steel ladder-type cable trays, supported by ceiling-hung trapeze hangers spaced at 1.5-meter intervals. Standard visual and structural inspection verified that all expansion joint couplers are equipped with copper earth-bonding jumpers to maintain continuous ground paths. However, there is a compliance deviation regarding electromagnetic compatibility (EMC) separation distances. According to the approved design guidelines (Ref: EL-CON-SPEC-02), a minimum clearance of 300mm must be maintained between the 415V low-voltage power cable tray and the adjacent CAT6 extra-low voltage (ELV) data cable tray. At column B4, the current installation has a clearance of only 120mm. The subcontractor has been directed to relocate the data tray supports lower on the hanger rods to restore the necessary 300mm air gap before pulling any cables.',
    vocabulary: [
      {
        term: 'containment',
        definition:
          'System of physical pathways, ducts, conduits, and trays that support, organize, and protect electrical and data cables throughout a building.',
        context:
          'Work on the electrical containment systems along Corridor 2A has progressed.',
      },
      {
        term: 'trapeze hanger',
        definition:
          'A structural assembly consisting of two vertical threaded rods and a horizontal support channel (unistrut) used to suspend pipes, ducts, or cable trays from ceilings.',
        context: 'Trays are supported by ceiling-hung trapeze hangers.',
      },
      {
        term: 'earth-bonding jumper',
        definition:
          'A flexible copper wire or strap used to create a low-impedance electrical connection across mechanical joints in metal enclosures and trays to ensure a continuous grounding path.',
        context: 'Couplers are equipped with copper earth-bonding jumpers.',
      },
      {
        term: 'ELV data cable',
        definition:
          'Extra-Low Voltage cabling used for transmitting information rather than power, operating at voltages typically below 50V AC, such as ethernet or telephone lines.',
        context:
          'Clearance between the power cable tray and the adjacent CAT6 extra-low voltage (ELV) data cable tray.',
      },
    ],
    questions: [
      {
        id: 'q5_1',
        type: 'multiple_choice',
        questionText:
          'What physical component is installed across expansion joint couplers to maintain ground path continuity?',
        choices: [
          'A) Trapeze hangers spaced at 1.5-meter intervals.',
          'B) CAT6 extra-low voltage data cables.',
          'C) Copper earth-bonding jumpers.',
          'D) Galvanized steel ladder-type cable couplers.',
        ],
        correctAnswer: 'C',
        explanation:
          'The passage explicitly states that expansion joint couplers are equipped with copper earth-bonding jumpers to maintain ground path continuity.',
      },
      {
        id: 'q5_2',
        type: 'keyword_answer',
        questionText:
          'What is the required minimum clearance (in mm) between the 415V power cable tray and the CAT6 data cable tray?',
        correctAnswer: '300',
        keywords: ['300', '300mm', '300 mm'],
        explanation:
          'The approved design guidelines require a minimum clearance of 300mm.',
      },
      {
        id: 'q5_3',
        type: 'true_false',
        questionText:
          'The current clearance distance between the power and data trays at column B4 is compliant with the design guidelines.',
        correctAnswer: 'false',
        explanation:
          'No, the current distance is only 120mm, which fails to meet the required 300mm design clearance.',
      },
      {
        id: 'q5_4',
        type: 'short_answer',
        questionText:
          'How is the subcontractor instructed to fix the clearance deficiency at column B4?',
        correctAnswer:
          'The subcontractor must relocate the data tray supports lower on the hanger rods.',
        keywords: [
          'supports lower',
          'lower',
          'hanger rods',
          'relocate data tray',
        ],
        explanation:
          'The passage directs the subcontractor to relocate the data tray supports lower on the hanger rods to restore the necessary 300mm clearance.',
      },
    ],
    xpReward: 40,
    coinReward: 10,
    eloReward: 10,
  },
  {
    id: 'consultant_comment_response',
    title: 'Consultant Comment Response',
    description:
      'Structure professional technical justifications and contract specification rebuttals.',
    discipline: 'BMS Engineering',
    cefrLevel: 'C1',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    passageText:
      'With reference to the consultant comment sheet on the Phase 2 BMS Schematics (Submission Ref: ME-BMS-SUB-012, Rev 01), the lead contractor team offers the following technical responses. Comment #4 raised concerns regarding the absence of BACnet/IP interfaces on the Floor 1 to 5 Variable Air Volume (VAV) local controllers. The consultant requested that all VAV controllers be upgraded to native BACnet/IP to avoid communication latency. In response, we clarify that the contract specification (Section 15900, Clause 3.2) explicitly permits BACnet MS/TP over RS-485 for terminal units. Upgrading to BACnet/IP for 420 individual VAV boxes would introduce substantial, unbudgeted capital costs. Furthermore, our system latency calculations (Ref: Latency-Analysis-03) prove that the existing 76.8 kbps MS/TP bus speed is completely sufficient for carrying VAV point telemetry, keeping polling latency below 1.2 seconds. This is well within the 3.0-second system operational requirement. We will therefore maintain the MS/TP protocol for local VAV controllers and provide dual high-speed BACnet/IP router gateways on each floor to bridge data to the main server backbone.',
    vocabulary: [
      {
        term: 'BACnet/IP',
        definition:
          'A high-speed communication protocol for building automation networks that transmits data packets using standard Ethernet UDP/IP structures.',
        context:
          'The consultant requested that all VAV controllers be upgraded to native BACnet/IP.',
      },
      {
        term: 'BACnet MS/TP',
        definition:
          'Master-Slave/Token-Passing; a slower, low-cost serial transmission protocol for building automation based on the physical RS-485 communication standard.',
        context:
          'Section 15900, Clause 3.2 explicitly permits BACnet MS/TP over RS-485.',
      },
      {
        term: 'BMS',
        definition:
          'Building Management System; a computer-based control system installed in buildings that controls and monitors mechanical and electrical equipment.',
        context:
          'With reference to the consultant comment sheet on the Phase 2 BMS Schematics.',
      },
      {
        term: 'router gateway',
        definition:
          'A networking device that translates and routes packets between distinct physical network interfaces and protocols, such as RS-485 serial and Ethernet.',
        context:
          'Provide dual high-speed BACnet/IP router gateways on each floor.',
      },
    ],
    questions: [
      {
        id: 'q6_1',
        type: 'multiple_choice',
        questionText:
          'Which contract specification section is cited by the contractor to justify using BACnet MS/TP instead of BACnet/IP?',
        choices: [
          'A) Section 15900, Clause 3.2',
          'B) Submission Ref: ME-BMS-SUB-012',
          'C) Latency-Analysis-03',
          'D) Clause 4.2 of NFPA 72',
        ],
        correctAnswer: 'A',
        explanation:
          'The contractor explicitly cites "Section 15900, Clause 3.2" of the contract specification, which permits BACnet MS/TP for terminal units.',
      },
      {
        id: 'q6_2',
        type: 'keyword_answer',
        questionText:
          'What is the physical serial bus speed (in kbps) of the existing BACnet MS/TP connection?',
        correctAnswer: '76.8',
        keywords: ['76.8', '76.8 kbps', '76.8kbps'],
        explanation:
          'The text references "the existing 76.8 kbps MS/TP bus speed" in the latency calculations.',
      },
      {
        id: 'q6_3',
        type: 'true_false',
        questionText:
          'Upgrading the 420 individual VAV boxes to native BACnet/IP is already included within the current project budget.',
        correctAnswer: 'false',
        explanation:
          'The text says upgrading to BACnet/IP would introduce "substantial, unbudgeted capital costs," indicating it is not within the current budget.',
      },
      {
        id: 'q6_4',
        type: 'short_answer',
        questionText:
          'How does the contractor propose to bridge the MS/TP serial data onto the main high-speed Ethernet server backbone?',
        correctAnswer:
          'The contractor will provide dual high-speed BACnet/IP router gateways on each floor.',
        keywords: [
          'router gateways',
          'gateways',
          'router gateway',
          'bms gateway',
          'bridge',
        ],
        explanation:
          'The passage proposes to provide dual high-speed BACnet/IP router gateways on each floor to bridge data to the main server backbone.',
      },
    ],
    xpReward: 65,
    coinReward: 20,
    eloReward: 14,
  },
  {
    id: 'shop_drawing_rev',
    title: 'Shop Drawing Revision Note',
    description:
      'Interpret drawing modifications, bill of materials adjustments, and architectural revisions.',
    discipline: 'MEP Coordination',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    passageText:
      'This revision note details structural changes implemented in the approved shop drawing for the Central Plant Chilled Water Piping Layout (Ref: CP-CHW-DWG-002, Rev 03). The primary modification involves routing the 250mm diameter chilled water supply (CWS) and chilled water return (CWR) headers around the newly added seismic bracing column at grid line E-12. To accommodate this obstruction, four additional 45-degree long-radius elbows have been introduced to the pipeline path. This routing adjustment increases the physical length of the run by 4.2 meters, which increases the cumulative calculated friction head loss by 1.8 meters of water column (m wg). Consequently, the primary chilled water pumps must be re-calibrated; pump impellers must be trimmed or adjusted, and motor variable frequency drives (VFD) must be re-commissioned to run at 48 Hz instead of the original design point of 45 Hz to maintain the required flow rate of 120 liters per second (l/s).',
    vocabulary: [
      {
        term: 'seismic bracing',
        definition:
          'Structural reinforcements designed to protect building service piping, conduits, and equipment from collapsing or failing during earthquake events.',
        context:
          'Routing around the newly added seismic bracing column at grid line E-12.',
      },
      {
        term: 'elbow',
        definition:
          'A pipe fitting installed between two lengths of pipe or tubing to allow a change of direction, usually 90 or 45 degrees.',
        context:
          'Four additional 45-degree long-radius elbows have been introduced.',
      },
      {
        term: 'friction head loss',
        definition:
          'The reduction in total pressure head of a fluid as it flows through a piping system due to resistance between the fluid and the pipe walls.',
        context:
          'Friction head loss is increased by 1.8 meters of water column.',
      },
      {
        term: 'VFD',
        definition:
          'Variable Frequency Drive; a controller that drives an electric motor by varying the frequency and voltage supplied to the motor, controlling its speed.',
        context:
          'Motor variable frequency drives (VFD) must be re-commissioned.',
      },
    ],
    questions: [
      {
        id: 'q7_1',
        type: 'multiple_choice',
        questionText:
          'What physical pipe fitting components were added to bypass the seismic column obstruction?',
        choices: [
          'A) Four 45-degree long-radius elbows.',
          'B) Two 250mm diameter VFD pumps.',
          'C) Ceiling-hung seismic columns.',
          'D) A 4.2-meter copper bypass loop.',
        ],
        correctAnswer: 'A',
        explanation:
          'The text clearly specifies that four additional 45-degree long-radius elbows have been introduced to bypass the column at grid line E-12.',
      },
      {
        id: 'q7_2',
        type: 'keyword_answer',
        questionText:
          'What is the new operational frequency (in Hz) at which the pump VFDs must be commissioned?',
        correctAnswer: '48',
        keywords: ['48', '48 Hz', '48Hz'],
        explanation:
          'The passage states that the VFDs must be re-commissioned to run at 48 Hz.',
      },
      {
        id: 'q7_3',
        type: 'true_false',
        questionText:
          'The routing adjustment successfully reduced the cumulative friction head loss of the chilled water piping network.',
        correctAnswer: 'false',
        explanation:
          'The routing adjustment actually increased the calculated friction head loss by 1.8 meters of water column.',
      },
      {
        id: 'q7_4',
        type: 'short_answer',
        questionText:
          'What flow rate (in liters per second) must the pump recalibration sequence maintain?',
        correctAnswer:
          'The system must maintain a flow rate of 120 liters per second (l/s).',
        keywords: ['120', '120 l/s', '120 l/s flow rate', '120 liters'],
        explanation:
          'The pump recalibration must maintain the required flow rate of 120 liters per second (l/s) as stated in the text.',
      },
    ],
    xpReward: 50,
    coinReward: 15,
    eloReward: 12,
  },
  {
    id: 'mech_elec_coordination',
    title: 'Mechanical-Electrical Coordination Issue',
    description:
      'Solve complex geometric space clashes, thermal load requirements, and power feed capacity overrides.',
    discipline: 'MEP Coordination',
    cefrLevel: 'C2',
    difficulty: 'Advanced',
    estimatedMinutes: 18,
    passageText:
      'A severe mechanical-electrical spatial clash has been identified during 3D BIM coordination of the Plant Room mezzanine floor. The 600mm x 400mm supply air duct for AHU-02 directly intersects the routing path of the primary cable ladder (Containment Ref: CL-PL-01) carrying 12 parallel runs of single-core 300mm² XLPE power feeds. These power feeds supply the main chilled water plant room distribution board. Because the cables are heavy-duty single-core conductors, their bending radius is restricted to a minimum of 450mm, making any vertical offset of the cable ladder structurally impractical. Conversely, modifying the mechanical duct path introduces structural problems; diverting the duct downward would reduce the head-room clearance to 1.9 meters, which violates building safety codes (requiring minimum 2.1 meters). To resolve this coordination conflict without altering duct height, the engineering teams have agreed to split the 600x400 duct into three smaller parallel 300x200 ducts that can pass flat beneath the cable ladder, maintaining sufficient headroom and airflow capacity. The electrical team must also install thermal barrier insulation sheets to prevent heat radiated by the power cables from warming the chilled supply air.',
    vocabulary: [
      {
        term: 'BIM coordination',
        definition:
          'Building Information Modeling coordination; a process where 3D computer models of structural, architectural, mechanical, and electrical systems are overlaid to identify spatial conflicts prior to construction.',
        context:
          'A severe mechanical-electrical spatial clash was identified during 3D BIM coordination.',
      },
      {
        term: 'bending radius',
        definition:
          'The minimum radius a cable can be bent safely without causing structural damage, kink, or micro-cracks in its conductor and insulating layers.',
        context:
          'The cables bending radius is restricted to a minimum of 450mm.',
      },
      {
        term: 'XLPE',
        definition:
          'Cross-linked polyethylene; a high-durability, moisture-resistant form of thermoset insulation material used widely for high-current power cables.',
        context:
          'Carrying 12 parallel runs of single-core 300mm² XLPE power feeds.',
      },
      {
        term: 'headroom clearance',
        definition:
          'The vertical distance between the finished floor level and any ceiling obstruction, defining the safe path height for personnel.',
        context:
          'Diverting the duct downward would reduce the headroom clearance to 1.9 meters.',
      },
    ],
    questions: [
      {
        id: 'q8_1',
        type: 'multiple_choice',
        questionText:
          'What building safety violation would occur if the mechanical ventilation duct were diverted downward?',
        choices: [
          'A) It would decrease airflow capacity below AHU-02 requirements.',
          'B) Headroom clearance would drop to 1.9 meters, violating the 2.1-meter code.',
          'C) Cable bending radius would be reduced below 450mm.',
          'D) It would create a thermal hot spot in the chilled water distribution board.',
        ],
        correctAnswer: 'B',
        explanation:
          'Diverting the duct downward reduces the headroom clearance to 1.9 meters, which violates the building safety code of a minimum of 2.1 meters.',
      },
      {
        id: 'q8_2',
        type: 'keyword_answer',
        questionText:
          'What is the restricted minimum bending radius (in mm) for the heavy-duty single-core power cables?',
        correctAnswer: '450',
        keywords: ['450', '450mm', '450 mm'],
        explanation:
          "The passage states that the cables' bending radius is restricted to a minimum of 450mm.",
      },
      {
        id: 'q8_3',
        type: 'true_false',
        questionText:
          'The agreed coordination solution is to vertically offset the heavy-duty cable ladder instead of modifying the mechanical duct.',
        correctAnswer: 'false',
        explanation:
          'No, because the cable bending radius is restricted, vertical offset of the cable ladder is structurally impractical. The mechanical duct is being split into three smaller parallel ducts instead.',
      },
      {
        id: 'q8_4',
        type: 'short_answer',
        questionText:
          'What supplementary protection must the electrical team install to mitigate potential thermal heat transfer from the cables into the chilled supply air duct?',
        correctAnswer:
          'The electrical team must install thermal barrier insulation sheets.',
        keywords: [
          'thermal barrier',
          'insulation',
          'barrier sheets',
          'thermal sheets',
        ],
        explanation:
          'The passage specifies that the electrical team must install thermal barrier insulation sheets to prevent heat radiated by the power cables from warming the chilled supply air.',
      },
    ],
    xpReward: 80,
    coinReward: 30,
    eloReward: 20,
  },
];

export const READING_MISSIONS: ReadingMission[] = [
  ...STARTER_READING_MISSIONS,
  ...CORE_READING_MISSIONS,
];
