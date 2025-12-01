
import { MultipleChoiceQuestion } from './types';

export const GAME_QUESTIONS: MultipleChoiceQuestion[] = [
  // Existing A-Level (Tagged)
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

  // GCSE Questions (New)
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
  }
];
