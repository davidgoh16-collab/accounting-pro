
import { CommandWord, MathsProblem, StructureGuide, MathsSkill, CourseLesson, VideoResource } from './types';
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
    'Geographical Applications'
];

export const AQA_UNITS = ALEVEL_UNITS; 

export const QUESTIONS = ALL_QUESTIONS;

export const VIDEO_LIBRARY: VideoResource[] = [
    { id: 'v1', title: 'SnapRevise: The Ultimate A-level Geography Resource', videoId: '5wJURQ3FetE', level: 'A-Level' },
    { id: 'v2', title: 'System Frameworks & Types of Feedback', videoId: '7kvltkvO4Wk', level: 'A-Level' },
    { id: 'v3', title: 'The Water Cycle', videoId: 'W3G2z7z9XBU', level: 'A-Level' },
    { id: 'v4', title: 'Water Balance', videoId: 'Y5ygf5tgL8c', level: 'A-Level' },
    { id: 'v5', title: 'The Carbon Cycle', videoId: 'xKMTaJCJ6Ww', level: 'A-Level' },
    { id: 'v6', title: 'Carbon Budget', videoId: '6smbaPNisPk', level: 'A-Level' },
    { id: 'v7', title: 'The Impact of the Water and Carbon Cycle on the Atmosphere', videoId: 'Ttuw_oBBT9s', level: 'A-Level' },
    { id: 'v8', title: 'Introduction to Coasts', videoId: 'Ak2vhd8IZ6E', level: 'A-Level' },
    { id: 'v9', title: 'Coasts: Sediment Budgets', videoId: 'rVc5gqxi0-I', level: 'A-Level' },
    { id: 'v10', title: 'Coasts: Geomorphological Processes', videoId: '_JG_yE3XQ7g', level: 'A-Level' },
    { id: 'v11', title: 'Coasts: Landscape Development', videoId: 'dY_WTVmoQIg', level: 'A-Level' },
    { id: 'v12', title: 'Coasts: Eustatic and Isostatic Sea Level Change', videoId: 'joYo0m-TaRs', level: 'A-Level' },
    { id: 'v13', title: 'Coasts: Coastal Management', videoId: 'PlJ7QpDhqo0', level: 'A-Level' },
    { id: 'v14', title: 'Coasts Case Study: Nile Delta', videoId: '3HxZNACWC98', level: 'A-Level' },
    { id: 'v15', title: 'Introduction to Glaciation', videoId: 'D-pjVNIROzM', level: 'A-Level' },
    { id: 'v16', title: 'Glaciation: Periglacial Landforms', videoId: 'CuIC2FUHlso', level: 'A-Level' },
    { id: 'v17', title: 'Natural Hazards', videoId: 'ieY0ymVv-nw', level: 'A-Level' },
    { id: 'v18', title: 'The Theory of Plate Tectonics', videoId: 'SYHMLtHQRmI', level: 'A-Level' },
    { id: 'v19', title: 'Natural Hazards: Volcanoes', videoId: 'JMdSAOUthBQ', level: 'A-Level' },
    { id: 'v20', title: 'Introduction to Places', videoId: 'hdZXR_eC60I', level: 'A-Level' },
    { id: 'v21', title: 'Changing Places', videoId: 'J1GCsi7FYZQ', level: 'A-Level' },
    { id: 'v22', title: 'Urbanisation: Patterns and Growth', videoId: 'uVkytXbkWIw', level: 'A-Level' },
    { id: 'v23', title: 'Urbanisation: Issues', videoId: 'ME9s21yrORU', level: 'A-Level' },
    { id: 'v24', title: 'The Urban Heat Island', videoId: 'kJ4x7F5oErw', level: 'A-Level' },
    { id: 'v25', title: 'Urban Case Study: London', videoId: 'xoKreMRQYo4', level: 'A-Level' },
    { id: 'v26', title: 'Urban Case Study: Rio de Janeiro', videoId: 'gFJTVOreh08', level: 'A-Level' },
    { id: 'v27', title: 'Deserts', videoId: 'Q2gTVr7uXOA', level: 'A-Level' },
    { id: 'v28', title: 'Globalisation', videoId: 'K-cymvzbE9I', level: 'A-Level' },
    { id: 'v29', title: 'Factors Affecting Globalisation', videoId: '4Nx2BezF0Bo', level: 'A-Level' },
    { id: 'v30', title: 'Global Trade', videoId: 'bbYwU3EGWjI', level: 'A-Level' },
    { id: 'v31', title: 'Transnational Corporations', videoId: 'U6MgUVehl2A', level: 'A-Level' },
    { id: 'v32', title: 'Global Governance', videoId: 'PGFue66Fgz4', level: 'A-Level' },
    { id: 'v33', title: 'Global Commons', videoId: 'ThhrwcWG_v0', level: 'A-Level' },
    { id: 'v34', title: 'Human Population and the Environment', videoId: 'a3En6Vpl_ds', level: 'A-Level' },
    { id: 'v35', title: 'International Migration', videoId: 'muqHF7u5AQQ', level: 'A-Level' },

    // --- GCSE VIDEOS ---
    // Natural Hazards
    { id: 'gcse_v1', title: 'Natural Hazards (Part 1)', videoId: 'LQp_82E2fTs', level: 'GCSE', topic: 'Natural Hazards' },
    { id: 'gcse_v2', title: 'Natural Hazards (Part 2)', videoId: '9AAWepfiu2Q', level: 'GCSE', topic: 'Natural Hazards' },

    // Tectonic Hazards
    { id: 'gcse_v3', title: 'Tectonic Hazards (Part 1)', videoId: 'RzKj4zWfjLY', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v4', title: 'Tectonic Hazards (Part 2)', videoId: 'zUaYhJrhnrE', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v5', title: 'Tectonic Hazards (Part 3)', videoId: 'OhtAtNuFtzQ', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v6', title: 'Tectonic Hazards (Part 4)', videoId: 'OzMeGF0GXWU', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v7', title: 'Tectonic Hazards (Part 5)', videoId: 'GoCkjr5WfyQ', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v8', title: 'Tectonic Hazards (Part 6)', videoId: '1RuhHqOdBnQ', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v9', title: 'Tectonic Hazards (Part 7)', videoId: 'lrS_240BkBA', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v10', title: 'Tectonic Hazards (Part 8)', videoId: 'tWVSmATx3jk', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v11', title: 'Tectonic Hazards (Part 9)', videoId: '8R7lwY4vjv4', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v12', title: 'Tectonic Hazards (Part 10)', videoId: 'T6Botca1_FQ', level: 'GCSE', topic: 'Tectonic Hazards' },
    { id: 'gcse_v13', title: 'Tectonic Hazards (Part 11)', videoId: 'hK-dUnWv7Zg', level: 'GCSE', topic: 'Tectonic Hazards' },

    // Weather Hazards
    { id: 'gcse_v14', title: 'Weather Hazards (Part 1)', videoId: 'jvfB4YFRC3w', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v15', title: 'Weather Hazards (Part 2)', videoId: '6hHMCgLtwao', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v16', title: 'Weather Hazards (Part 3)', videoId: '72LhtyFZadw', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v17', title: 'Weather Hazards (Part 4)', videoId: '0DIqel4KLW0', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v18', title: 'Weather Hazards (Part 5)', videoId: 'iEopE8qCKGE', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v19', title: 'Weather Hazards (Part 6)', videoId: '5MuabnhLOdY', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v20', title: 'Weather Hazards (Part 7)', videoId: 'Cui7eS7tPJc', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v21', title: 'Weather Hazards (Part 8)', videoId: 'pkCpqANQJA0', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v22', title: 'Weather Hazards (Part 9)', videoId: 'HPuSZZaJnJ0', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v23', title: 'Weather Hazards (Part 10)', videoId: '3KNDGPq1n9k', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v24', title: 'Weather Hazards (Part 11)', videoId: 'lFNHFC4ZBgI', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v25', title: 'Weather Hazards (Part 12)', videoId: 'rB4g0pE4Tw8', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v26', title: 'Weather Hazards (Part 13)', videoId: 'Arhqus8MQGQ', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v27', title: 'Weather Hazards (Part 14)', videoId: 'D-I2zlJLMm8', level: 'GCSE', topic: 'Weather Hazards' },
    { id: 'gcse_v28', title: 'Weather Hazards (Part 15)', videoId: 'FH8E2Q3qfJg', level: 'GCSE', topic: 'Weather Hazards' },

    // Climate Change
    { id: 'gcse_v29', title: 'Climate Change (Part 1)', videoId: '3fyOyHMlyRQ', level: 'GCSE', topic: 'Climate Change' },
    { id: 'gcse_v30', title: 'Climate Change (Part 2)', videoId: 'OS8_p_J9VLE', level: 'GCSE', topic: 'Climate Change' },
    { id: 'gcse_v31', title: 'Climate Change (Part 3)', videoId: 'DpEUOOwQ_XU', level: 'GCSE', topic: 'Climate Change' },
    { id: 'gcse_v32', title: 'Climate Change (Part 4)', videoId: 'EglASOE5eBo', level: 'GCSE', topic: 'Climate Change' },
    { id: 'gcse_v33', title: 'Climate Change (Part 5)', videoId: 'DutpzaJpMHQ', level: 'GCSE', topic: 'Climate Change' },
    { id: 'gcse_v34', title: 'Climate Change (Part 6)', videoId: 'U_0kWdNaPzY', level: 'GCSE', topic: 'Climate Change' },
    { id: 'gcse_v35', title: 'Climate Change (Part 7)', videoId: '9N-pN5zHfZI', level: 'GCSE', topic: 'Climate Change' },
    { id: 'gcse_v36', title: 'Climate Change (Part 8)', videoId: 'aAN0_UxXli4', level: 'GCSE', topic: 'Climate Change' },

    // Coastal Landscapes
    { id: 'gcse_v37', title: 'Coastal Landscapes (Part 1)', videoId: 'JC47DJU4gWE', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v38', title: 'Coastal Landscapes (Part 2)', videoId: 'l20SZC3O090', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v39', title: 'Coastal Landscapes (Part 3)', videoId: '6z2N8Mtv_kw', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v40', title: 'Coastal Landscapes (Part 4)', videoId: 'Ww_yhWXW47Q', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v41', title: 'Coastal Landscapes (Part 5)', videoId: 'gIUThLF7bIw', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v42', title: 'Coastal Landscapes (Part 6)', videoId: 'MaqDvbh0J0Q', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v43', title: 'Coastal Landscapes (Part 7)', videoId: 'TeHfdWJ5hEk', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v44', title: 'Coastal Landscapes (Part 8)', videoId: 'n3sMxrCl5Yc', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v45', title: 'Coastal Landscapes (Part 9)', videoId: 'MGHissPs180', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v46', title: 'Coastal Landscapes (Part 10)', videoId: '20jHXUHs1ek', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v47', title: 'Coastal Landscapes (Part 11)', videoId: '6hkqQ8YkV4U', level: 'GCSE', topic: 'Coastal Landscapes' },
    { id: 'gcse_v48', title: 'Coastal Landscapes (Part 12)', videoId: 'c8KEs0x_vyw', level: 'GCSE', topic: 'Coastal Landscapes' },

    // River Landscapes
    { id: 'gcse_v49', title: 'River Landscapes (Part 1)', videoId: '5JBVCaDntzI', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v50', title: 'River Landscapes (Part 2)', videoId: '67JGxLsi8oM', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v51', title: 'River Landscapes (Part 3)', videoId: 'mTIQDg1bV2I', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v52', title: 'River Landscapes (Part 4)', videoId: 'N_ZC9vBX4Wo', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v53', title: 'River Landscapes (Part 5)', videoId: 'YROlZS6sflI', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v54', title: 'River Landscapes (Part 6)', videoId: 'zuzUGNWO6ec', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v55', title: 'River Landscapes (Part 7)', videoId: 'b_B9VQ5WCVs', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v56', title: 'River Landscapes (Part 8)', videoId: 'XrGp0tFi6IQ', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v57', title: 'River Landscapes (Part 9)', videoId: '5ThPRongOzU', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v58', title: 'River Landscapes (Part 10)', videoId: 'GjyqlBloRGs', level: 'GCSE', topic: 'River Landscapes' },
    { id: 'gcse_v59', title: 'River Landscapes (Part 11)', videoId: 'suPuE-Q8Ipk', level: 'GCSE', topic: 'River Landscapes' },

    // Ecosystems
    { id: 'gcse_v60', title: 'Ecosystems (Part 1)', videoId: 't4Pbt0a7E_I', level: 'GCSE', topic: 'Ecosystems' },
    { id: 'gcse_v61', title: 'Ecosystems (Part 2)', videoId: 'PpzGpnFwQcU', level: 'GCSE', topic: 'Ecosystems' },
    { id: 'gcse_v62', title: 'Ecosystems (Part 3)', videoId: 'PlBTnEnhR44', level: 'GCSE', topic: 'Ecosystems' },
    { id: 'gcse_v63', title: 'Ecosystems (Part 4)', videoId: 'f2vt9mh7dfc', level: 'GCSE', topic: 'Ecosystems' },

    // Tropical Rainforests
    { id: 'gcse_v64', title: 'Tropical Rainforests (Part 1)', videoId: 'EiBJ6fFDoAU', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v65', title: 'Tropical Rainforests (Part 2)', videoId: 'AoI_ueDjC-s', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v66', title: 'Tropical Rainforests (Part 3)', videoId: '7rwUbm2ShkA', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v67', title: 'Tropical Rainforests (Part 4)', videoId: 'jUaZv6D6aE0', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v68', title: 'Tropical Rainforests (Part 5)', videoId: 'KniEgtNYpEM', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v69', title: 'Tropical Rainforests (Part 6)', videoId: 'LgM1vq1cj7g', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v70', title: 'Tropical Rainforests (Part 7)', videoId: '7-G8Z0GigqQ', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v71', title: 'Tropical Rainforests (Part 8)', videoId: 'IIkFA9ds7kg', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v72', title: 'Tropical Rainforests (Part 9)', videoId: 'UTUz6c4pGD4', level: 'GCSE', topic: 'Tropical Rainforests' },
    { id: 'gcse_v73', title: 'Tropical Rainforests (Part 10)', videoId: '95p3f52_lVE', level: 'GCSE', topic: 'Tropical Rainforests' },

    // Hot Deserts
    { id: 'gcse_v74', title: 'Hot Deserts (Part 1)', videoId: 'umj-z3Q5154', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v75', title: 'Hot Deserts (Part 2)', videoId: 'uGRvnUVkwec', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v76', title: 'Hot Deserts (Part 3)', videoId: 'lyxATVYWOVQ', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v77', title: 'Hot Deserts (Part 4)', videoId: 'yfnr0BmJmMk', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v78', title: 'Hot Deserts (Part 5)', videoId: 'opiMGsWd8iA', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v79', title: 'Hot Deserts (Part 6)', videoId: '5EIGP7AuKps', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v80', title: 'Hot Deserts (Part 7)', videoId: 'ZTihfkXrdaY', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v81', title: 'Hot Deserts (Part 8)', videoId: 'l6gnjNw0Aak', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v82', title: 'Hot Deserts (Part 9)', videoId: '86OKOiKZBwc', level: 'GCSE', topic: 'Hot Deserts' },
    { id: 'gcse_v83', title: 'Hot Deserts (Part 10)', videoId: '4bVB_zF-TGY', level: 'GCSE', topic: 'Hot Deserts' },

    // Cold Environments
    { id: 'gcse_v84', title: 'Cold Environments (Part 1)', videoId: 'eAMzMNBV4Bw', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v85', title: 'Cold Environments (Part 2)', videoId: 'yhCdLs78GEA', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v86', title: 'Cold Environments (Part 3)', videoId: 's6nTDjGSL4o', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v87', title: 'Cold Environments (Part 4)', videoId: 'SeX-IL8oZJo', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v88', title: 'Cold Environments (Part 5)', videoId: 'vLCe_BVpEiY', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v89', title: 'Cold Environments (Part 6)', videoId: 'cykVSlX729Q', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v90', title: 'Cold Environments (Part 7)', videoId: 'W8YdLL0iWp0', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v91', title: 'Cold Environments (Part 8)', videoId: '0iBzxrA396k', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v92', title: 'Cold Environments (Part 9)', videoId: 'VuWIgc7SfrU', level: 'GCSE', topic: 'Cold Environments' },
    { id: 'gcse_v93', title: 'Cold Environments (Part 10)', videoId: 'sN4UN98f_jg', level: 'GCSE', topic: 'Cold Environments' },
];

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
        aoWeighting: 'AO1 (Knowledge) & AO2 (Explain/Apply).',
        structureComponents: [
            {
                title: 'Point 1',
                details: 'State a reason/factor/impact. Explain it fully using "this means that...". Add an example.'
            },
            {
                title: 'Point 2',
                details: 'State a second reason/factor/impact. Explain it fully. Link back to the question.'
            }
        ],
        extraTips: [
            'Often uses "Explain" or "Suggest".',
            'If it asks for "impacts", try to give two distinct ones.',
            'Use geographical terminology.'
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

// --- COURSEWORK STRUCTURE ---
export const COURSE_LESSONS: CourseLesson[] = [
    // --- A-LEVEL LESSONS ---
    // Water and Carbon Cycles (A-Level)
    { id: '1.1', title: 'Systems framework and their application', chapter: 'Water and Carbon Cycles' },
    { id: '1.2', title: 'The water cycle', chapter: 'Water and Carbon Cycles' },
    { id: '1.3', title: 'The carbon cycle', chapter: 'Water and Carbon Cycles' },
    { id: '1.4', title: 'Water, carbon, climate and life on Earth', chapter: 'Water and Carbon Cycles' },

    // Coastal Systems and Landscapes (A-Level)
    { id: '3.1', title: 'Introduction to coastal systems and landscapes', chapter: 'Coastal Systems and Landscapes' },
    { id: '3.2', title: 'Systems and processes in coastal environments', chapter: 'Coastal Systems and Landscapes' },
    { id: '3.3', title: 'Coastal landscape development', chapter: 'Coastal Systems and Landscapes' },
    { id: '3.4', title: 'Coastal management', chapter: 'Coastal Systems and Landscapes' },
    { id: '3.5', title: 'Quantitative and qualitative skills in coastal landscapes', chapter: 'Coastal Systems and Landscapes' },

    // Hazards (A-Level)
    { id: '5.1', title: 'The concept of a hazard in a geographical context', chapter: 'Hazards' },
    { id: '5.2', title: 'Plate tectonics', chapter: 'Hazards' },
    { id: '5.3', title: 'Volcanic hazards', chapter: 'Hazards' },
    { id: '5.4', title: 'Seismic hazards', chapter: 'Hazards' },
    { id: '5.5', title: 'Storm (typhoons, hurricanes) hazards', chapter: 'Hazards' },
    { id: '5.6', title: 'Fires in nature: The nature of wildfires', chapter: 'Hazards' },

    // Global Systems and Global Governance (A-Level)
    { id: '7.1', title: 'Globalisation', chapter: 'Global Systems and Global Governance' },
    { id: '7.2', title: 'Global systems', chapter: 'Global Systems and Global Governance' },
    { id: '7.3', title: 'International trade and access to markets', chapter: 'Global Systems and Global Governance' },
    { id: '7.4', title: 'Global governance', chapter: 'Global Systems and Global Governance' },
    { id: '7.5', title: "The 'global commons'", chapter: 'Global Systems and Global Governance' },
    { id: '7.6', title: 'Globalisation critique', chapter: 'Global Systems and Global Governance' },

    // Changing Places (A-Level)
    { id: '8.1', title: 'The nature and importance of places', chapter: 'Changing Places' },
    { id: '8.2', title: 'Changing places: relationships and connections', chapter: 'Changing Places' },
    { id: '8.3', title: 'Changing places: meaning and representation', chapter: 'Changing Places' },
    { id: '8.4', title: 'Representations of place: quantitative and qualitative sources', chapter: 'Changing Places' },

    // Contemporary Urban Environments (A-Level)
    { id: '9.1', title: 'Patterns of urbanisation since 1945', chapter: 'Contemporary Urban Environments' },
    { id: '9.2', title: 'Urban forms', chapter: 'Contemporary Urban Environments' },
    { id: '9.3', title: 'Social and economic issues associated with urbanisation', chapter: 'Contemporary Urban Environments' },
    { id: '9.4', title: 'Urban climate', chapter: 'Contemporary Urban Environments' },
    { id: '9.5', title: 'Urban drainage', chapter: 'Contemporary Urban Environments' },
    { id: '9.6', title: 'Urban waste and its disposal', chapter: 'Contemporary Urban Environments' },
    { id: '9.7', title: 'Other contemporary urban environmental issues', chapter: 'Contemporary Urban Environments' },
    { id: '9.8', title: 'Sustainable urban development', chapter: 'Contemporary Urban Environments' },

    // --- GCSE LESSONS (Aligned to AQA Textbook) ---
    // The Challenge of Natural Hazards (Section A)
    { id: 'G-Ch1', title: 'Natural hazards', chapter: 'The Challenge of Natural Hazards' },
    { id: 'G-Ch2', title: 'Tectonic hazards', chapter: 'The Challenge of Natural Hazards' },
    { id: 'G-Ch3', title: 'Weather hazards', chapter: 'The Challenge of Natural Hazards' },
    { id: 'G-Ch4', title: 'Climate change', chapter: 'The Challenge of Natural Hazards' },

    // The Living World (Section B)
    { id: 'G-Ch5', title: 'Ecosystems', chapter: 'The Living World' },
    { id: 'G-Ch6', title: 'Tropical rainforests', chapter: 'The Living World' },
    { id: 'G-Ch7', title: 'Hot deserts', chapter: 'The Living World' },
    { id: 'G-Ch8', title: 'Cold environments', chapter: 'The Living World' },

    // Physical Landscapes in the UK (Section C)
    { id: 'G-Ch9', title: 'The physical diversity of the UK', chapter: 'Physical Landscapes in the UK' },
    { id: 'G-Ch10', title: 'Coastal landscapes', chapter: 'Physical Landscapes in the UK' },
    { id: 'G-Ch11', title: 'River landscapes', chapter: 'Physical Landscapes in the UK' },
    { id: 'G-Ch12', title: 'Glacial landscapes', chapter: 'Physical Landscapes in the UK' },

    // Urban Issues and Challenges (Paper 2, Section A)
    { id: 'G-Ch13', title: 'The global pattern of urban change', chapter: 'Urban Issues and Challenges' },
    { id: 'G-Ch14', title: 'Urban growth in Nigeria (Lagos)', chapter: 'Urban Issues and Challenges' },
    { id: 'G-Ch15', title: 'Urban challenges in the UK (London)', chapter: 'Urban Issues and Challenges' },
    { id: 'G-Ch16', title: 'Sustainable development of urban areas', chapter: 'Urban Issues and Challenges' },

    // The Changing Economic World (Paper 2, Section B)
    { id: 'G-Ch17', title: 'Economic development and quality of life', chapter: 'The Changing Economic World' },
    { id: 'G-Ch18', title: 'Reducing the global development gap', chapter: 'The Changing Economic World' },
    { id: 'G-Ch19', title: 'Economic development in Nigeria', chapter: 'The Changing Economic World' },
    { id: 'G-Ch20', title: 'Economic change in the UK', chapter: 'The Changing Economic World' },

    // The Challenge of Resource Management (Paper 2, Section C)
    { id: 'G-Ch21', title: 'Global resource management', chapter: 'The Challenge of Resource Management' },
    { id: 'G-Ch22', title: 'Resources in the UK', chapter: 'The Challenge of Resource Management' },
    { id: 'G-Ch23', title: 'Food', chapter: 'The Challenge of Resource Management' },
    { id: 'G-Ch24', title: 'Water', chapter: 'The Challenge of Resource Management' },
    { id: 'G-Ch25', title: 'Energy', chapter: 'The Challenge of Resource Management' },

    // Geographical Applications (Paper 3)
    { id: 'G-Ch26', title: 'Issue evaluation', chapter: 'Geographical Applications' },
    { id: 'G-Ch27', title: 'Fieldwork and geographical enquiry', chapter: 'Geographical Applications' }
];
