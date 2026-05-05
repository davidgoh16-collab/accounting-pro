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

// Structures mirror the AQA A-level Accounting (7127) papers as set in
// June 2023 (Paper 1 - 7127/1 Financial Accounting; Paper 2 - 7127/2
// Accounting for analysis and decision-making). Each paper is 3 hours
// and 120 marks split 30/40/50 across Sections A, B and C.
export const EXAM_STRUCTURES: ExamStructure[] = [
    {
        level: 'A-Level',
        paper: 'Paper 1',
        title: 'Paper 1: Financial Accounting (7127/1)',
        defaultDuration: 180,
        totalMarks: 120,
        sections: [
            {
                title: 'Section A: Objective and short-answer questions (30 marks)',
                description: 'Ten 1-mark multiple choice questions followed by short structured questions covering core financial accounting techniques.',
                questions: [
                    { marks: 1, type: 'Multiple Choice', questionNumber: '01' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '02' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '03' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '04' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '05' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '06' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '07' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '08' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '09' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '10' },
                    { marks: 3, type: 'Short Explanation', questionNumber: '11' },
                    { marks: 7, type: 'Calculation: Trading Account / Sole Trader', questionNumber: '12' },
                    { marks: 10, type: 'Calculation: Partnership / Ledger Account', questionNumber: '13' }
                ]
            },
            {
                title: 'Section B: Structured questions (40 marks)',
                description: 'Two multi-part structured questions on limited company accounts, sole-trader records or incomplete records, each finishing with a 6-mark assess/evaluate written response.',
                questions: [
                    { marks: 14, type: 'Structured: Statement of Changes in Equity / Limited Company', questionNumber: '14.1' },
                    { marks: 6, type: 'Assess: Impact on Stakeholders', questionNumber: '14.2' },
                    { marks: 14, type: 'Structured: Statement of Financial Position', questionNumber: '15.1' },
                    { marks: 6, type: 'Assess: Accounting Records / Concepts', questionNumber: '15.2' }
                ]
            },
            {
                title: 'Section C: Extended written questions (50 marks)',
                description: 'Two 25-mark evaluative essays requiring a justified recommendation, drawing on financial and non-financial / ethical factors.',
                questions: [
                    { marks: 25, type: 'Evaluate: Financial Decision / Statement of Cash Flows', questionNumber: '16' },
                    { marks: 25, type: 'Evaluate: Ethics for Accountants', questionNumber: '17' }
                ]
            }
        ]
    },
    {
        level: 'A-Level',
        paper: 'Paper 2',
        title: 'Paper 2: Accounting for Analysis and Decision-Making (7127/2)',
        defaultDuration: 180,
        totalMarks: 120,
        sections: [
            {
                title: 'Section A: Objective and short-answer questions (30 marks)',
                description: 'Ten 1-mark multiple choice questions followed by short calculation and explanation tasks on costing, budgeting and variance analysis.',
                questions: [
                    { marks: 1, type: 'Multiple Choice', questionNumber: '01' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '02' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '03' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '04' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '05' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '06' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '07' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '08' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '09' },
                    { marks: 1, type: 'Multiple Choice', questionNumber: '10' },
                    { marks: 3, type: 'Short Explanation', questionNumber: '11' },
                    { marks: 7, type: 'Calculation: Activity Based Costing / Overheads', questionNumber: '12' },
                    { marks: 5, type: 'Calculation: Break-even Point', questionNumber: '13.1' },
                    { marks: 2, type: 'Calculation: Margin of Safety', questionNumber: '13.2' },
                    { marks: 3, type: 'Calculation: Profit / Loss at Output', questionNumber: '13.3' }
                ]
            },
            {
                title: 'Section B: Structured questions (40 marks)',
                description: 'Two multi-part structured questions on budgeting and capital investment appraisal, each ending with a 6-mark assess written response.',
                questions: [
                    { marks: 6, type: 'Structured: Budgeted Income Statement', questionNumber: '14.1' },
                    { marks: 8, type: 'Structured: Budgeted Statement of Financial Position', questionNumber: '14.2' },
                    { marks: 6, type: 'Assess: Usefulness of Budgeting', questionNumber: '14.3' },
                    { marks: 12, type: 'Calculation: Net Present Value', questionNumber: '15.1' },
                    { marks: 2, type: 'Calculation: Payback Period', questionNumber: '15.2' },
                    { marks: 6, type: 'Assess: Investment Appraisal Decision', questionNumber: '15.3' }
                ]
            },
            {
                title: 'Section C: Extended written questions (50 marks)',
                description: 'Two 25-mark evaluative essays on strategic management-accounting decisions, requiring a justified recommendation that weighs financial and non-financial factors.',
                questions: [
                    { marks: 25, type: 'Evaluate: Make-or-Buy / Decision Making', questionNumber: '16' },
                    { marks: 25, type: 'Evaluate: Variance Analysis / Standard Costing', questionNumber: '17' }
                ]
            }
        ]
    }
];
