
import { KeyTerm } from './types';

export const KEY_TERMS: KeyTerm[] = [
    // --- DOUBLE ENTRY MODEL ---
    { name: 'Double Entry Bookkeeping', topic: 'The Double Entry Model', details: 'Every transaction is recorded twice: as a debit in one account and a credit in another. Debits = Credits.', citation: 'Principle: Recording', type: 'term', levels: ['A-Level'] },
    { name: 'Books of Prime Entry', topic: 'The Double Entry Model', details: 'The first books where transactions are recorded before posting to ledger accounts (e.g., sales day book, purchases day book, cash book, general journal).', citation: 'Concept: Recording', type: 'term', levels: ['A-Level'] },
    { name: 'Trial Balance', topic: 'The Double Entry Model', details: 'A list of all ledger account balances to check that total debits equal total credits. Does not prove accuracy.', citation: 'Verification', type: 'term', levels: ['A-Level'] },
    { name: 'Ledger Account', topic: 'The Double Entry Model', details: 'A T-account used to record individual transactions for a specific item (e.g., bank, sales, purchases).', citation: 'Concept: Recording', type: 'term', levels: ['A-Level'] },
    { name: 'General Journal', topic: 'The Double Entry Model', details: 'Book of prime entry for non-routine transactions such as opening entries, corrections, and year-end adjustments.', citation: 'Concept: Recording', type: 'term', levels: ['A-Level'] },

    // --- VERIFICATION ---
    { name: 'Bank Reconciliation', topic: 'Verification of Accounting Records', details: 'Process of comparing the cash book balance with the bank statement balance to identify and resolve differences.', citation: 'Process: Verification', type: 'term', levels: ['A-Level'] },
    { name: 'Control Account', topic: 'Verification of Accounting Records', details: 'A summary ledger account (e.g., sales ledger control) used to verify the accuracy of individual subsidiary ledger accounts.', citation: 'Concept: Verification', type: 'term', levels: ['A-Level'] },
    { name: 'Suspense Account', topic: 'Verification of Accounting Records', details: 'A temporary account used when the trial balance does not balance, holding the difference until errors are found and corrected.', citation: 'Concept: Correction', type: 'term', levels: ['A-Level'] },
    { name: 'Error of Commission', topic: 'Verification of Accounting Records', details: 'A transaction posted to the correct type of account but the wrong specific account (e.g., wrong customer).', citation: 'Error Type', type: 'term', levels: ['A-Level'] },
    { name: 'Error of Principle', topic: 'Verification of Accounting Records', details: 'A transaction posted to the wrong class of account (e.g., capital expenditure posted to revenue expenditure).', citation: 'Error Type', type: 'term', levels: ['A-Level'] },
    { name: 'Compensating Error', topic: 'Verification of Accounting Records', details: 'Two or more errors that cancel each other out so the trial balance still balances.', citation: 'Error Type', type: 'term', levels: ['A-Level'] },

    // --- ACCOUNTING CONCEPTS ---
    { name: 'Going Concern', topic: 'Accounting Concepts', details: 'Assumption that a business will continue to operate for the foreseeable future, not intending to liquidate.', citation: 'Concept: Framework', type: 'term', levels: ['A-Level'] },
    { name: 'Accruals Concept', topic: 'Accounting Concepts', details: 'Revenue and expenses are recognised when incurred, not when cash is received or paid (matching principle).', citation: 'Concept: Framework', type: 'term', levels: ['A-Level'] },
    { name: 'Prudence', topic: 'Accounting Concepts', details: 'Exercise caution: do not overstate assets/income or understate liabilities/expenses. Anticipate losses but not gains.', citation: 'Concept: Framework', type: 'term', levels: ['A-Level'] },
    { name: 'Consistency', topic: 'Accounting Concepts', details: 'Once an accounting method is chosen, it should be applied consistently from period to period for comparability.', citation: 'Concept: Framework', type: 'term', levels: ['A-Level'] },
    { name: 'Materiality', topic: 'Accounting Concepts', details: 'Information is material if its omission or misstatement could influence economic decisions of users.', citation: 'Concept: Framework', type: 'term', levels: ['A-Level'] },
    { name: 'Depreciation', topic: 'Accounting Concepts', details: 'The systematic allocation of the cost of a non-current asset over its useful life. Methods: straight-line, reducing balance.', citation: 'Process: Adjustment', type: 'term', levels: ['A-Level'] },
    { name: 'Irrecoverable Debt', topic: 'Accounting Concepts', details: 'A debt that is certain not to be paid and is written off as an expense in the income statement.', citation: 'Concept: Adjustment', type: 'term', levels: ['A-Level'] },
    { name: 'Allowance for Doubtful Debts', topic: 'Accounting Concepts', details: 'An estimated amount set aside for debts that may not be collected. Adjusted annually; only the change affects profit.', citation: 'Concept: Prudence', type: 'term', levels: ['A-Level'] },
    { name: 'Prepayment', topic: 'Accounting Concepts', details: 'An expense paid in advance of the accounting period to which it relates. Treated as a current asset.', citation: 'Adjustment', type: 'term', levels: ['A-Level'] },
    { name: 'Accrual', topic: 'Accounting Concepts', details: 'An expense incurred but not yet paid at the end of the accounting period. Treated as a current liability.', citation: 'Adjustment', type: 'term', levels: ['A-Level'] },

    // --- FINANCIAL STATEMENTS ---
    { name: 'Income Statement', topic: 'Financial Statements of Sole Traders', details: 'Shows revenue, cost of sales, gross profit, expenses, and profit for the year for a specific accounting period.', citation: 'Statement: Financial', type: 'term', levels: ['A-Level'] },
    { name: 'Statement of Financial Position', topic: 'Financial Statements of Sole Traders', details: 'A snapshot of assets, liabilities, and capital at a specific date. Assets = Liabilities + Capital.', citation: 'Statement: Financial', type: 'term', levels: ['A-Level'] },
    { name: 'Cost of Sales', topic: 'Financial Statements of Sole Traders', details: 'Opening inventory + Purchases – Closing inventory. The direct cost of goods sold during the period.', citation: 'Calculation', type: 'term', levels: ['A-Level'] },
    { name: 'Capital', topic: 'Financial Statements of Sole Traders', details: 'The owner\'s investment in the business. Opening capital + Profit – Drawings = Closing capital.', citation: 'Concept: Ownership', type: 'term', levels: ['A-Level'] },

    // --- LIMITED COMPANIES ---
    { name: 'Share Capital', topic: 'Limited Company Accounts', details: 'The nominal value of shares issued by a company. Represents the permanent capital of the business.', citation: 'Concept: Company', type: 'term', levels: ['A-Level'] },
    { name: 'Share Premium', topic: 'Limited Company Accounts', details: 'The excess amount received over the nominal value when shares are issued (e.g., £1 shares issued at £1.50 = £0.50 premium).', citation: 'Concept: Company', type: 'term', levels: ['A-Level'] },
    { name: 'Retained Earnings', topic: 'Limited Company Accounts', details: 'Cumulative profits retained in the business after dividends are paid. Part of shareholders\' equity.', citation: 'Reserve', type: 'term', levels: ['A-Level'] },
    { name: 'Statement of Changes in Equity', topic: 'Limited Company Accounts', details: 'Shows movements in equity during the period including profit, dividends, and share issues.', citation: 'Statement: Financial', type: 'term', levels: ['A-Level'] },
    { name: 'Corporation Tax', topic: 'Limited Company Accounts', details: 'Tax on company profits. Shown as an expense in the income statement and a current liability if unpaid.', citation: 'Concept: Tax', type: 'term', levels: ['A-Level'] },

    // --- RATIO ANALYSIS ---
    { name: 'Gross Profit Margin', topic: 'Analysis and Interpretation of Financial Information', details: '(Gross Profit / Revenue) × 100. Measures profitability after direct costs.', citation: 'Ratio: Profitability', type: 'term', levels: ['A-Level'] },
    { name: 'ROCE', topic: 'Analysis and Interpretation of Financial Information', details: '(Operating Profit / Capital Employed) × 100. The primary measure of overall business performance.', citation: 'Ratio: Profitability', type: 'term', levels: ['A-Level'] },
    { name: 'Current Ratio', topic: 'Analysis and Interpretation of Financial Information', details: 'Current Assets / Current Liabilities. Measures short-term liquidity. Ideal is around 2:1.', citation: 'Ratio: Liquidity', type: 'term', levels: ['A-Level'] },
    { name: 'Acid Test Ratio', topic: 'Analysis and Interpretation of Financial Information', details: '(Current Assets – Inventory) / Current Liabilities. A stricter liquidity test. Ideal around 1:1.', citation: 'Ratio: Liquidity', type: 'term', levels: ['A-Level'] },
    { name: 'Trade Receivables Days', topic: 'Analysis and Interpretation of Financial Information', details: '(Trade Receivables / Revenue) × 365. Average number of days customers take to pay.', citation: 'Ratio: Efficiency', type: 'term', levels: ['A-Level'] },
    { name: 'Trade Payables Days', topic: 'Analysis and Interpretation of Financial Information', details: '(Trade Payables / Cost of Sales) × 365. Average number of days the business takes to pay suppliers.', citation: 'Ratio: Efficiency', type: 'term', levels: ['A-Level'] },
    { name: 'Inventory Turnover', topic: 'Analysis and Interpretation of Financial Information', details: 'Cost of Sales / Average Inventory. How many times inventory is sold and replaced in a period.', citation: 'Ratio: Efficiency', type: 'term', levels: ['A-Level'] },
    { name: 'Gearing Ratio', topic: 'Analysis and Interpretation of Financial Information', details: '(Non-current Liabilities / Capital Employed) × 100. Measures the proportion of finance from long-term borrowing.', citation: 'Ratio: Financial Structure', type: 'term', levels: ['A-Level'] },
    { name: 'Inventory Turnover Period', topic: 'Analysis and Interpretation of Financial Information', details: '(Average Inventory / Cost of Sales) × 365. Measures how many days, on average, inventory is held.', citation: 'Ratio: Efficiency', type: 'term', levels: ['A-Level'] },
    { name: 'Dividend Yield', topic: 'Analysis and Interpretation of Financial Information', details: '(Dividend per Share / Market Price per Share) × 100. Measures the return on investment for shareholders based on dividends.', citation: 'Ratio: Investment', type: 'term', levels: ['A-Level'] },
    { name: 'P/E Ratio', topic: 'Analysis and Interpretation of Financial Information', details: 'Market Price per Share / Earnings per Share. Shows how much investors are willing to pay for each £1 of profit.', citation: 'Ratio: Investment', type: 'term', levels: ['A-Level'] },
    { name: 'Interest Cover', topic: 'Analysis and Interpretation of Financial Information', details: 'Operating Profit / Interest Expense. Measures the ability of a business to pay interest on its debt.', citation: 'Ratio: Solvency', type: 'term', levels: ['A-Level'] },
    { name: 'Asset Turnover', topic: 'Analysis and Interpretation of Financial Information', details: 'Revenue / Capital Employed (or Total Assets). Measures how efficiently a business uses its assets to generate revenue.', citation: 'Ratio: Efficiency', type: 'term', levels: ['A-Level'] },
    { name: 'Earnings Per Share (EPS)', topic: 'Analysis and Interpretation of Financial Information', details: 'Profit after Tax / Number of Ordinary Shares. The amount of profit attributable to each ordinary share.', citation: 'Ratio: Profitability', type: 'term', levels: ['A-Level'] },

    // --- BUDGETING ---
    { name: 'Budget', topic: 'Budgeting', details: 'A financial plan for a future period, setting targets for income and expenditure. Used for planning, control, and motivation.', citation: 'Concept: Management', type: 'term', levels: ['A-Level'] },
    { name: 'Cash Budget', topic: 'Budgeting', details: 'A forecast of cash receipts and payments showing the expected cash position at the end of each period.', citation: 'Budget Type', type: 'term', levels: ['A-Level'] },
    { name: 'Budgetary Control', topic: 'Budgeting', details: 'The process of comparing actual results with budgeted figures and taking corrective action where necessary.', citation: 'Process: Management', type: 'term', levels: ['A-Level'] },
    { name: 'Favourable Variance', topic: 'Budgeting', details: 'When actual performance is better than budget (higher revenue or lower costs than expected).', citation: 'Concept: Control', type: 'term', levels: ['A-Level'] },
    { name: 'Adverse Variance', topic: 'Budgeting', details: 'When actual performance is worse than budget (lower revenue or higher costs than expected).', citation: 'Concept: Control', type: 'term', levels: ['A-Level'] },

    // --- MARGINAL COSTING ---
    { name: 'Contribution', topic: 'Marginal Costing', details: 'Selling price – Variable cost per unit. The amount each unit contributes towards fixed costs and profit.', citation: 'Concept: Costing', type: 'term', levels: ['A-Level'] },
    { name: 'Break-Even Point', topic: 'Marginal Costing', details: 'Fixed costs / Contribution per unit. The output level where total revenue equals total costs (zero profit).', citation: 'Calculation', type: 'term', levels: ['A-Level'] },
    { name: 'Margin of Safety', topic: 'Marginal Costing', details: 'Actual output – Break-even output. The amount by which sales can fall before losses are made.', citation: 'Concept: Risk', type: 'term', levels: ['A-Level'] },
    { name: 'Limiting Factor', topic: 'Marginal Costing', details: 'A constraint that limits output (e.g., labour hours, materials). Maximise contribution per unit of limiting factor.', citation: 'Concept: Decision', type: 'term', levels: ['A-Level'] },

    // --- STANDARD COSTING ---
    { name: 'Standard Cost', topic: 'Standard Costing and Variance Analysis', details: 'A predetermined cost for a unit of output, based on expected prices and usage of materials, labour, and overheads.', citation: 'Concept: Costing', type: 'term', levels: ['A-Level'] },
    { name: 'Material Price Variance', topic: 'Standard Costing and Variance Analysis', details: '(Standard price – Actual price) × Actual quantity. Measures the impact of paying more or less for materials.', citation: 'Variance', type: 'term', levels: ['A-Level'] },
    { name: 'Material Usage Variance', topic: 'Standard Costing and Variance Analysis', details: '(Standard quantity – Actual quantity) × Standard price. Measures efficiency of material usage.', citation: 'Variance', type: 'term', levels: ['A-Level'] },
    { name: 'Labour Rate Variance', topic: 'Standard Costing and Variance Analysis', details: '(Standard rate – Actual rate) × Actual hours. Measures impact of paying more or less per hour.', citation: 'Variance', type: 'term', levels: ['A-Level'] },
    { name: 'Labour Efficiency Variance', topic: 'Standard Costing and Variance Analysis', details: '(Standard hours – Actual hours) × Standard rate. Measures productivity of labour.', citation: 'Variance', type: 'term', levels: ['A-Level'] },

    // --- ABSORPTION & ABC ---
    { name: 'Absorption Costing', topic: 'Absorption and Activity Based Costing', details: 'A method where all production costs (fixed and variable) are absorbed into the cost of each unit of output.', citation: 'Method: Costing', type: 'term', levels: ['A-Level'] },
    { name: 'Overhead Absorption Rate (OAR)', topic: 'Absorption and Activity Based Costing', details: 'Budgeted overheads / Budgeted activity level. Used to charge a share of overheads to each unit.', citation: 'Calculation', type: 'term', levels: ['A-Level'] },
    { name: 'Over-absorption', topic: 'Absorption and Activity Based Costing', details: 'When overheads absorbed exceed actual overheads incurred. Results in an increase to reported profit.', citation: 'Concept: Costing', type: 'term', levels: ['A-Level'] },
    { name: 'Under-absorption', topic: 'Absorption and Activity Based Costing', details: 'When overheads absorbed are less than actual overheads incurred. Results in a decrease to reported profit.', citation: 'Concept: Costing', type: 'term', levels: ['A-Level'] },
    { name: 'Activity Based Costing (ABC)', topic: 'Absorption and Activity Based Costing', details: 'Allocates overheads based on activities that drive costs (cost drivers) rather than a blanket absorption rate.', citation: 'Method: Costing', type: 'term', levels: ['A-Level'] },
    { name: 'Cost Driver', topic: 'Absorption and Activity Based Costing', details: 'An activity that causes costs to be incurred (e.g., number of machine setups, number of purchase orders).', citation: 'Concept: ABC', type: 'term', levels: ['A-Level'] },

    // --- CAPITAL INVESTMENT ---
    { name: 'Payback Period', topic: 'Capital Investment Appraisal', details: 'The time taken to recover the initial investment from net cash flows. Simple but ignores time value of money.', citation: 'Method: Appraisal', type: 'term', levels: ['A-Level'] },
    { name: 'Accounting Rate of Return (ARR)', topic: 'Capital Investment Appraisal', details: '(Average annual profit / Initial investment) × 100. Uses profit not cash flow. Easy to compare with target return.', citation: 'Method: Appraisal', type: 'term', levels: ['A-Level'] },
    { name: 'Net Present Value (NPV)', topic: 'Capital Investment Appraisal', details: 'Sum of discounted future cash flows minus initial investment. Positive NPV = project adds value. Considers time value of money.', citation: 'Method: Appraisal', type: 'term', levels: ['A-Level'] },
    { name: 'Discount Factor', topic: 'Capital Investment Appraisal', details: 'A multiplier used to convert a future cash flow to its present value, reflecting the time value of money.', citation: 'Concept: Finance', type: 'term', levels: ['A-Level'] },

    // --- INCOMPLETE RECORDS ---
    { name: 'Statement of Affairs', topic: 'Incomplete Records', details: 'A simplified statement of financial position used to calculate opening or closing capital when records are incomplete.', citation: 'Method: Reconstruction', type: 'term', levels: ['A-Level'] },
    { name: 'Mark-up', topic: 'Incomplete Records', details: 'Profit expressed as a percentage of cost price. If mark-up is 25%, then SP = Cost × 1.25.', citation: 'Calculation', type: 'term', levels: ['A-Level'] },
    { name: 'Margin', topic: 'Incomplete Records', details: 'Profit expressed as a percentage of selling price. If margin is 20%, then Cost = SP × 0.80.', citation: 'Calculation', type: 'term', levels: ['A-Level'] },

    // --- PARTNERSHIPS ---
    { name: 'Appropriation Account', topic: 'Partnership Accounts', details: 'Shows how partnership profit is divided between partners (salary, interest on capital, residual profit share).', citation: 'Statement: Partnership', type: 'term', levels: ['A-Level'] },
    { name: 'Goodwill', topic: 'Partnership Accounts', details: 'The value of a business above its net assets. Arises from reputation, customer base, etc. Must be adjusted on changes in partnership.', citation: 'Concept: Valuation', type: 'term', levels: ['A-Level'] },
    { name: 'Current Account (Partnership)', topic: 'Partnership Accounts', details: 'Records each partner\'s share of profits, drawings, salary, and interest. Changes year to year.', citation: 'Account: Partnership', type: 'term', levels: ['A-Level'] },
    { name: 'Capital Account (Partnership)', topic: 'Partnership Accounts', details: 'Records each partner\'s long-term investment in the business. Usually fixed unless additional capital is introduced.', citation: 'Account: Partnership', type: 'term', levels: ['A-Level'] },

    // --- IAS/IFRS ---
    { name: 'IAS 1', topic: 'Accounting Standards (IAS/IFRS)', details: 'Presentation of Financial Statements. Sets out the overall requirements for financial statements including structure and minimum content.', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 2', topic: 'Accounting Standards (IAS/IFRS)', details: 'Inventories. Requires inventory to be valued at the lower of cost and net realisable value (NRV).', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 16', topic: 'Accounting Standards (IAS/IFRS)', details: 'Property, Plant and Equipment. Covers recognition, measurement, and depreciation of tangible non-current assets.', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 37', topic: 'Accounting Standards (IAS/IFRS)', details: 'Provisions, Contingent Liabilities and Contingent Assets. A provision is recognised when there is a present obligation from a past event.', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 38', topic: 'Accounting Standards (IAS/IFRS)', details: 'Intangible Assets. Covers recognition and measurement of non-physical assets (e.g., patents, trademarks).', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 7', topic: 'Accounting Standards (IAS/IFRS)', details: 'Statement of Cash Flows. Requires cash flows to be classified into operating, investing, and financing activities.', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 8', topic: 'Accounting Standards (IAS/IFRS)', details: 'Accounting Policies, Changes in Accounting Estimates and Errors. Guidance on selecting policies and correcting errors.', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 10', topic: 'Accounting Standards (IAS/IFRS)', details: 'Events after the Reporting Period. Distinguishes between adjusting events (evidence of existing conditions) and non-adjusting events.', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 36', topic: 'Accounting Standards (IAS/IFRS)', details: 'Impairment of Assets. Ensures assets are not carried at more than their recoverable amount.', citation: 'Standard', type: 'term', levels: ['A-Level'] },
    { name: 'Recoverable Amount', topic: 'Accounting Standards (IAS/IFRS)', details: 'The higher of an asset\'s fair value less costs to sell and its value in use.', citation: 'Concept: IAS 36', type: 'term', levels: ['A-Level'] },
    { name: 'IAS 36 Impairment of Assets', topic: 'Accounting Standards (IAS/IFRS)', details: 'Ensures that assets are carried at no more than their recoverable amount.', citation: 'IAS 36', type: 'term', levels: ['A-Level'] },

    // --- ETHICS ---
    { name: 'Integrity', topic: 'Ethics for Accountants', details: 'Being straightforward and honest in all professional and business relationships.', citation: 'Principle: Ethics', type: 'term', levels: ['A-Level'] },
    { name: 'Objectivity', topic: 'Ethics for Accountants', details: 'Not allowing bias, conflict of interest or undue influence to override professional judgement.', citation: 'Principle: Ethics', type: 'term', levels: ['A-Level'] },
    { name: 'Professional Competence', topic: 'Ethics for Accountants', details: 'Maintaining professional knowledge and skill to ensure competent professional service based on current developments.', citation: 'Principle: Ethics', type: 'term', levels: ['A-Level'] },
    { name: 'Confidentiality', topic: 'Ethics for Accountants', details: 'Not disclosing information acquired during professional work without proper authority or legal duty.', citation: 'Principle: Ethics', type: 'term', levels: ['A-Level'] },

    // --- TECHNOLOGY ---
    { name: 'Cloud Accounting', topic: 'Impact of Technology on Accounting', details: 'Accounting software hosted on remote servers, accessible via the internet. Examples: Xero, QuickBooks Online.', citation: 'Technology', type: 'term', levels: ['A-Level'] },
    { name: 'Automation in Accounting', topic: 'Impact of Technology on Accounting', details: 'Using software to automate routine tasks like invoice processing, bank reconciliation, and payroll.', citation: 'Technology', type: 'term', levels: ['A-Level'] },
    { name: 'Cyber Security', topic: 'Impact of Technology on Accounting', details: 'Protecting financial data from unauthorised access, theft, or damage. Critical for digital accounting systems.', citation: 'Concept: Risk', type: 'term', levels: ['A-Level'] },

    // --- BUSINESS ORGANISATION ---
    { name: 'Sole Trader', topic: 'Types of Business Organisation', details: 'A business owned and run by one person with unlimited liability. Simple to set up but personal assets are at risk.', citation: 'Business Type', type: 'term', levels: ['A-Level'] },
    { name: 'Partnership', topic: 'Types of Business Organisation', details: 'A business owned by 2-20 partners who share profits and have unlimited liability (unless LLP).', citation: 'Business Type', type: 'term', levels: ['A-Level'] },
    { name: 'Limited Liability', topic: 'Types of Business Organisation', details: 'Shareholders\' liability is limited to the amount they invested. Personal assets are protected.', citation: 'Concept: Company', type: 'term', levels: ['A-Level'] },
    { name: 'Separate Legal Entity', topic: 'Types of Business Organisation', details: 'A limited company is legally separate from its owners. It can own property, sue, and be sued in its own name.', citation: 'Concept: Company', type: 'term', levels: ['A-Level'] },
];
