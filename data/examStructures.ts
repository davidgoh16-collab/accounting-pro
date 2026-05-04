export interface ExamSection {
    title: string;
    description: string;
    questions: { marks: number; type: string; questionNumber?: string }[];
}

export interface ExamStructure {
    level: 'A-Level';
    paper: string;
    title: string;
    defaultDuration: number; // in minutes
    totalMarks: number;
    sections: ExamSection[];
}

export const EXAM_STRUCTURES: ExamStructure[] = [
    {
        level: 'A-Level',
        paper: 'Paper 1',
        title: 'Paper 1: Financial Accounting',
        defaultDuration: 180, // 3 hours
        totalMarks: 120,
        sections: [
            {
                title: 'Section A: Multiple Choice & Short Answer',
                description: '10 multiple choice questions and several short answer questions.',
                questions: [
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 2, type: 'Define/State' },
                    { marks: 3, type: 'Explain Concept' },
                    { marks: 4, type: 'Calculate/Record' },
                    { marks: 6, type: 'Assess/Evaluate' }
                ]
            },
            {
                title: 'Section B: Structured Questions',
                description: 'Two structured questions focusing on financial records and adjustments.',
                questions: [
                    { marks: 20, type: 'Structured: Financial Statements' },
                    { marks: 20, type: 'Structured: Correction of Errors' }
                ]
            },
            {
                title: 'Section C: Extended Answer',
                description: 'Two extended answer questions requiring analysis and evaluation.',
                questions: [
                    { marks: 25, type: 'Extended: Analysis of Performance' },
                    { marks: 25, type: 'Extended: Evaluation of Accounting Policy' }
                ]
            }
        ]
    },
    {
        level: 'A-Level',
        paper: 'Paper 2',
        title: 'Paper 2: Management Accounting',
        defaultDuration: 180, // 3 hours
        totalMarks: 120,
        sections: [
            {
                title: 'Section A: Multiple Choice & Short Answer',
                description: '10 multiple choice questions and several short answer questions.',
                questions: [
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 1, type: 'Multiple Choice' },
                    { marks: 2, type: 'Define/State' },
                    { marks: 3, type: 'Explain/Calculate' },
                    { marks: 6, type: 'Analyse Budgetary Control' }
                ]
            },
            {
                title: 'Section B: Structured Questions',
                description: 'Two structured questions focusing on management accounting techniques.',
                questions: [
                    { marks: 20, type: 'Structured: Budgeting/Marginal Costing' },
                    { marks: 20, type: 'Structured: Standard Costing' }
                ]
            },
            {
                title: 'Section C: Extended Answer',
                description: 'Two extended answer questions requiring evaluation of management decisions.',
                questions: [
                    { marks: 25, type: 'Extended: Investment Appraisal' },
                    { marks: 25, type: 'Extended: Strategic Decision Making' }
                ]
            }
        ]
    }
];
