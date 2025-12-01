
import { CommandWord, MathsProblem, StructureGuide, MathsSkill } from './types';
import { ALL_QUESTIONS } from './database';

export const ALEVEL_UNITS = [
    'All Units',
    'Global Systems and Global Governance',
    'Changing Places',
    'Contemporary Urban Environments',
    'Population and the Environment',
    'Resource Security',
    'Water and Carbon Cycles',
    'Coastal Systems and Landscapes',
    'Hazards',
    'Ecosystems Under Stress'
];

export const GCSE_UNITS = [
    'All Units',
    'The Challenge of Natural Hazards',
    'The Living World',
    'Physical Landscapes in the UK',
    'Urban Issues and Challenges',
    'The Changing Economic World',
    'The Challenge of Resource Management',
    'Issue Evaluation',
    'Fieldwork'
];

export const AQA_UNITS = ALEVEL_UNITS; 

export const QUESTIONS = ALL_QUESTIONS;

export const COMMAND_WORDS: CommandWord[] = [
  // --- A-LEVEL SPECIFIC ---
  {
    word: 'Assess',
    definition: 'Offer a reasoned judgement of the standard/quality of situation/skill informed by relevant facts.',
    requiredAction: 'Weigh up the importance of different factors or arguments. A clear judgement is essential throughout.',
    aoFocus: 'AO2 (Evaluation)',
    tips: [
      'Start with a clear line of argument.',
      'Use "However" and "On the other hand" to show balance.',
      'Conclude by stating which factor is most important and why.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Evaluate',
    definition: 'Make a judgement on the effectiveness, value or success of something.',
    requiredAction: 'Review information and bring it together to form a conclusion, drawing on evidence like strengths, weaknesses, alternatives.',
    aoFocus: 'AO2 (Evaluation)',
    tips: [
      'Focus on the value or success of strategies/responses.',
      'Consider short-term vs long-term.',
      'Consider different scales (local vs national).'
    ],
    levels: ['A-Level']
  },
  {
    word: 'To what extent',
    definition: 'Judge the importance or success of a statement or strategy.',
    requiredAction: 'Consider the statement. Argue for it, argue against it (or for alternative views). State clearly how much you agree.',
    aoFocus: 'AO2 (Evaluation) & AO1 (Knowledge)',
    tips: [
      'Avoid sitting on the fence. Use phrases like "To a significant extent..."',
      'Structure: Argument For -> Argument Against -> Judgement.',
      'Your conclusion must explicitly answer "how much".'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Analyse',
    definition: 'Break down data/information to find connections and patterns.',
    requiredAction: 'Use the TESLA framework (Trend, Evidence, Shape, Link, Anomaly) to deconstruct the figure.',
    aoFocus: 'AO3 (Skills)',
    tips: [
      'Do not explain WHY (unless asked). Focus on WHAT the data shows.',
      'Manipulate data (e.g. calculate range or % change).',
      'Identify anomalies.'
    ],
    levels: ['A-Level']
  },

  // --- GCSE SPECIFIC ---
  {
    word: 'Assess',
    definition: 'Weigh up the importance of something.',
    requiredAction: 'Give reasons for and against. Come to a conclusion about which is more important/significant.',
    aoFocus: 'AO3 (Judgement)',
    tips: [
      'Use phrases like "The most significant factor is..."',
      'Look at both sides of the argument.',
      'Give a clear conclusion.'
    ],
    levels: ['GCSE']
  },
  {
    word: 'Evaluate',
    definition: 'Judge the success or effectiveness.',
    requiredAction: 'Use your evidence to decide how good or bad something is. Often used for management strategies.',
    aoFocus: 'AO3 (Judgement)',
    tips: [
      'What went well? What went wrong?',
      'Did it work in the long term?',
      'Was it worth the money?'
    ],
    levels: ['GCSE']
  },
  {
    word: 'To what extent',
    definition: 'How much do you agree?',
    requiredAction: 'State your opinion (completely, partially, not at all). Support it with evidence.',
    aoFocus: 'AO3 (Judgement)',
    tips: [
      'Start your answer by stating your level of agreement.',
      'Use evidence to back up your opinion.',
      'Address the counter-argument.'
    ],
    levels: ['GCSE']
  },
  {
    word: 'Describe',
    definition: 'Say what you see.',
    requiredAction: 'Write about the main features of a photo, map, or graph.',
    aoFocus: 'AO3 (Skills) or AO1 (Knowledge)',
    tips: [
      'Do not explain why.',
      'Use compass directions (North, South).',
      'Quote figures if looking at a graph.'
    ],
    levels: ['GCSE']
  },
  {
    word: 'Suggest',
    definition: 'Give a possible reason or solution.',
    requiredAction: 'Apply your knowledge to a new situation (usually a photo or map).',
    aoFocus: 'AO3 (Application)',
    tips: [
      'Look at the figure provided.',
      'Use phrases like "This might be because..."',
      'There may be more than one correct answer.'
    ],
    levels: ['GCSE']
  },
  {
    word: 'Justify',
    definition: 'Give reasons for your choice.',
    requiredAction: 'Explain why you chose one option over another (often in Paper 3).',
    aoFocus: 'AO3 (Decision Making)',
    tips: [
      'Explain the benefits of your choice.',
      'Explain the problems with the rejected options.'
    ],
    levels: ['GCSE']
  },

  // --- SHARED / GENERIC ---
  {
    word: 'Explain',
    definition: 'Give reasons why something happens.',
    requiredAction: 'Use the "so what?" rule. Point -> Explain -> This means that...',
    aoFocus: 'AO1 (Understanding) / AO2 (Application)',
    tips: [
      'Use connectives like "because", "therefore", "leading to".',
      'Develop your points fully.'
    ],
    levels: ['GCSE', 'A-Level']
  },
  {
    word: 'Discuss',
    definition: 'Explore a topic by looking at different ideas and arguments around it.',
    requiredAction: 'Present a balanced view, considering various perspectives. Use evidence to support the different sides.',
    aoFocus: 'Tests a mix of AO1 (Knowledge) and AO2 (Application/Evaluation).',
    tips: [
      'Consider the pros and cons.',
      'Use case study evidence to illustrate different viewpoints.',
      'The command word is a trigger to explore, not just describe.'
    ],
    levels: ['A-Level', 'GCSE']
  },
  {
    word: 'Outline',
    definition: 'Set out the main characteristics or aspects of a topic or concept.',
    requiredAction: 'Provide a brief summary or description. This does not require detailed explanation.',
    aoFocus: 'Primarily tests AO1 (Knowledge and Understanding).',
    tips: [
      'Think in terms of bullet points or a short, structured list.',
      'Avoid going into deep explanation.'
    ],
    levels: ['A-Level', 'GCSE']
  },
];

export const MATHS_SKILLS: MathsSkill[] = [
    {
        id: 'mean',
        name: 'Mean',
        category: 'Measures of Central Tendency',
        instructions: [
            '1. Add up all the values in the dataset.',
            '2. Count how many values there are.',
            '3. Divide the sum of the values (Step 1) by the number of values (Step 2).'
        ],
        formula: 'Mean = (Sum of values) / (Number of values)',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'median',
        name: 'Median',
        category: 'Measures of Central Tendency',
        instructions: [
            '1. Arrange all the values in the dataset in ascending order (smallest to largest).',
            '2. Find the middle value.',
            '3. If there are two middle values (i.e., an even number of values), add them together and divide by 2.'
        ],
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'mode',
        name: 'Mode',
        category: 'Measures of Central Tendency',
        instructions: [
            '1. Look at all the values in the dataset.',
            '2. Identify the value that appears most frequently.',
            '3. It is possible to have more than one mode (bimodal) or no mode at all.'
        ],
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'range',
        name: 'Range',
        category: 'Measures of Dispersion',
        instructions: [
            '1. Identify the largest value in the dataset.',
            '2. Identify the smallest value in the dataset.',
            '3. Subtract the smallest value from the largest value.'
        ],
        formula: 'Range = Maximum value - Minimum value',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'iqr',
        name: 'Inter-Quartile Range (IQR)',
        category: 'Measures of Dispersion',
        instructions: [
            '1. Arrange the data in ascending order.',
            '2. Find the median. This is the second quartile (Q2).',
            '3. Find the median of the lower half of the data. This is the lower quartile (Q1).',
            '4. Find the median of the upper half of the data. This is the upper quartile (Q3).',
            '5. Subtract the lower quartile from the upper quartile.'
        ],
        formula: 'IQR = Q3 - Q1',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'std_dev',
        name: 'Standard Deviation',
        category: 'Measures of Dispersion',
        instructions: [
            '1. Calculate the mean of the dataset.',
            '2. For each value, subtract the mean and square the result.',
            '3. Calculate the mean of these squared differences (this is the variance).',
            '4. Take the square root of the variance.'
        ],
        formula: 'σ = √[ Σ(x - μ)² / N ]',
        levels: ['A-Level']
    },
    {
        id: 'spearman',
        name: "Spearman's Rank Correlation",
        category: 'Inferential and Relational Techniques',
        instructions: [
            '1. Rank the data for the first variable (1 for highest, etc.).',
            '2. Rank the data for the second variable.',
            '3. Calculate the difference in ranks (d) for each pair.',
            '4. Square the differences (d²).',
            '5. Sum the squared differences (Σd²).',
            '6. Substitute the values into the formula to find the correlation coefficient (rs).'
        ],
        formula: 'rs = 1 - (6 * Σd²) / (n(n² - 1))',
        levels: ['A-Level']
    },
    {
        id: 'chi_square',
        name: 'Chi-Square Test',
        category: 'Inferential and Relational Techniques',
        instructions: [
            '1. For each category, find the difference between the Observed (O) and Expected (E) values.',
            '2. Square this difference: (O - E)². ',
            '3. Divide the result by the Expected value: (O - E)² / E.',
            '4. Sum all of these results to get the Chi-Square (Χ²) value.'
        ],
        formula: 'Χ² = Σ [ (O - E)² / E ]',
        levels: ['A-Level']
    },
    {
        id: 'percentage',
        name: 'Percentage Increase/Decrease',
        category: 'Basic Numeracy',
        instructions: [
            '1. Find the difference between the two numbers.',
            '2. Divide the difference by the ORIGINAL number.',
            '3. Multiply by 100.'
        ],
        formula: '% Change = (Difference / Original) x 100',
        levels: ['A-Level', 'GCSE']
    }
];


export const MATHS_PROBLEMS: MathsProblem[] = [
    {
        id: 'm1',
        type: 'mean',
        question: 'Calculate the mean annual rainfall for the following locations (in mm):',
        data: [1200, 1150, 1300, 1250, 1100],
        answer: 1200,
        explanation: 'Sum of values / Number of values = 6000 / 5 = 1200.',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'm3',
        type: 'median',
        question: 'Find the median river discharge (cumecs) from this dataset:',
        data: [15, 22, 18, 14, 25, 12, 20],
        answer: 18,
        explanation: 'First, order the data: 12, 14, 15, 18, 20, 22, 25. The median is the middle value.',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'm5',
        type: 'mode',
        question: 'Find the modal soil moisture content (%) from these samples:',
        data: [25, 28, 26, 28, 30, 25, 28, 22],
        answer: 28,
        explanation: 'The value 28 appears three times, which is more than any other value.',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'm4',
        type: 'range',
        question: 'Calculate the range of temperatures (°C) recorded at this weather station:',
        data: [-2, 5, 8, 12, 15, 11, 4, 0],
        answer: 17,
        explanation: 'Range = Maximum value - Minimum value = 15 - (-2) = 17.',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'm6',
        type: 'iqr',
        question: 'Calculate the inter-quartile range (IQR) for this set of river pebble sizes (mm):',
        data: [15, 20, 22, 28, 35, 40, 48],
        answer: 20,
        explanation: 'Q1 is 20, Q3 is 40. IQR = 40 - 20 = 20.',
        levels: ['A-Level', 'GCSE']
    },
    {
        id: 'm7',
        type: 'std_dev',
        question: 'Calculate the standard deviation for these five measurements of coastal erosion per year (cm).',
        data: [6, 8, 9, 10, 12],
        answer: '2.28',
        explanation: 'Represents the average distance of each data point from the mean.',
        levels: ['A-Level']
    },
    {
        id: 'm8',
        type: 'spearman',
        question: "Calculate Spearman's Rank correlation coefficient for this data on river depth and velocity. The data is provided in pairs of (depth rank, velocity rank).",
        data: [1, 2, 2, 1, 3, 4, 4, 3, 5, 5], // (1,2), (2,1), (3,4), (4,3), (5,5)
        answer: '0.8',
        explanation: 'A strong positive correlation between river depth and velocity.',
        levels: ['A-Level']
    },
     {
        id: 'm9',
        type: 'chi_square',
        question: 'Calculate the Chi-Square value for this study on beach material distribution. The data is provided in pairs of (Observed count, Expected count).',
        data: [20, 15, 30, 35, 10, 10], // (O1, E1), (O2, E2), (O3, E3)
        answer: '2.38',
        explanation: 'Used to determine if there is a significant difference between observed and expected frequencies.',
        levels: ['A-Level']
    },
    {
        id: 'm10',
        type: 'percentage',
        question: 'The population of a town increased from 12,000 to 15,000. Calculate the percentage increase.',
        data: [12000, 15000],
        answer: '25',
        explanation: '(3000 / 12000) * 100 = 25%',
        levels: ['GCSE']
    }
];


export const STRUCTURE_GUIDES: StructureGuide[] = [
    {
        title: '20-MARK ESSAY (A-Level)',
        aoWeighting: 'AO1 (Knowledge) = 10 marks; AO2 (Evaluation) = 10 marks.',
        structureComponents: [
            {
                title: 'Introduction (Approx 5 mins)',
                details: 'Define key terms. State your argument immediately (e.g., "I agree to a large extent"). Outline the main points you will cover.'
            },
            {
                title: 'Main Body (Approx 25 mins)',
                details: 'Write 3-4 detailed paragraphs. Each must follow the PEEL structure (Point, Evidence, Explain, Link/Evaluate). Ensure you balance your argument (counter-points). Link back to the question at the end of every paragraph.'
            },
            {
                title: 'Conclusion (Approx 5 mins)',
                details: 'Summarise your main arguments. Provide a final, definitive judgement that answers the specific question asked. Do not introduce new information.'
            }
        ],
        extraTips: [
            'Focus on "Evaluation" - don\'t just tell the story, judge the significance.',
            'Use specific Case Study evidence (facts, figures, dates).',
            'Synopticity: Make links to other topics where relevant.'
        ],
        levels: ['A-Level']
    },
    {
        title: '9-MARK QUESTION (A-Level)',
        aoWeighting: 'AO1 (4 marks) + AO2 (5 marks).',
        structureComponents: [
            {
                title: 'Structure',
                details: 'Two or three well-developed paragraphs. Introduction and conclusion are brief or not strictly necessary if the argument is clear throughout, but a short concluding sentence helps.'
            },
            {
                title: 'Content',
                details: 'Focus on depth. Make a point (AO1), support with evidence, and then evaluate/analyse (AO2).'
            }
        ],
        levels: ['A-Level']
    },
    {
        title: '6-MARK ANALYSIS (A-Level)',
        aoWeighting: 'AO3 (6 marks).',
        structureComponents: [
            {
                title: 'TESLA Technique',
                details: 'Trend (General pattern), Evidence (Quote data), Shape (Linear/Fluctuating), Link (Connections), Anomaly (Outliers).'
            }
        ],
        levels: ['A-Level']
    },
    {
        title: '9-MARK QUESTION (GCSE)',
        aoWeighting: 'AO1 (Knowledge), AO2 (Application), AO3 (Judgement).',
        structureComponents: [
            {
                title: 'Introduction',
                details: 'Briefly state your judgement.'
            },
            {
                title: 'Paragraph 1 (For/Factor A)',
                details: 'Point, Evidence (Case Study), Explain.'
            },
            {
                title: 'Paragraph 2 (Against/Factor B)',
                details: 'Point, Evidence (Case Study), Explain.'
            },
            {
                title: 'Conclusion',
                details: 'Final judgement. "To a great extent..." or "However, X is more important because..."'
            }
        ],
        levels: ['GCSE']
    },
    {
        title: '6-MARK QUESTION (GCSE)',
        aoWeighting: 'Usually AO3 (Figure Analysis).',
        structureComponents: [
            {
                title: 'TEA Technique',
                details: 'Trend (What is the pattern?), Evidence (Quote numbers from the graph/map), Anomaly (What doesn\'t fit?).'
            }
        ],
        levels: ['GCSE']
    },
    {
        title: '4-MARK QUESTION',
        aoWeighting: 'AO1 (Knowledge & Understanding).',
        structureComponents: [
            {
                title: 'Point & Develop',
                details: 'Make a point (1 mark). Develop it with an explanation or example (1 mark). Repeat this twice for 4 marks.'
            }
        ],
        levels: ['GCSE', 'A-Level']
    }
];
