export interface ExamSection {
    title: string;
    description: string;
    questions: { marks: number; type: string; questionNumber?: string }[];
}

export interface ExamStructure {
    level: 'GCSE' | 'A-Level' | 'IGCSE';
    paper: string;
    title: string;
    defaultDuration: number; // in minutes
    totalMarks: number;
    sections: ExamSection[];
}

export const EXAM_STRUCTURES: ExamStructure[] = [
    // --- AQA GCSE ---
    {
        level: 'GCSE',
        paper: 'Paper 1',
        title: 'Paper 1: Living with the Physical Environment',
        defaultDuration: 90,
        totalMarks: 88,
        sections: [
            {
                title: 'Section A: The Challenge of Natural Hazards',
                description: 'Tectonic hazards, weather hazards, and climate change.',
                questions: [
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 2, type: 'Short Answer' },
                    { marks: 4, type: 'Explain Formation' },
                    { marks: 6, type: 'Evaluate/Assess (AO3)' },
                    { marks: 9, type: 'Evaluate Case Study' }
                ]
            },
            {
                title: 'Section B: The Living World',
                description: 'Ecosystems, tropical rainforests, and hot deserts or cold environments.',
                questions: [
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 4, type: 'Explain Process' },
                    { marks: 6, type: 'Assess Impacts' },
                    { marks: 9, type: 'Evaluate Management' } // Optional choice usually, stick to one
                ]
            },
            {
                title: 'Section C: Physical Landscapes in the UK',
                description: 'Coasts and Rivers.',
                questions: [
                    { marks: 2, type: 'Define/State' },
                    { marks: 4, type: 'Explain Formation (Coasts)' },
                    { marks: 4, type: 'Explain Formation (Rivers)' },
                    { marks: 6, type: 'Assess Strategies' }
                ]
            }
        ]
    },
    {
        level: 'GCSE',
        paper: 'Paper 2',
        title: 'Paper 2: Challenges in the Human Environment',
        defaultDuration: 90,
        totalMarks: 88,
        sections: [
            {
                title: 'Section A: Urban Issues and Challenges',
                description: 'Urban growth, opportunities, and challenges.',
                questions: [
                    { marks: 2, type: 'Short Answer' },
                    { marks: 4, type: 'Explain Impacts' },
                    { marks: 6, type: 'Assess Strategies' },
                    { marks: 9, type: 'Evaluate Urban Change' }
                ]
            },
            {
                title: 'Section B: The Changing Economic World',
                description: 'Development gap, Nigeria/NEE case study, UK economy.',
                questions: [
                    { marks: 2, type: 'Short Answer' },
                    { marks: 4, type: 'Explain Causes' },
                    { marks: 6, type: 'Assess Impacts' },
                    { marks: 9, type: 'Evaluate TNCs/Aid' }
                ]
            },
            {
                title: 'Section C: The Challenge of Resource Management',
                description: 'Resource management (Food, Water, or Energy).',
                questions: [
                    { marks: 3, type: 'Short Answer' },
                    { marks: 6, type: 'Explain Strategies (Energy)' }
                ]
            }
        ]
    },
    {
        level: 'GCSE',
        paper: 'Paper 3',
        title: 'Paper 3: Geographical Applications',
        defaultDuration: 75,
        totalMarks: 76,
        sections: [
            {
                title: 'Section A: Issue Evaluation',
                description: 'Based on pre-release material (Generic for practice).',
                questions: [
                    { marks: 2, type: 'Short Answer' },
                    { marks: 4, type: 'Explain Viewpoints' },
                    { marks: 6, type: 'Assess Options' },
                    { marks: 9, type: 'Decision Making Exercise' }
                ]
            },
            {
                title: 'Section B: Fieldwork',
                description: 'Human and Physical fieldwork inquiries.',
                questions: [
                    { marks: 2, type: 'Short Answer (Method)' },
                    { marks: 4, type: 'Explain Data Presentation' },
                    { marks: 6, type: 'Assess Results' },
                    { marks: 9, type: 'Evaluate Conclusion Validity' }
                ]
            }
        ]
    },
    // --- Edexcel IGCSE ---
    {
        level: 'IGCSE',
        paper: 'Paper 1',
        title: 'Paper 1: Physical Geography',
        defaultDuration: 70, // 1h 10m
        totalMarks: 70,
        sections: [
            {
                title: 'Section A: River Environments',
                description: 'Hydrological cycle, river processes, and management.',
                questions: [
                    { marks: 2, type: 'State/Define' },
                    { marks: 4, type: 'Explain Process' },
                    { marks: 8, type: 'Assess Case Study' } // Edexcel IGCSE uses 8 mark case studies
                ]
            },
            {
                title: 'Section B: Coastal Environments',
                description: 'Coastal processes, landforms, and management.',
                questions: [
                    { marks: 2, type: 'State/Define' },
                    { marks: 4, type: 'Explain Formation' },
                    { marks: 8, type: 'Evaluate Management' }
                ]
            },
            {
                title: 'Section C: Hazardous Environments',
                description: 'Tectonic and climatic hazards.',
                questions: [
                    { marks: 2, type: 'Describe Pattern' },
                    { marks: 5, type: 'Explain Impacts' },
                    { marks: 8, type: 'Evaluate Response' }
                ]
            }
        ]
    },
    {
        level: 'IGCSE',
        paper: 'Paper 2',
        title: 'Paper 2: Human Geography',
        defaultDuration: 105, // 1h 45m
        totalMarks: 105,
        sections: [
            {
                title: 'Section A: Economic Activity and Energy',
                description: 'Sectors, energy gap, and sustainable energy.',
                questions: [
                    { marks: 3, type: 'Calculate/Describe' },
                    { marks: 6, type: 'Explain Factors' },
                    { marks: 12, type: 'Evaluate Energy Mix' } // 12 marker
                ]
            },
            {
                title: 'Section B: Rural Environments',
                description: 'Rural changes and challenges.',
                questions: [
                    { marks: 3, type: 'Describe' },
                    { marks: 6, type: 'Explain Changes' },
                    { marks: 12, type: 'Evaluate Management' }
                ]
            },
            {
                title: 'Section C: Urban Environments',
                description: 'Urbanization, megacities, and challenges.',
                questions: [
                    { marks: 3, type: 'Describe Pattern' },
                    { marks: 6, type: 'Explain Challenges' },
                    { marks: 12, type: 'Evaluate Urban Sustainability' }
                ]
            }
        ]
    },
    // --- AQA A-Level ---
    {
        level: 'A-Level',
        paper: 'Paper 1',
        title: 'Paper 1: Physical Geography',
        defaultDuration: 150, // 2h 30m
        totalMarks: 120,
        sections: [
            {
                title: 'Section A: Water and Carbon Cycles',
                description: 'Major stores and cycles.',
                questions: [
                    { marks: 4, type: 'Outline Process' },
                    { marks: 6, type: 'Analyse Data (AO3)' },
                    { marks: 20, type: 'Essay: Assess Importance' }
                ]
            },
            {
                title: 'Section B: Coastal Systems',
                description: 'Coastal processes and management.',
                questions: [
                    { marks: 4, type: 'Outline Concept' },
                    { marks: 6, type: 'Assess Qualitative Data' },
                    { marks: 20, type: 'Essay: Evaluate Management' }
                ]
            },
            {
                title: 'Section C: Hazards',
                description: 'Tectonics, wildfires, and storms.',
                questions: [
                    { marks: 4, type: 'Outline Characteristics' },
                    { marks: 6, type: 'Analyse Data' },
                    { marks: 20, type: 'Essay: Assess Impacts/Responses' }
                ]
            }
        ]
    },
    {
        level: 'A-Level',
        paper: 'Paper 2',
        title: 'Paper 2: Human Geography',
        defaultDuration: 150, // 2h 30m
        totalMarks: 120,
        sections: [
            {
                title: 'Section A: Global Systems and Governance',
                description: 'Globalisation, trade, and Antarctica.',
                questions: [
                    { marks: 4, type: 'Outline Factor' },
                    { marks: 6, type: 'Analyse Data' },
                    { marks: 20, type: 'Essay: Evaluate Governance' }
                ]
            },
            {
                title: 'Section B: Changing Places',
                description: 'Place meaning, representation, and change.',
                questions: [
                    { marks: 4, type: 'Outline Concept' },
                    { marks: 6, type: 'Analyse Qualitative Source' },
                    { marks: 20, type: 'Essay: Evaluate Place Meaning' }
                ]
            },
            {
                title: 'Section C: Contemporary Urban Environments',
                description: 'Urbanisation, sustainability, and waste.',
                questions: [
                    { marks: 4, type: 'Outline Policy' },
                    { marks: 6, type: 'Analyse Data' },
                    { marks: 20, type: 'Essay: Assess Sustainability' }
                ]
            }
        ]
    }
];
