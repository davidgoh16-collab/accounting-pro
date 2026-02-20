
import { MultipleChoiceQuestion } from './types';

export const GAME_QUESTIONS: MultipleChoiceQuestion[] = [
  // --- A-LEVEL QUESTIONS ---
  {
    id: 'gq_textbook_1',
    question: "What concept does the textbook use Glastonbury to primarily illustrate?",
    options: ['Location, locale, and sense of place', 'Urban regeneration', 'Deindustrialisation', 'Fortress landscapes'],
    correctAnswer: 'Location, locale, and sense of place',
    topic: 'Changing Places',
    levels: ['A-Level']
  },
  {
    id: 'gq_textbook_2',
    question: "According to the textbook, Apple Inc. outsources the assembly of its iPhones and iPads primarily to which Taiwanese company?",
    options: ['Samsung', 'Foxconn', 'Huawei', 'Sony'],
    correctAnswer: 'Foxconn',
    topic: 'Global Systems and Global Governance',
    levels: ['A-Level']
  },
  {
    id: 'gq_textbook_3',
    question: "The 2018 Lombok earthquake was on a subduction zone where which plate is moving northwards under the Eurasian plate?",
    options: ['Pacific Plate', 'Indo-Australian Plate', 'Philippine Plate', 'Nazca Plate'],
    correctAnswer: 'Indo-Australian Plate',
    topic: 'Hazards',
    levels: ['A-Level']
  },
  {
    id: 'gq_new_1',
    question: "What term describes the difference between inputs and outputs of carbon in a subsystem?",
    options: ['Carbon Budget', 'Carbon Footprint', 'Carbon Sequestration', 'Carbon Offset'],
    correctAnswer: 'Carbon Budget',
    topic: 'Water and Carbon Cycles',
    levels: ['A-Level']
  },
  {
    id: 'gq_alevel_5',
    question: "Which of these is an example of a 'Global Common'?",
    options: ['The High Seas', 'The Amazon Rainforest', 'The River Nile', 'Mount Everest'],
    correctAnswer: 'The High Seas',
    topic: 'Global Systems and Global Governance',
    levels: ['A-Level']
  },
  {
    id: 'gq_alevel_6',
    question: "What type of weathering involves the chemical alteration of rock minerals?",
    options: ['Mechanical', 'Chemical', 'Biological', 'Physical'],
    correctAnswer: 'Chemical',
    topic: 'Coastal Systems and Landscapes',
    levels: ['A-Level']
  },
  {
    id: 'gq_alevel_7',
    question: "Which urban form is characterised by a chaotic mix of land uses and a lack of planning?",
    options: ['Pre-industrial', 'Modern', 'Post-modern', 'Industrial'],
    correctAnswer: 'Pre-industrial',
    topic: 'Contemporary Urban Environments',
    levels: ['A-Level']
  },

  // --- GCSE QUESTIONS ---
  {
    id: 'gq_gcse_1',
    question: "Which plate margin involves two plates moving apart?",
    options: ['Destructive', 'Constructive', 'Conservative', 'Collision'],
    correctAnswer: 'Constructive',
    topic: 'The Challenge of Natural Hazards',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_2',
    question: "What is the primary cause of urban heat islands?",
    options: ['Car exhausts', 'Human body heat', 'Building materials absorbing heat', 'Lack of wind'],
    correctAnswer: 'Building materials absorbing heat',
    topic: 'Urban Issues and Challenges',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_3',
    question: "Which process is responsible for the formation of a spit?",
    options: ['Longshore drift', 'Hydraulic action', 'Freeze-thaw weathering', 'Slumping'],
    correctAnswer: 'Longshore drift',
    topic: 'Physical Landscapes in the UK',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_4',
    question: "In the Demographic Transition Model, what happens in Stage 2?",
    options: ['Birth rate high, death rate falls', 'Birth rate falls, death rate low', 'Both high', 'Both low'],
    correctAnswer: 'Birth rate high, death rate falls',
    topic: 'The Changing Economic World',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_5',
    question: "Which of these is a soft engineering strategy for coasts?",
    options: ['Sea wall', 'Groynes', 'Beach nourishment', 'Gabions'],
    correctAnswer: 'Beach nourishment',
    topic: 'Physical Landscapes in the UK',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_6',
    question: "What is a 'megacity' defined as?",
    options: ['City with >1 million people', 'City with >5 million people', 'City with >10 million people', 'Capital city'],
    correctAnswer: 'City with >10 million people',
    topic: 'Urban Issues and Challenges',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_7',
    question: "Which biome is characterised by low rainfall and high diurnal temperature range?",
    options: ['Tropical Rainforest', 'Hot Desert', 'Tundra', 'Deciduous Forest'],
    correctAnswer: 'Hot Desert',
    topic: 'The Living World',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_8',
    question: "What is the main cause of the greenhouse effect?",
    options: ['Ozone layer hole', 'Gases trapping heat', 'Solar flares', 'Volcanic ash'],
    correctAnswer: 'Gases trapping heat',
    topic: 'The Challenge of Natural Hazards',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_9',
    question: "Rio de Janeiro is an example of a city in a...",
    options: ['LIC', 'NEE', 'HIC', 'EU country'],
    correctAnswer: 'NEE',
    topic: 'Urban Issues and Challenges',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_10',
    question: "Which type of erosion involves rocks banging against each other?",
    options: ['Abrasion', 'Attrition', 'Hydraulic Action', 'Solution'],
    correctAnswer: 'Attrition',
    topic: 'Physical Landscapes in the UK',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_11',
    question: "What is the main export of Nigeria?",
    options: ['Cocoa', 'Oil', 'Cotton', 'Gold'],
    correctAnswer: 'Oil',
    topic: 'The Changing Economic World',
    levels: ['GCSE']
  },
  {
    id: 'gq_gcse_12',
    question: "Which of these is a biotic component of an ecosystem?",
    options: ['Soil', 'Water', 'Bacteria', 'Sunlight'],
    correctAnswer: 'Bacteria',
    topic: 'The Living World',
    levels: ['GCSE']
  },

  // --- IGCSE QUESTIONS ---
  // River environments
  {
    id: 'gq_igcse_1',
    question: "Which process involves the wearing away of the river bed and banks by the load carried by the river?",
    options: ['Attrition', 'Abrasion', 'Hydraulic Action', 'Solution'],
    correctAnswer: 'Abrasion',
    topic: 'River environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_2',
    question: "What feature is formed when a meander neck is breached during a flood?",
    options: ['Waterfall', 'Ox-bow lake', 'Levee', 'Delta'],
    correctAnswer: 'Ox-bow lake',
    topic: 'River environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_3',
    question: "Which part of the river usually has the steepest gradient?",
    options: ['Upper course', 'Middle course', 'Lower course', 'Mouth'],
    correctAnswer: 'Upper course',
    topic: 'River environments',
    levels: ['IGCSE']
  },
  // Coastal environments
  {
    id: 'gq_igcse_4',
    question: "What is the movement of water up the beach called?",
    options: ['Backwash', 'Swash', 'Fetch', 'Longshore drift'],
    correctAnswer: 'Swash',
    topic: 'Coastal environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_5',
    question: "Which of these is a hard engineering strategy?",
    options: ['Beach nourishment', 'Managed retreat', 'Sea wall', 'Dune regeneration'],
    correctAnswer: 'Sea wall',
    topic: 'Coastal environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_6',
    question: "Mangroves are most commonly found in which type of environment?",
    options: ['Temperate', 'Tropical', 'Polar', 'Desert'],
    correctAnswer: 'Tropical',
    topic: 'Coastal environments',
    levels: ['IGCSE']
  },
  // Hazardous environments
  {
    id: 'gq_igcse_7',
    question: "The point on the Earth's surface directly above an earthquake focus is the...",
    options: ['Epicentre', 'Hypocentre', 'Fault line', 'Magnitude'],
    correctAnswer: 'Epicentre',
    topic: 'Hazardous environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_8',
    question: "Which scale is used to measure the magnitude of tropical cyclones?",
    options: ['Richter', 'Mercalli', 'Saffir-Simpson', 'Beaufort'],
    correctAnswer: 'Saffir-Simpson',
    topic: 'Hazardous environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_9',
    question: "What type of volcano is typically broad with gentle slopes?",
    options: ['Composite', 'Shield', 'Cinder cone', 'Stratovolcano'],
    correctAnswer: 'Shield',
    topic: 'Hazardous environments',
    levels: ['IGCSE']
  },
  // Economic activity and energy
  {
    id: 'gq_igcse_10',
    question: "Which sector involves providing services to people?",
    options: ['Primary', 'Secondary', 'Tertiary', 'Quaternary'],
    correctAnswer: 'Tertiary',
    topic: 'Economic activity and energy',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_11',
    question: "The decline in the importance of the secondary sector is known as...",
    options: ['Industrialisation', 'Deindustrialisation', 'Globalisation', 'Urbanisation'],
    correctAnswer: 'Deindustrialisation',
    topic: 'Economic activity and energy',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_12',
    question: "Which energy source is non-renewable?",
    options: ['Solar', 'Wind', 'Coal', 'Hydroelectric'],
    correctAnswer: 'Coal',
    topic: 'Economic activity and energy',
    levels: ['IGCSE']
  },
  // Urban environments
  {
    id: 'gq_igcse_13',
    question: "What is the term for the outward growth of a city?",
    options: ['Urban sprawl', 'Urbanisation', 'Gentrification', 'Regeneration'],
    correctAnswer: 'Urban sprawl',
    topic: 'Urban environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_14',
    question: "Which model shows land use in concentric rings?",
    options: ['Hoyt', 'Burgess', 'Harris and Ullman', 'Clark Fisher'],
    correctAnswer: 'Burgess',
    topic: 'Urban environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_15',
    question: "What is a common problem in shanty towns?",
    options: ['High taxes', 'Lack of sanitation', 'Excessive space', 'Low population density'],
    correctAnswer: 'Lack of sanitation',
    topic: 'Urban environments',
    levels: ['IGCSE']
  },
  // Rural environments
  {
    id: 'gq_igcse_16',
    question: "What is the movement of people from cities back to rural areas called?",
    options: ['Urbanisation', 'Counter-urbanisation', 'Migration', 'Depopulation'],
    correctAnswer: 'Counter-urbanisation',
    topic: 'Rural environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_17',
    question: "Which of these is a strategy to diversify farm income?",
    options: ['Monoculture', 'Mechanisation', 'Agrotourism', 'Deforestation'],
    correctAnswer: 'Agrotourism',
    topic: 'Rural environments',
    levels: ['IGCSE']
  },
  // Fragile environments
  {
    id: 'gq_igcse_18',
    question: "What is the primary cause of desertification in the Sahel?",
    options: ['Overgrazing', 'Mining', 'Urbanisation', 'Tourism'],
    correctAnswer: 'Overgrazing',
    topic: 'Fragile environments and climate change',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_19',
    question: "Which gas contributes most to the enhanced greenhouse effect?",
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
    correctAnswer: 'Carbon Dioxide',
    topic: 'Fragile environments and climate change',
    levels: ['IGCSE']
  },
  // Globalisation
  {
    id: 'gq_igcse_20',
    question: "What does TNC stand for?",
    options: ['Trans-National Corporation', 'Trade National Centre', 'Total Net Cost', 'Transport Network Company'],
    correctAnswer: 'Trans-National Corporation',
    topic: 'Globalisation and migration',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_21',
    question: "Which of these is a 'push factor' for migration?",
    options: ['Better jobs', 'War', 'Good healthcare', 'Education opportunities'],
    correctAnswer: 'War',
    topic: 'Globalisation and migration',
    levels: ['IGCSE']
  },
  // Development
  {
    id: 'gq_igcse_22',
    question: "Which indicator combines life expectancy, education, and income?",
    options: ['GDP', 'GNI', 'HDI', 'CPI'],
    correctAnswer: 'HDI',
    topic: 'Development and human welfare',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_23',
    question: "Top-down development projects are usually led by...",
    options: ['Local communities', 'Governments', 'NGOs', 'Individuals'],
    correctAnswer: 'Governments',
    topic: 'Development and human welfare',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_24',
    question: "Which country is a well-known case study for rapid economic development (NIC/NEE)?",
    options: ['Chad', 'China', 'Haiti', 'Somalia'],
    correctAnswer: 'China',
    topic: 'Economic activity and energy',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_25',
    question: "What is the name for the boundary between two drainage basins?",
    options: ['Confluence', 'Mouth', 'Watershed', 'Tributary'],
    correctAnswer: 'Watershed',
    topic: 'River environments',
    levels: ['IGCSE']
  },
  {
    id: 'gq_igcse_26',
    question: "Which type of wave has a strong swash and weak backwash?",
    options: ['Destructive', 'Constructive', 'Tidal', 'Storm'],
    correctAnswer: 'Constructive',
    topic: 'Coastal environments',
    levels: ['IGCSE']
  }
];
