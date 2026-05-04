
import { CaseStudyLocation } from './types';

export const CASE_STUDY_LOCATIONS: CaseStudyLocation[] = [
  // --- FINANCIAL ACCOUNTING ---
  { name: 'Sole Trader Final Accounts', topic: 'Financial Statements of Sole Traders', category: 'Financial Accounting', lat: 51.51, lng: -0.13, details: 'Preparation of income statement and statement of financial position for a sole trader, including adjustments for accruals, prepayments, depreciation, and irrecoverable debts.', citation: 'AQA 3.6', levels: ['A-Level'] },
  { name: 'Double Entry & Ledger Accounts', topic: 'The Double Entry Model', category: 'Financial Accounting', lat: 51.52, lng: -0.09, details: 'Recording transactions using double entry bookkeeping. Posting from books of prime entry to ledger accounts and extracting a trial balance.', citation: 'AQA 3.3', levels: ['A-Level'] },
  { name: 'Bank Reconciliation', topic: 'Verification of Accounting Records', category: 'Financial Accounting', lat: 53.48, lng: -2.24, details: 'Comparing cash book with bank statement to identify timing differences, errors, and unrecorded items. Preparing updated cash book and reconciliation statement.', citation: 'AQA 3.4', levels: ['A-Level'] },
  { name: 'Control Accounts & Error Correction', topic: 'Verification of Accounting Records', category: 'Financial Accounting', lat: 52.48, lng: -1.89, details: 'Preparing sales and purchases ledger control accounts. Identifying and correcting errors using suspense accounts.', citation: 'AQA 3.4', levels: ['A-Level'] },
  { name: 'Depreciation Methods', topic: 'Accounting Concepts', category: 'Financial Accounting', lat: 51.50, lng: -0.12, details: 'Calculating depreciation using straight-line and reducing balance methods. Impact on financial statements and asset valuation.', citation: 'AQA 3.5', levels: ['A-Level'] },
  { name: 'Limited Company Published Accounts', topic: 'Limited Company Accounts', category: 'Financial Accounting', lat: 51.52, lng: -0.07, details: 'Preparing income statement, statement of financial position, and statement of changes in equity for limited companies including share capital, reserves, and dividends.', citation: 'AQA 3.7', levels: ['A-Level'] },
  { name: 'Ratio Analysis Workshop', topic: 'Analysis and Interpretation of Financial Information', category: 'Financial Accounting', lat: 51.50, lng: -0.14, details: 'Calculating and interpreting profitability, liquidity, efficiency, and gearing ratios. Understanding limitations of ratio analysis.', citation: 'AQA 3.8', levels: ['A-Level'] },
  { name: 'Incomplete Records Reconstruction', topic: 'Incomplete Records', category: 'Financial Accounting', lat: 53.81, lng: -1.55, details: 'Reconstructing financial statements from incomplete information using margins, mark-ups, and statements of affairs.', citation: 'AQA 3.14', levels: ['A-Level'] },
  { name: 'Partnership Accounting', topic: 'Partnership Accounts', category: 'Financial Accounting', lat: 55.95, lng: -3.19, details: 'Preparing partnership appropriation accounts, capital and current accounts. Accounting for admission, retirement, and goodwill.', citation: 'AQA 3.15', levels: ['A-Level'] },

  // --- MANAGEMENT ACCOUNTING ---
  { name: 'Cash Budget Preparation', topic: 'Budgeting', category: 'Management Accounting', lat: 52.20, lng: 0.12, details: 'Preparing cash budgets, trade receivables budgets, and trade payables budgets. Understanding budgetary control and variance identification.', citation: 'AQA 3.9', levels: ['A-Level'] },
  { name: 'Break-Even Analysis', topic: 'Marginal Costing', category: 'Management Accounting', lat: 52.48, lng: -1.89, details: 'Calculating contribution, break-even point, margin of safety, and target profit. Constructing and interpreting break-even charts.', citation: 'AQA 3.10', levels: ['A-Level'] },
  { name: 'Variance Analysis', topic: 'Standard Costing and Variance Analysis', category: 'Management Accounting', lat: 53.48, lng: -2.24, details: 'Calculating material price/usage and labour rate/efficiency variances. Interpreting variances and identifying causes.', citation: 'AQA 3.11', levels: ['A-Level'] },
  { name: 'Absorption vs ABC Costing', topic: 'Absorption and Activity Based Costing', category: 'Management Accounting', lat: 51.45, lng: -2.58, details: 'Calculating overhead absorption rates. Comparing absorption costing with activity based costing and understanding when each is appropriate.', citation: 'AQA 3.12', levels: ['A-Level'] },
  { name: 'Capital Investment Decisions', topic: 'Capital Investment Appraisal', category: 'Management Accounting', lat: 51.51, lng: -0.10, details: 'Evaluating investment proposals using payback period, ARR, and NPV. Considering non-financial factors in decision-making.', citation: 'AQA 3.13', levels: ['A-Level'] },
  { name: 'Ethical Dilemma in Auditing', topic: 'Ethics for Accountants', category: 'Financial Accounting', lat: 51.50, lng: -0.13, details: 'Navigating conflicts of interest and ensuring objectivity in financial reporting. Applying the IESBA Code of Ethics.', citation: 'AQA 3.1', levels: ['A-Level'] },
  { name: 'Digital Transformation Case', topic: 'Impact of Technology on Accounting', category: 'Financial Accounting', lat: 51.52, lng: -0.08, details: 'Analyzing the transition from manual ledgers to cloud-based ERP systems. Security and efficiency considerations.', citation: 'AQA 3.1', levels: ['A-Level'] },
  { name: 'Standard Costing in Manufacturing', topic: 'Standard Costing and Variance Analysis', category: 'Management Accounting', lat: 53.40, lng: -2.99, details: 'Setting standards for a production line and analyzing variances to improve operational efficiency.', citation: 'AQA 3.11', levels: ['A-Level'] },
];

export const TOPIC_COLORS: { [key: string]: string } = {
    // Financial Accounting Topics
    'The Role of the Accountant in Business': '#6366f1',
    'Types of Business Organisation': '#8b5cf6',
    'The Double Entry Model': '#0ea5e9',
    'Verification of Accounting Records': '#14b8a6',
    'Accounting Concepts': '#10b981',
    'Financial Statements of Sole Traders': '#22c55e',
    'Limited Company Accounts': '#84cc16',
    'Analysis and Interpretation of Financial Information': '#eab308',
    'Incomplete Records': '#f59e0b',
    'Partnership Accounts': '#f97316',

    // Management Accounting Topics
    'Budgeting': '#ef4444',
    'Marginal Costing': '#ec4899',
    'Standard Costing and Variance Analysis': '#d946ef',
    'Absorption and Activity Based Costing': '#a855f7',
    'Capital Investment Appraisal': '#7c3aed',

    // Principles & Ethics
    'Accounting Standards (IAS/IFRS)': '#3b82f6',
    'Ethics for Accountants': '#06b6d4',
    'Impact of Technology on Accounting': '#14b8a6',
};

export const ACCOUNTING_CATEGORIES = ['All', 'Financial Accounting', 'Management Accounting'];
