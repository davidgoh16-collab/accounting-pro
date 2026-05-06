
import { CommandWord, MathsProblem, StructureGuide, MathsSkill, CourseLesson, VideoResource } from './types';
import { ALL_QUESTIONS } from './database';

export const ALEVEL_UNITS = [
    'All Units',
    'The Role of the Accountant in Business',
    'Types of Business Organisation',
    'The Double Entry Model',
    'Verification of Accounting Records',
    'Accounting Concepts',
    'Financial Statements of Sole Traders',
    'Limited Company Accounts',
    'Analysis and Interpretation of Financial Information',
    'Budgeting',
    'Marginal Costing',
    'Standard Costing and Variance Analysis',
    'Absorption and Activity Based Costing',
    'Capital Investment Appraisal',
    'Incomplete Records',
    'Partnership Accounts',
    'Accounting Standards (IAS/IFRS)',
    'Ethics for Accountants',
    'Impact of Technology on Accounting'
];

export const GCSE_UNITS = ALEVEL_UNITS;

export const IGCSE_UNITS = ALEVEL_UNITS;

export const AQA_UNITS = ALEVEL_UNITS; 

export const QUESTIONS = ALL_QUESTIONS;

export const VIDEO_LIBRARY: VideoResource[] = [
    // --- PLAYLIST 1 & 3: Paper 2 / Management Accounting ---
    { id: 'v1', title: 'Cash Budget AQA A Level Accounting Preparing a Cash Budget How to Prepare a Cash Budget', videoId: 'BVPor02be-k', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v2', title: 'Capital Investment Appraisal Payback Period Discounted Cash Flow Net Present Value A Level Accounts', videoId: 'GTP0263e5sk', level: 'A-Level', topic: 'Capital Investment Appraisal', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v3', title: 'AQA A Level Accounting Section C Written Question on Variance Analysis', videoId: 'KYL-zHw_qog', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v4', title: 'AQA A Level Accounting Section C Written Question Capital Investment Appraisal', videoId: '3TgNFdz5y0E', level: 'A-Level', topic: 'Capital Investment Appraisal', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v5', title: 'Activity Based Costing AQA A Level Accounting', videoId: 'khF3R37O4QY', level: 'A-Level', topic: 'Absorption and Activity Based Costing', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v6', title: 'Break Even Analysis AQA A Level Accounting', videoId: 'JtKuNxLkHio', level: 'A-Level', topic: 'Marginal Costing', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v7', title: 'Break Even Analysis AQA A Level Accounting', videoId: 'BqDZkzm7wmA', level: 'A-Level', topic: 'Marginal Costing', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v8', title: 'Break Even Analysis Introduction AQA A Level Accounting', videoId: 'FEHXBEN9Vfc', level: 'A-Level', topic: 'Marginal Costing', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v9', title: 'Reconciling Variances by Flexing the Budget AQA A Level Accounting', videoId: 'LWdOjCRkXOU', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v10', title: 'Reconciliation of Budgeted Costs to Actual Costs AQA A Level Accounting', videoId: 'u9mkxqiZoUA', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v11', title: 'Causes of Variances AQA A Level Accounting', videoId: 'w5zQhhLaKvA', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v12', title: 'Sales Variances AQA A Level Accounting', videoId: '2O5X3PpQ9sQ', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v13', title: 'Labour Variances AQA A Level Accounting Revision', videoId: 'vsak4ATmWkI', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v14', title: 'Materials Variances AQA A Level Accounting', videoId: 'GvZo9MTHJeE', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v15', title: 'Standard Costing AQA A Level Accounting', videoId: '28nHI3SOMn0', level: 'A-Level', topic: 'Standard Costing and Variance Analysis', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v16', title: 'Master Budget Budgeted Income Statement Budgeted Statement of Financial Position A Level Accounting', videoId: 'TpaCjyd5kmI', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v17', title: 'Differences Between Management and Financial Accounting AQA A Level Accounting', videoId: 'xaVausXaErg', level: 'A-Level', topic: 'The Role of the Accountant in Business', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v18', title: 'Differences Between Cash and Profit AQA A Level Accounting', videoId: 'TeAcNzcoo98', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v19', title: 'Payments to Trade Payables Budget AQA A Level Accounting', videoId: 'QKj_nhgWEms', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v20', title: 'Receipts from Trade Receivables Budget AQA A Level Accounting', videoId: 'JdFI4SOdXAI', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v21', title: 'Direct Labour Hours Budget AQA A Level Accounting', videoId: '5mwmZNTDKXg', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v22', title: 'Production and Purchases Budgets AQA A Level Accounting', videoId: 'bIYhAKNO9qY', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v23', title: 'Investor Analysis AQA A Level Accounting Section C 25 Marks Written Question', videoId: 'dT36IHdHkrU', level: 'A-Level', topic: 'Analysis and Interpretation of Financial Information', paper: 'Paper 1', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v24', title: 'AQA A Level Budgeted Income Statements Explained Easy Examples and Exam Tips Paper 2 Revision', videoId: 'QMtB1d4PN8E', level: 'A-Level', topic: 'Budgeting', paper: 'Paper 2', playlists: ['Paper 2 - Accounting for Analysis and Decision Making', 'Year 13 Exam Success and Key Topics'] },

    // --- PLAYLIST 2 & 4: Paper 1 / Financial Accounting ---
    { id: 'v25', title: 'Incomplete Records with Goods for Own Use | AQA A Level Accounting Revision and Exam Practice', videoId: 'LtYFrbtR7_I', level: 'A-Level', topic: 'Incomplete Records', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v26', title: 'Accrual of Expenses When the Expense Invoice is Received After the Year End AQA A Level Accounting', videoId: '-HNe1v3ZR3A', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v27', title: 'Adjustments for Final Accounts for Sole Traders AQA A Level Accounting Revision', videoId: 'V2j4nAHd_AU', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v28', title: 'Sole Trader Income Statement and Statement of Financial Position Quiz AQA A Level Accounting', videoId: 'U9CpQBHBCa0', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v29', title: 'Calculating Depreciation Charge for the Year and Accumulated Depreciation AQA A Level Accounting', videoId: 'xmweRwv2BBE', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v30', title: 'Sole Trader Income Statement and Statement of Financial Position Example 2 AQA A Level Accounting', videoId: 'Jb9Iy_naNS4', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v31', title: 'Sole Trader Income Statement and Statement of Financial Position A Level Accounting', videoId: 'rxum5pIny68', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v32', title: 'Accrual and Prepayment of Income Question AQA A Level Accounting', videoId: 'L3ERcAzBpvU', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v33', title: 'Provision for Doubtful Debts Nominal Ledger Account Income Statement Statement of Financial Position', videoId: '40FuYcRWjQs', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v34', title: 'Sole Trader Financial Statements Workings Depreciation Goods on Sale or Return Doubtful Debts', videoId: 'prFxvzGcUKI', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v35', title: 'Preparing Sole Trader Financial Statements AQA A Level Accounting', videoId: 'mTpgpTXvrVY', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v36', title: 'Disposal Sale of Non Current Assets Involving Part Exchange AQA A Level Accounting', videoId: 'o_8zabGKv3I', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v37', title: 'Sale of Non Current Assets Disposal of Non-Current Assets AQA A Level Accounting', videoId: 'PVAD3Ld53SU', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v38', title: 'Depreciation Straight Line Method and Reducing Balance Method AQA A Level Accounting', videoId: 'J0LuTZKzYQY', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v39', title: 'Provision for Doubtful Debts AQA A Level Accounting', videoId: 'kzJkgs-o0sM', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v40', title: 'Recovery of Irrecoverable Debts AQA A Level Accounting', videoId: 'HoBe9ngFU28', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v41', title: 'Accrual and Prepayment of Income AQA A Level Accounting', videoId: 'RtkPxHYAqOA', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v42', title: 'Sources of Finance AQA A Level Accounting', videoId: 'oZuc3ujGx6o', level: 'A-Level', topic: 'Types of Business Organisation', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v43', title: 'Comparisons of Sole Traders, Partnerships and Limited Companies AQA A Level Accounting', videoId: '4XlZzaqT5BI', level: 'A-Level', topic: 'Types of Business Organisation', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v44', title: 'Advantages and Disadvantages of Sole Traders, Partnerships and Limited Companies A Level Accounting', videoId: 'spAw26_b6gI', level: 'A-Level', topic: 'Types of Business Organisation', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v45', title: 'Accrual and Prepayment of Expenses Nominal Ledger Accounts AQA A Level Accounting Revision', videoId: 'ocpjB5fDbbo', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v46', title: 'How to Prepare the Cash Flow Statement for a Limited Company | AQA A Level Accounting Revision', videoId: 'vdM1SpB7110', level: 'A-Level', topic: 'Limited Company Accounts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v47', title: 'Statement of Cash Flows Revaluation Amount in Non Current Assets Calculation AQA A Level Accounting', videoId: 'hTseYYwvJ60', level: 'A-Level', topic: 'Limited Company Accounts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v48', title: 'Disposal Account AQA A Level Accounting', videoId: 'pOMXmshWjFA', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v49', title: 'Nominal ledger accounts AQA A Level Accounting', videoId: 'LFX3sp4N2Gs', level: 'A-Level', topic: 'The Double Entry Model', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v50', title: "Partner's Current Account AQA A Level Accounting", videoId: 'UU18DB_O2Rg', level: 'A-Level', topic: 'Partnership Accounts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v51', title: 'Partnership Revaluation Account June 2019 Paper 1 Question 15 AQA A Level Accounting', videoId: '8OXRwt4EnRQ', level: 'A-Level', topic: 'Partnership Accounts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v52', title: 'Bank Reconciliation Cash Book Bank Statement AQA A Level Accounting Revision', videoId: 'C23NwfIAi4c', level: 'A-Level', topic: 'Verification of Accounting Records', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v53', title: 'Statement of Changes in Equity and Retained Earnings AQA A Level Accounting Revision Exam Tips', videoId: 'BiU9SIHciQU', level: 'A-Level', topic: 'Limited Company Accounts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v54', title: 'Financial Statements of Limited Companies Statement of Changes in Equity and Financial Position', videoId: 'xxK6PW_bzwY', level: 'A-Level', topic: 'Limited Company Accounts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v55', title: 'Statement of Changes in Equity Issue of Shares Share Premium Profit for the Year Dividends Paid AQA', videoId: 'KDi4dIUyxjc', level: 'A-Level', topic: 'Limited Company Accounts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v56', title: 'A Level Accounting May 2020 Paper 1 Question 17 Accounting Policies and Ethics Explained Section C', videoId: 'HBuhw3SDt7k', level: 'A-Level', topic: 'Accounting Standards (IAS/IFRS)', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v57', title: 'AQA A Level Accounting May 2024 Paper 1 7127/1 Question 12 Errors Journals Revised Profits Explained', videoId: 'AA8Aql_3HgM', level: 'A-Level', topic: 'Verification of Accounting Records', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v58', title: 'Prepayment and Accrual of Expenses Income Statement and Statement of Financial Position Sole Trader', videoId: 'g5M8TjWCc7M', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v59', title: 'Prepayment of Expenses Where the Expense Goes Past the Year End AQA A Level Accounting', videoId: 'q2GpTNbgO9w', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v60', title: "AQA A Level Accounting May 2013 Unit 1 Question 1d Supplier's Nominal Ledger Account Bond Supply", videoId: 'nCIllep7kwo', level: 'A-Level', topic: 'The Double Entry Model', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v61', title: 'AQA A Level Accounting May 2013 Unit 1 Question 3 Income Statement & Statement of Financial Position', videoId: '7Zd2FisU1uo', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v62', title: 'AQA A Level Accounting May 2023 Paper 1 Q13 Trading Section Goods for Own Use Closing Inventory', videoId: 'UamL-7J7vMw', level: 'A-Level', topic: 'Financial Statements of Sole Traders', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v63', title: 'AQA A Level Accounting May 2014 Unit 1 Question 1b Customer\'s Nominal Ledger Account Tom Dale', videoId: 'QqNUIq4oZok', level: 'A-Level', topic: 'The Double Entry Model', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 12 Exam Success and Key Topics'] },
    { id: 'v64', title: 'How to Prepare the Schedule of Non-Current Assets AQA A Level Accounting Tutorial Exam Revision', videoId: 'DmjEEZ0Nit0', level: 'A-Level', topic: 'Accounting Concepts', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics'] },
    { id: 'v65', title: 'Suspense Account Errors AQA A Level Accounting June 2022 Paper 1 Question 13 FULL Walkthrough', videoId: 'nEDndtwsr1g', level: 'A-Level', topic: 'Verification of Accounting Records', paper: 'Paper 1', playlists: ['Paper 1 - Financial Accounting', 'Year 13 Exam Success and Key Topics', 'Year 12 Exam Success and Key Topics'] },
];




export const COMMAND_WORDS: CommandWord[] = [
  {
    word: 'Prepare',
    definition: 'Produce a financial statement, ledger account, or other accounting record.',
    requiredAction: 'Set out the document in the correct format with appropriate headings, line items, and totals. Ensure double-entry principles are followed.',
    aoFocus: 'AO2 (Application)',
    tips: [
      'Use the correct format (T-account, columnar, vertical).',
      'Show all workings clearly.',
      'Double-check that the statement balances or totals correctly.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Calculate',
    definition: 'Work out a numerical answer, showing your working.',
    requiredAction: 'Apply the correct formula and show each step of the calculation. State the final answer clearly with appropriate units.',
    aoFocus: 'AO2 (Application)',
    tips: [
      'Always show your workings — marks are awarded for method.',
      'State the formula before substituting values.',
      'Round to 2 decimal places unless told otherwise.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Analyse',
    definition: 'Break down data or information to identify patterns, trends, and relationships.',
    requiredAction: 'Examine the figures or scenario in detail. Identify what the data shows, compare figures, and draw out meaning.',
    aoFocus: 'AO3 (Analysis)',
    tips: [
      'Use ratios and percentages to support your analysis.',
      'Compare across time periods or against industry benchmarks.',
      'Identify trends, anomalies, and significant changes.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Evaluate',
    definition: 'Make a judgement on the effectiveness, value, or success of something, weighing up evidence.',
    requiredAction: 'Consider strengths and weaknesses, advantages and disadvantages. Reach a supported conclusion.',
    aoFocus: 'AO3 (Analysis & Evaluation)',
    tips: [
      'Consider both sides of the argument.',
      'Use accounting data to support your judgement.',
      'Reach a clear, justified conclusion.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Discuss',
    definition: 'Explore a topic by considering different viewpoints, arguments, and evidence.',
    requiredAction: 'Present a balanced view with arguments for and against. Support each point with accounting knowledge.',
    aoFocus: 'AO1 (Knowledge) & AO3 (Analysis)',
    tips: [
      'Consider stakeholder perspectives (shareholders, creditors, managers).',
      'Use real-world accounting examples where possible.',
      'Provide a balanced discussion before concluding.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Explain',
    definition: 'Give reasons why something happens or how it works.',
    requiredAction: 'Describe the process or concept, then develop your point to show understanding of why or how.',
    aoFocus: 'AO1 (Knowledge & Understanding)',
    tips: [
      'Use connectives like "because", "therefore", "this means that".',
      'Develop your points fully — don\'t just state facts.',
      'Link back to accounting principles where relevant.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'State',
    definition: 'Give a brief, factual answer without explanation.',
    requiredAction: 'Provide a concise answer. No development or justification is required.',
    aoFocus: 'AO1 (Knowledge)',
    tips: [
      'Keep your answer short and precise.',
      'Use correct accounting terminology.',
      'One clear point per mark available.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Outline',
    definition: 'Set out the main points or characteristics briefly.',
    requiredAction: 'Provide a summary of the key features without going into detailed explanation.',
    aoFocus: 'AO1 (Knowledge & Understanding)',
    tips: [
      'Think in bullet-point style — concise and structured.',
      'Cover the main points without excessive detail.',
      'Use correct accounting terminology.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Justify',
    definition: 'Give valid reasons or evidence to support an answer or conclusion.',
    requiredAction: 'Explain why your answer or recommendation is appropriate, using supporting data or accounting principles.',
    aoFocus: 'AO3 (Analysis & Evaluation)',
    tips: [
      'Clearly link your reasoning to the data provided.',
      'Reference accounting standards or concepts where appropriate.',
      'Explain why alternatives were rejected.'
    ],
    levels: ['A-Level']
  },
  {
    word: 'Reconcile',
    definition: 'Identify and explain the differences between two sets of figures and bring them into agreement.',
    requiredAction: 'List the items causing the difference, apply adjustments, and show that the two figures agree after reconciliation.',
    aoFocus: 'AO2 (Application)',
    tips: [
      'Work systematically through each difference.',
      'Present in the correct format (e.g., bank reconciliation statement).',
      'Check that your final figures agree.'
    ],
    levels: ['A-Level']
  },
];

export const MATHS_SKILLS: MathsSkill[] = [
    { id: 'gross_profit_margin', name: 'Gross Profit Margin', category: 'Profitability Ratios',
      instructions: ['1. Calculate Gross Profit (Revenue - Cost of Sales).', '2. Divide Gross Profit by Revenue.', '3. Multiply by 100 to get a percentage.'],
      formula: 'Gross Profit Margin = (Gross Profit / Revenue) × 100', levels: ['A-Level'] },
    { id: 'net_profit_margin', name: 'Net Profit Margin (Profit for the Year %)', category: 'Profitability Ratios',
      instructions: ['1. Find the Profit for the Year (after all expenses).', '2. Divide by Revenue.', '3. Multiply by 100.'],
      formula: 'Net Profit Margin = (Profit for Year / Revenue) × 100', levels: ['A-Level'] },
    { id: 'roce', name: 'Return on Capital Employed (ROCE)', category: 'Profitability Ratios',
      instructions: ['1. Calculate Operating Profit.', '2. Calculate Capital Employed (Total Assets – Current Liabilities).', '3. Divide Operating Profit by Capital Employed and multiply by 100.'],
      formula: 'ROCE = (Operating Profit / Capital Employed) × 100', levels: ['A-Level'] },
    { id: 'current_ratio', name: 'Current Ratio', category: 'Liquidity Ratios',
      instructions: ['1. Find Current Assets from the statement of financial position.', '2. Find Current Liabilities.', '3. Divide Current Assets by Current Liabilities.'],
      formula: 'Current Ratio = Current Assets / Current Liabilities', levels: ['A-Level'] },
    { id: 'acid_test', name: 'Acid Test Ratio (Quick Ratio)', category: 'Liquidity Ratios',
      instructions: ['1. Find Current Assets and subtract Inventories.', '2. Divide the result by Current Liabilities.'],
      formula: 'Acid Test = (Current Assets – Inventories) / Current Liabilities', levels: ['A-Level'] },
    { id: 'straight_line_dep', name: 'Straight Line Depreciation', category: 'Depreciation',
      instructions: ['1. Find the depreciable amount (Cost – Residual Value).', '2. Divide by the useful life in years.'],
      formula: 'Annual Depreciation = (Cost – Residual Value) / Useful Life', levels: ['A-Level'] },
    { id: 'reducing_balance_dep', name: 'Reducing Balance Depreciation', category: 'Depreciation',
      instructions: ['1. Take the Net Book Value at the start of the year.', '2. Multiply by the depreciation rate (%).', '3. The result is the depreciation charge for that year.'],
      formula: 'Depreciation = NBV × Rate%', levels: ['A-Level'] },
    { id: 'break_even', name: 'Break-Even Point', category: 'Management Accounting',
      instructions: ['1. Calculate Contribution per Unit (Selling Price – Variable Cost per Unit).', '2. Divide Total Fixed Costs by the Contribution per Unit.'],
      formula: 'BEP (units) = Fixed Costs / Contribution per Unit', levels: ['A-Level'] },
    { id: 'margin_of_safety', name: 'Margin of Safety', category: 'Management Accounting',
      instructions: ['1. Calculate the break-even point in units.', '2. Subtract BEP from budgeted/actual sales.'],
      formula: 'Margin of Safety = Actual Sales – Break-Even Sales', levels: ['A-Level'] },
    { id: 'variance', name: 'Variance Calculation', category: 'Standard Costing',
      instructions: ['1. Find the Standard (budgeted) figure.', '2. Find the Actual figure.', '3. Calculate the difference.', '4. Label as Favourable (F) if actual cost < standard, or Adverse (A) if actual cost > standard.'],
      formula: 'Variance = Standard – Actual', levels: ['A-Level'] },
    { id: 'npv', name: 'Net Present Value (NPV)', category: 'Capital Investment Appraisal',
      instructions: ['1. Multiply each year\'s net cash flow by its discount factor.', '2. Sum all discounted cash flows.', '3. Subtract the initial investment.', '4. A positive NPV means the project is worthwhile.'],
      formula: 'NPV = Σ(Cash Flow × Discount Factor) – Initial Investment', levels: ['A-Level'] },
    { id: 'payback', name: 'Payback Period', category: 'Capital Investment Appraisal',
      instructions: ['1. List the cumulative cash flows year by year.', '2. Identify the year when cumulative cash flows turn positive.', '3. For the exact month, interpolate within that year.'],
      formula: 'Payback = Years before full recovery + (Remaining / Cash flow in payback year)', levels: ['A-Level'] },
    { id: 'percentage', name: 'Percentage Change', category: 'Basic Numeracy',
      instructions: ['1. Find the difference between the two numbers.', '2. Divide the difference by the ORIGINAL number.', '3. Multiply by 100.'],
      formula: '% Change = (Difference / Original) × 100', levels: ['A-Level'] }
];

export const MATHS_PROBLEMS: MathsProblem[] = [
    { id: 'm1', type: 'gross_profit_margin', question: 'A business has revenue of £250,000 and cost of sales of £150,000. Calculate the gross profit margin.', data: [250000, 150000], answer: '40', explanation: 'Gross Profit = £250,000 – £150,000 = £100,000. GPM = (100,000 / 250,000) × 100 = 40%.', levels: ['A-Level'] },
    { id: 'm2', type: 'current_ratio', question: 'A company has current assets of £45,000 and current liabilities of £30,000. Calculate the current ratio.', data: [45000, 30000], answer: '1.5', explanation: 'Current Ratio = 45,000 / 30,000 = 1.5:1.', levels: ['A-Level'] },
    { id: 'm3', type: 'acid_test', question: 'Current assets are £60,000 (including £15,000 inventories). Current liabilities are £30,000. Calculate the acid test ratio.', data: [60000, 15000, 30000], answer: '1.5', explanation: 'Acid Test = (60,000 – 15,000) / 30,000 = 45,000 / 30,000 = 1.5:1.', levels: ['A-Level'] },
    { id: 'm4', type: 'straight_line_dep', question: 'A machine costs £24,000 with a residual value of £4,000 and a useful life of 5 years. Calculate the annual straight-line depreciation.', data: [24000, 4000, 5], answer: '4000', explanation: '(24,000 – 4,000) / 5 = £4,000 per year.', levels: ['A-Level'] },
    { id: 'm5', type: 'break_even', question: 'Fixed costs are £50,000. Selling price is £20 per unit. Variable cost is £12 per unit. Calculate the break-even point.', data: [50000, 20, 12], answer: '6250', explanation: 'Contribution = £20 – £12 = £8. BEP = £50,000 / £8 = 6,250 units.', levels: ['A-Level'] },
    { id: 'm6', type: 'npv', question: 'An investment costs £10,000 and returns £6,000 in Year 1 (discount factor 0.909) and £7,000 in Year 2 (discount factor 0.826). Calculate the NPV.', data: [10000, 6000, 0.909, 7000, 0.826], answer: '1236', explanation: 'Year 1: 6,000 × 0.909 = £5,454. Year 2: 7,000 × 0.826 = £5,782. NPV = 5,454 + 5,782 – 10,000 = £1,236.', levels: ['A-Level'] },
    { id: 'm7', type: 'roce', question: 'Operating profit is £36,000. Total assets are £200,000 and current liabilities are £40,000. Calculate ROCE.', data: [36000, 200000, 40000], answer: '22.5', explanation: 'Capital Employed = 200,000 – 40,000 = £160,000. ROCE = (36,000 / 160,000) × 100 = 22.5%.', levels: ['A-Level'] },
    { id: 'm8', type: 'percentage', question: 'Revenue increased from £120,000 to £150,000. Calculate the percentage increase.', data: [120000, 150000], answer: '25', explanation: '(30,000 / 120,000) × 100 = 25%.', levels: ['A-Level'] },
    { id: 'm9', type: 'variance', question: 'Budgeted material cost was £8,000 but actual was £8,500. Calculate the variance and state whether it is favourable or adverse.', data: [8000, 8500], answer: '500 Adverse', explanation: 'Variance = 8,000 – 8,500 = –£500 (Adverse, as actual cost exceeded budget).', levels: ['A-Level'] },
    { id: 'm10', type: 'payback', question: 'An investment of £20,000 generates net cash flows of £5,000 per year. Calculate the payback period.', data: [20000, 5000], answer: '4', explanation: '£20,000 / £5,000 = 4 years.', levels: ['A-Level'] }
];

export const STRUCTURE_GUIDES: StructureGuide[] = [
    {
        title: 'Paper 1: Financial Accounting (3 hours, 120 marks, 50%)',
        aoWeighting: 'AO1 (Knowledge): 25-30%; AO2 (Application): 50-55%; AO3 (Analysis & Evaluation): 15-25%.',
        structureComponents: [
            { title: 'Section A: Compulsory Structured Questions', details: 'Multiple short and medium-length questions covering double entry, verification of records, financial statements of sole traders, and limited company accounts. Prepare accounts, journals, and ledgers.' },
            { title: 'Section B: Extended Questions', details: 'Longer scenario-based questions requiring preparation of complex financial statements, ratio analysis, and partnership accounts. Show all workings clearly.' },
            { title: 'Approach', details: 'Read the scenario carefully. Set out financial statements in the correct format. Label all workings. Check that balance sheets balance.' }
        ],
        extraTips: [
            'Always show your workings — method marks are available.',
            'Use correct accounting terminology and formats.',
            'Double-check arithmetic, especially totals and balancing figures.',
            'Allocate time proportionally: roughly 1.5 minutes per mark.'
        ],
        levels: ['A-Level']
    },
    {
        title: 'Paper 2: Management Accounting (2 hours, 80 marks, 33.3%)',
        aoWeighting: 'AO1 (Knowledge): 25-30%; AO2 (Application): 50-55%; AO3 (Analysis & Evaluation): 15-25%.',
        structureComponents: [
            { title: 'Section A: Compulsory Questions', details: 'Questions on budgeting, marginal costing, break-even analysis, and standard costing. Expect calculations with follow-up explanation questions.' },
            { title: 'Section B: Extended Questions', details: 'Capital investment appraisal (NPV, payback, ARR), absorption costing, and activity-based costing. May include discursive elements.' },
            { title: 'Approach', details: 'Show formula → substitution → answer. For discursive questions, consider both quantitative and qualitative factors.' }
        ],
        extraTips: [
            'State the formula before calculating.',
            'Label variances as Favourable (F) or Adverse (A).',
            'For investment appraisal, consider non-financial factors too.',
            'Allocate time: roughly 1.5 minutes per mark.'
        ],
        levels: ['A-Level']
    },
    {
        title: 'Paper 3: Accounting Principles and Ethics (1 hour, 40 marks, 16.7%)',
        aoWeighting: 'AO1 (Knowledge): 30-40%; AO2 (Application): 30-40%; AO3 (Analysis & Evaluation): 20-30%.',
        structureComponents: [
            { title: 'Section A: Short Answer Questions', details: 'Test knowledge of accounting standards (IAS/IFRS), ethical principles, the role of the accountant, and the impact of technology.' },
            { title: 'Section B: Extended Response', details: 'Scenario-based ethical dilemmas or discussion of accounting standards. Requires balanced evaluation and clear judgement.' },
            { title: 'Approach', details: 'For ethics questions, identify the ethical issue, consider stakeholder perspectives, reference relevant standards/principles, and reach a justified conclusion.' }
        ],
        extraTips: [
            'Know the five fundamental ethical principles (integrity, objectivity, professional competence, confidentiality, professional behaviour).',
            'Reference specific IAS/IFRS standards by name and number where relevant.',
            'Consider the impact of technology (cloud accounting, AI, automation).',
            'Reach a clear conclusion in evaluation questions.'
        ],
        levels: ['A-Level']
    }
];

// --- COURSE LESSONS (AQA Accounting 7127) ---
export const COURSE_LESSONS: CourseLesson[] = [
    { id: '3.1.1', title: 'Users of financial information', chapter: 'The Role of the Accountant in Business' },
    { id: '3.1.2', title: 'Financial vs management accounting', chapter: 'The Role of the Accountant in Business' },
    { id: '3.2.1', title: 'Sole traders', chapter: 'Types of Business Organisation' },
    { id: '3.2.2', title: 'Partnerships', chapter: 'Types of Business Organisation' },
    { id: '3.2.3', title: 'Limited companies (Ltd and PLC)', chapter: 'Types of Business Organisation' },
    { id: '3.3.1', title: 'Books of prime entry', chapter: 'The Double Entry Model' },
    { id: '3.3.2', title: 'Double entry bookkeeping and ledger accounts', chapter: 'The Double Entry Model' },
    { id: '3.3.3', title: 'The trial balance', chapter: 'The Double Entry Model' },
    { id: '3.4.1', title: 'Bank reconciliation statements', chapter: 'Verification of Accounting Records' },
    { id: '3.4.2', title: 'Control accounts', chapter: 'Verification of Accounting Records' },
    { id: '3.4.3', title: 'Correction of errors and suspense accounts', chapter: 'Verification of Accounting Records' },
    { id: '3.5.1', title: 'Accruals and prepayments', chapter: 'Accounting Concepts' },
    { id: '3.5.2', title: 'Depreciation (straight-line and reducing balance)', chapter: 'Accounting Concepts' },
    { id: '3.5.3', title: 'Irrecoverable debts and allowances', chapter: 'Accounting Concepts' },
    { id: '3.6.1', title: 'Income statement of a sole trader', chapter: 'Financial Statements of Sole Traders' },
    { id: '3.6.2', title: 'Statement of financial position of a sole trader', chapter: 'Financial Statements of Sole Traders' },
    { id: '3.7.1', title: 'Income statement of a limited company', chapter: 'Limited Company Accounts' },
    { id: '3.7.2', title: 'Statement of financial position of a limited company', chapter: 'Limited Company Accounts' },
    { id: '3.7.3', title: 'Statement of changes in equity', chapter: 'Limited Company Accounts' },
    { id: '3.8.1', title: 'Ratio analysis: profitability', chapter: 'Analysis and Interpretation of Financial Information' },
    { id: '3.8.2', title: 'Ratio analysis: liquidity', chapter: 'Analysis and Interpretation of Financial Information' },
    { id: '3.8.3', title: 'Ratio analysis: efficiency', chapter: 'Analysis and Interpretation of Financial Information' },
    { id: '3.8.4', title: 'Limitations of ratio analysis', chapter: 'Analysis and Interpretation of Financial Information' },
    { id: '3.9.1', title: 'Purpose and types of budgets', chapter: 'Budgeting' },
    { id: '3.9.2', title: 'Preparing budgets', chapter: 'Budgeting' },
    { id: '3.10.1', title: 'Marginal costing and contribution', chapter: 'Marginal Costing' },
    { id: '3.10.2', title: 'Break-even analysis', chapter: 'Marginal Costing' },
    { id: '3.10.3', title: 'Margin of safety and target profit', chapter: 'Marginal Costing' },
    { id: '3.11.1', title: 'Standard costs and standard costing', chapter: 'Standard Costing and Variance Analysis' },
    { id: '3.11.2', title: 'Variance analysis', chapter: 'Standard Costing and Variance Analysis' },
    { id: '3.12.1', title: 'Absorption costing', chapter: 'Absorption and Activity Based Costing' },
    { id: '3.12.2', title: 'Activity based costing (ABC)', chapter: 'Absorption and Activity Based Costing' },
    { id: '3.13.1', title: 'Payback period', chapter: 'Capital Investment Appraisal' },
    { id: '3.13.2', title: 'Accounting rate of return (ARR)', chapter: 'Capital Investment Appraisal' },
    { id: '3.13.3', title: 'Net present value (NPV)', chapter: 'Capital Investment Appraisal' },
    { id: '3.14.1', title: 'Accounting for incomplete records', chapter: 'Incomplete Records' },
    { id: '3.14.2', title: 'Reconstructing accounts from limited information', chapter: 'Incomplete Records' },
    { id: '3.15.1', title: 'Partnership appropriation accounts', chapter: 'Partnership Accounts' },
    { id: '3.15.2', title: 'Changes in partnerships', chapter: 'Partnership Accounts' },
    { id: '3.15.3', title: 'Goodwill in partnerships', chapter: 'Partnership Accounts' },
    { id: '3.16.1', title: 'International Accounting Standards overview', chapter: 'Accounting Standards (IAS/IFRS)' },
    { id: '3.16.2', title: 'Key standards (IAS 1, IAS 2, IAS 16, IAS 37, IAS 38)', chapter: 'Accounting Standards (IAS/IFRS)' },
    { id: '3.17.1', title: 'Ethical principles for accountants', chapter: 'Ethics for Accountants' },
    { id: '3.17.2', title: 'Ethical dilemmas and conflicts of interest', chapter: 'Ethics for Accountants' },
    { id: '3.18.1', title: 'Cloud accounting and digital bookkeeping', chapter: 'Impact of Technology on Accounting' },
    { id: '3.18.2', title: 'AI, automation and the future of accounting', chapter: 'Impact of Technology on Accounting' },
];

export const ALEVEL_SPEC_TOPICS: Record<string, string[]> = {
    'The Role of the Accountant in Business': ['Users of financial information', 'Stewardship and accountability', 'Financial vs management accounting'],
    'Types of Business Organisation': ['Sole traders', 'Partnerships', 'Private limited companies', 'Public limited companies'],
    'The Double Entry Model': ['Books of prime entry', 'Double entry bookkeeping', 'Ledger accounts', 'Trial balance'],
    'Verification of Accounting Records': ['Bank reconciliation', 'Control accounts', 'Suspense accounts', 'Correction of errors'],
    'Accounting Concepts': ['Going concern', 'Accruals', 'Consistency', 'Prudence', 'Depreciation', 'Irrecoverable debts'],
    'Financial Statements of Sole Traders': ['Income statement', 'Statement of financial position', 'Adjustments'],
    'Limited Company Accounts': ['Share capital and reserves', 'Income statement', 'Statement of financial position', 'Statement of changes in equity'],
    'Analysis and Interpretation of Financial Information': ['Profitability ratios', 'Liquidity ratios', 'Efficiency ratios', 'Gearing ratio', 'Limitations'],
    'Budgeting': ['Purpose of budgets', 'Cash budgets', 'Trade receivables budgets', 'Budgetary control'],
    'Marginal Costing': ['Contribution', 'Break-even analysis', 'Margin of safety', 'Target profit', 'Limiting factors'],
    'Standard Costing and Variance Analysis': ['Standard costs', 'Material variances', 'Labour variances', 'Overhead variances'],
    'Absorption and Activity Based Costing': ['Overhead absorption rates', 'Over/under absorption', 'Activity based costing'],
    'Capital Investment Appraisal': ['Payback period', 'ARR', 'NPV', 'Non-financial factors'],
    'Incomplete Records': ['Calculating missing figures', 'Statement of affairs', 'Margins and mark-ups'],
    'Partnership Accounts': ['Appropriation accounts', 'Capital and current accounts', 'Admission and retirement', 'Goodwill'],
    'Accounting Standards (IAS/IFRS)': ['IAS 1', 'IAS 2', 'IAS 16', 'IAS 37', 'IAS 38'],
    'Ethics for Accountants': ['Integrity', 'Objectivity', 'Professional competence', 'Confidentiality', 'Professional behaviour'],
    'Impact of Technology on Accounting': ['Cloud accounting', 'Digital bookkeeping', 'AI and automation', 'Cyber security'],
};

export const YEAR12_TOPICS: string[] = [
    'The Role of the Accountant in Business',
    'Types of Business Organisation',
    'The Double Entry Model',
    'Verification of Accounting Records',
    'Accounting Concepts',
    'Financial Statements of Sole Traders',
    'Limited Company Accounts',
    'Analysis and Interpretation of Financial Information',
    'Budgeting',
    'Marginal Costing',
];

export const YEAR13_TOPICS: string[] = [
    'Standard Costing and Variance Analysis',
    'Absorption and Activity Based Costing',
    'Capital Investment Appraisal',
    'Incomplete Records',
    'Partnership Accounts',
    'Accounting Standards (IAS/IFRS)',
    'Ethics for Accountants',
    'Impact of Technology on Accounting',
];

export const ALEVEL_PAPER_MAPPING: Record<string, string> = {
    'The Role of the Accountant in Business': 'Paper 3',
    'Types of Business Organisation': 'Paper 1',
    'The Double Entry Model': 'Paper 1',
    'Verification of Accounting Records': 'Paper 1',
    'Accounting Concepts': 'Paper 1',
    'Financial Statements of Sole Traders': 'Paper 1',
    'Limited Company Accounts': 'Paper 1',
    'Analysis and Interpretation of Financial Information': 'Paper 1',
    'Budgeting': 'Paper 2',
    'Marginal Costing': 'Paper 2',
    'Standard Costing and Variance Analysis': 'Paper 2',
    'Absorption and Activity Based Costing': 'Paper 2',
    'Capital Investment Appraisal': 'Paper 2',
    'Incomplete Records': 'Paper 1',
    'Partnership Accounts': 'Paper 1',
    'Accounting Standards (IAS/IFRS)': 'Paper 3',
    'Ethics for Accountants': 'Paper 3',
    'Impact of Technology on Accounting': 'Paper 3',
};

export const GCSE_SPEC_TOPICS = ALEVEL_SPEC_TOPICS;
export const IGCSE_SPEC_TOPICS = ALEVEL_SPEC_TOPICS;

export const GCSE_PAPER_MAPPING = ALEVEL_PAPER_MAPPING;
export const IGCSE_PAPER_MAPPING = ALEVEL_PAPER_MAPPING;
