
import { MultipleChoiceQuestion } from './types';

export const GAME_QUESTIONS: MultipleChoiceQuestion[] = [
  // --- DOUBLE ENTRY MODEL ---
  { id: 'gq_acc_1', question: 'Which side of a ledger account do you record an increase in an asset?', options: ['Credit', 'Debit', 'Either side', 'Neither'], correctAnswer: 'Debit', topic: 'The Double Entry Model', levels: ['A-Level'] },
  { id: 'gq_acc_2', question: 'Which book of prime entry records credit sales?', options: ['Cash book', 'Sales day book', 'Purchases day book', 'General journal'], correctAnswer: 'Sales day book', topic: 'The Double Entry Model', levels: ['A-Level'] },
  { id: 'gq_acc_3', question: 'What does the trial balance prove?', options: ['All entries are correct', 'Debits equal credits', 'Profit has been made', 'No errors exist'], correctAnswer: 'Debits equal credits', topic: 'The Double Entry Model', levels: ['A-Level'] },

  // --- VERIFICATION ---
  { id: 'gq_acc_4', question: 'An unpresented cheque is one that has been...', options: ['Written but not yet cleared by the bank', 'Received but not banked', 'Cancelled', 'Dishonoured'], correctAnswer: 'Written but not yet cleared by the bank', topic: 'Verification of Accounting Records', levels: ['A-Level'] },
  { id: 'gq_acc_5', question: 'Which type of error does NOT affect the trial balance?', options: ['Error of transposition', 'Error of omission', 'Error of original entry', 'Casting error'], correctAnswer: 'Error of omission', topic: 'Verification of Accounting Records', levels: ['A-Level'] },
  { id: 'gq_acc_6', question: 'A suspense account is used to...', options: ['Store profits', 'Hold the trial balance difference temporarily', 'Record bad debts', 'Calculate depreciation'], correctAnswer: 'Hold the trial balance difference temporarily', topic: 'Verification of Accounting Records', levels: ['A-Level'] },

  // --- ACCOUNTING CONCEPTS ---
  { id: 'gq_acc_7', question: 'The accruals concept requires that expenses are recognised when...', options: ['Cash is paid', 'They are incurred', 'The invoice arrives', 'The year ends'], correctAnswer: 'They are incurred', topic: 'Accounting Concepts', levels: ['A-Level'] },
  { id: 'gq_acc_8', question: 'Straight-line depreciation charges the same amount each year. The formula is...', options: ['(Cost – Residual) / Life', 'Cost × Rate%', 'NBV × Rate%', 'Cost / Residual'], correctAnswer: '(Cost – Residual) / Life', topic: 'Accounting Concepts', levels: ['A-Level'] },
  { id: 'gq_acc_9', question: 'A prepayment is classified as a...', options: ['Current liability', 'Non-current asset', 'Current asset', 'Revenue item'], correctAnswer: 'Current asset', topic: 'Accounting Concepts', levels: ['A-Level'] },
  { id: 'gq_acc_10', question: 'The prudence concept suggests that a business should...', options: ['Overstate profits', 'Anticipate losses but not gains', 'Ignore uncertain items', 'Always use the highest valuation'], correctAnswer: 'Anticipate losses but not gains', topic: 'Accounting Concepts', levels: ['A-Level'] },

  // --- FINANCIAL STATEMENTS ---
  { id: 'gq_acc_11', question: 'Cost of sales is calculated as...', options: ['Opening inventory + Purchases – Closing inventory', 'Revenue – Expenses', 'Purchases – Returns', 'Closing inventory + Purchases'], correctAnswer: 'Opening inventory + Purchases – Closing inventory', topic: 'Financial Statements of Sole Traders', levels: ['A-Level'] },
  { id: 'gq_acc_12', question: 'In the accounting equation, if assets are £50,000 and liabilities are £20,000, capital is...', options: ['£70,000', '£30,000', '£20,000', '£50,000'], correctAnswer: '£30,000', topic: 'Financial Statements of Sole Traders', levels: ['A-Level'] },

  // --- LIMITED COMPANIES ---
  { id: 'gq_acc_13', question: 'Share premium arises when shares are issued...', options: ['At a discount', 'At nominal value', 'Above nominal value', 'As bonus shares'], correctAnswer: 'Above nominal value', topic: 'Limited Company Accounts', levels: ['A-Level'] },
  { id: 'gq_acc_14', question: 'Retained earnings represent...', options: ['Cash in the bank', 'Cumulative profits kept in the business', 'Share capital issued', 'Dividends paid'], correctAnswer: 'Cumulative profits kept in the business', topic: 'Limited Company Accounts', levels: ['A-Level'] },

  // --- RATIO ANALYSIS ---
  { id: 'gq_acc_15', question: 'ROCE measures...', options: ['Short-term liquidity', 'Overall return on capital employed', 'Inventory efficiency', 'Debt levels'], correctAnswer: 'Overall return on capital employed', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_16', question: 'A current ratio of 0.8:1 suggests...', options: ['Strong liquidity', 'Potential liquidity problems', 'High profitability', 'Low gearing'], correctAnswer: 'Potential liquidity problems', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_17', question: 'Which ratio strips out inventory from the liquidity calculation?', options: ['Current ratio', 'Acid test ratio', 'Gearing ratio', 'GPM'], correctAnswer: 'Acid test ratio', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },

  // --- BUDGETING ---
  { id: 'gq_acc_18', question: 'A cash budget shows...', options: ['Profit for the period', 'Expected cash receipts and payments', 'Asset valuations', 'Share price movements'], correctAnswer: 'Expected cash receipts and payments', topic: 'Budgeting', levels: ['A-Level'] },
  { id: 'gq_acc_19', question: 'An adverse variance means actual costs were...', options: ['Lower than budgeted', 'Higher than budgeted', 'Equal to budgeted', 'Not recorded'], correctAnswer: 'Higher than budgeted', topic: 'Budgeting', levels: ['A-Level'] },

  // --- MARGINAL COSTING ---
  { id: 'gq_acc_20', question: 'Contribution per unit equals...', options: ['Revenue – Fixed costs', 'Selling price – Variable cost', 'Total revenue – Total costs', 'Fixed costs / Units'], correctAnswer: 'Selling price – Variable cost', topic: 'Marginal Costing', levels: ['A-Level'] },
  { id: 'gq_acc_21', question: 'At break-even point, total contribution equals...', options: ['Total revenue', 'Total variable costs', 'Total fixed costs', 'Zero'], correctAnswer: 'Total fixed costs', topic: 'Marginal Costing', levels: ['A-Level'] },
  { id: 'gq_acc_22', question: 'The margin of safety measures...', options: ['Profit per unit', 'How far sales can fall before a loss', 'The break-even point', 'Variable cost per unit'], correctAnswer: 'How far sales can fall before a loss', topic: 'Marginal Costing', levels: ['A-Level'] },

  // --- STANDARD COSTING ---
  { id: 'gq_acc_23', question: 'A favourable material usage variance means...', options: ['More material was used than expected', 'Less material was used than expected', 'Material was more expensive', 'Material was cheaper'], correctAnswer: 'Less material was used than expected', topic: 'Standard Costing and Variance Analysis', levels: ['A-Level'] },
  { id: 'gq_acc_24', question: 'Labour efficiency variance is calculated as...', options: ['(Std rate – Act rate) × Act hours', '(Std hours – Act hours) × Std rate', '(Std price – Act price) × Act qty', 'Act cost – Std cost'], correctAnswer: '(Std hours – Act hours) × Std rate', topic: 'Standard Costing and Variance Analysis', levels: ['A-Level'] },

  // --- ABSORPTION & ABC ---
  { id: 'gq_acc_25', question: 'In absorption costing, overheads are...', options: ['Ignored', 'Charged to all production units', 'Only charged to finished goods', 'Written off immediately'], correctAnswer: 'Charged to all production units', topic: 'Absorption and Activity Based Costing', levels: ['A-Level'] },
  { id: 'gq_acc_26', question: 'Activity Based Costing uses what to allocate overheads?', options: ['Labour hours only', 'Machine hours only', 'Cost drivers', 'Arbitrary percentages'], correctAnswer: 'Cost drivers', topic: 'Absorption and Activity Based Costing', levels: ['A-Level'] },

  // --- CAPITAL INVESTMENT ---
  { id: 'gq_acc_27', question: 'A positive NPV means the project...', options: ['Makes a loss', 'Earns less than the cost of capital', 'Earns more than the cost of capital', 'Breaks even'], correctAnswer: 'Earns more than the cost of capital', topic: 'Capital Investment Appraisal', levels: ['A-Level'] },
  { id: 'gq_acc_28', question: 'The main weakness of the payback method is that it...', options: ['Is too complex', 'Ignores cash flows after payback', 'Uses profit not cash', 'Considers time value of money'], correctAnswer: 'Ignores cash flows after payback', topic: 'Capital Investment Appraisal', levels: ['A-Level'] },

  // --- PARTNERSHIPS ---
  { id: 'gq_acc_29', question: 'In a partnership, goodwill must be adjusted when...', options: ['Annual accounts are prepared', 'A partner joins or leaves', 'Profits increase', 'The business buys assets'], correctAnswer: 'A partner joins or leaves', topic: 'Partnership Accounts', levels: ['A-Level'] },
  { id: 'gq_acc_30', question: 'The appropriation account shows how...', options: ['Assets are valued', 'Profit is shared between partners', 'Tax is calculated', 'Dividends are paid'], correctAnswer: 'Profit is shared between partners', topic: 'Partnership Accounts', levels: ['A-Level'] },

  // --- IAS/IFRS ---
  { id: 'gq_acc_31', question: 'IAS 2 requires inventory to be valued at...', options: ['Cost only', 'NRV only', 'Lower of cost and NRV', 'Replacement cost'], correctAnswer: 'Lower of cost and NRV', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_32', question: 'IAS 16 deals with...', options: ['Inventories', 'Intangible assets', 'Property, Plant and Equipment', 'Revenue recognition'], correctAnswer: 'Property, Plant and Equipment', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },

  // --- ETHICS ---
  { id: 'gq_acc_33', question: 'Which ethical principle requires an accountant not to disclose client information?', options: ['Integrity', 'Objectivity', 'Confidentiality', 'Professional competence'], correctAnswer: 'Confidentiality', topic: 'Ethics for Accountants', levels: ['A-Level'] },
  { id: 'gq_acc_34', question: 'An accountant who allows personal bias to influence their work breaches...', options: ['Integrity', 'Objectivity', 'Confidentiality', 'Due care'], correctAnswer: 'Objectivity', topic: 'Ethics for Accountants', levels: ['A-Level'] },

  // --- BUSINESS ORGANISATION ---
  { id: 'gq_acc_35', question: 'A sole trader has...', options: ['Limited liability', 'Unlimited liability', 'No liability', 'Shared liability'], correctAnswer: 'Unlimited liability', topic: 'Types of Business Organisation', levels: ['A-Level'] },
  { id: 'gq_acc_36', question: 'A limited company is a...', options: ['Natural person', 'Separate legal entity', 'Partnership', 'Government body'], correctAnswer: 'Separate legal entity', topic: 'Types of Business Organisation', levels: ['A-Level'] },

  // --- TECHNOLOGY ---
  { id: 'gq_acc_37', question: 'Cloud accounting software is hosted on...', options: ['The user\'s computer', 'A USB drive', 'Remote servers accessed via internet', 'Paper records'], correctAnswer: 'Remote servers accessed via internet', topic: 'Impact of Technology on Accounting', levels: ['A-Level'] },
  { id: 'gq_acc_38', question: 'Which is a key risk of digital accounting systems?', options: ['Too much paper', 'Cyber security threats', 'Slower processing', 'Higher staffing needs'], correctAnswer: 'Cyber security threats', topic: 'Impact of Technology on Accounting', levels: ['A-Level'] },

  // --- INCOMPLETE RECORDS ---
  { id: 'gq_acc_39', question: 'A statement of affairs is used to calculate...', options: ['Profit only', 'Opening or closing capital', 'Tax liability', 'Depreciation'], correctAnswer: 'Opening or closing capital', topic: 'Incomplete Records', levels: ['A-Level'] },
  { id: 'gq_acc_40', question: 'If the mark-up is 25%, and cost is £80, the selling price is...', options: ['£100', '£105', '£96', '£120'], correctAnswer: '£100', topic: 'Incomplete Records', levels: ['A-Level'] },

  // --- ADDITIONAL RATIO ANALYSIS ---
  { id: 'gq_acc_41', question: 'How is the inventory turnover period calculated?', options: ['(Avg Inventory / Cost of Sales) × 365', '(Cost of Sales / Avg Inventory) × 365', '(Revenue / Inventory) × 365', '(Inventory / Revenue) × 365'], correctAnswer: '(Avg Inventory / Cost of Sales) × 365', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_42', question: 'The trade receivables turnover period measures...', options: ['How long it takes to pay suppliers', 'How long it takes to collect cash from customers', 'The percentage of bad debts', 'The total credit sales'], correctAnswer: 'How long it takes to collect cash from customers', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_43', question: 'Gearing ratio is typically calculated as...', options: ['Non-current liabilities / Total Equity', 'Non-current liabilities / (Total Equity + Non-current liabilities)', 'Current Assets / Current Liabilities', 'Gross Profit / Revenue'], correctAnswer: 'Non-current liabilities / (Total Equity + Non-current liabilities)', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_44', question: 'Interest cover measures...', options: ['How many times profit covers interest expense', 'The interest rate on loans', 'The total amount of debt', 'Cash available to pay interest'], correctAnswer: 'How many times profit covers interest expense', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_45', question: 'Asset turnover is calculated as...', options: ['Revenue / Total Assets', 'Net Profit / Total Assets', 'Current Assets / Total Assets', 'Total Assets / Revenue'], correctAnswer: 'Revenue / Total Assets', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_46', question: 'A high gearing ratio indicates...', options: ['Low financial risk', 'High reliance on debt funding', 'Strong liquidity', 'High profitability'], correctAnswer: 'High reliance on debt funding', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_47', question: 'The Earnings Per Share (EPS) formula is...', options: ['Profit after tax / Number of ordinary shares', 'Profit before tax / Total assets', 'Dividends / Number of shares', 'Revenue / Number of shares'], correctAnswer: 'Profit after tax / Number of ordinary shares', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_48', question: 'The Dividend Yield formula is...', options: ['Dividend per share / Market price per share', 'Market price / Earnings per share', 'Dividend per share / Earnings per share', 'Profit / Dividends'], correctAnswer: 'Dividend per share / Market price per share', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_49', question: 'Price/Earnings (P/E) ratio is calculated as...', options: ['Market price per share / EPS', 'EPS / Market price per share', 'Dividend / Market price', 'Profit / Share capital'], correctAnswer: 'Market price per share / EPS', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },
  { id: 'gq_acc_50', question: 'If the Gross Profit Margin decreases while the Net Profit Margin remains constant, it implies...', options: ['Expenses have decreased', 'Cost of sales has increased', 'Revenue has increased', 'Tax has decreased'], correctAnswer: 'Expenses have decreased', topic: 'Analysis and Interpretation of Financial Information', levels: ['A-Level'] },

  // --- ADDITIONAL ACCOUNTING STANDARDS ---
  { id: 'gq_acc_51', question: 'IAS 7 requires the Statement of Cash Flows to classify cash flows into...', options: ['Operating, Investing, Financing', 'Current and Non-current', 'Revenue and Capital', 'Debit and Credit'], correctAnswer: 'Operating, Investing, Financing', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_52', question: 'Under IAS 10, an adjusting event is one that...', options: ['Occurs after the year-end and provides evidence of conditions existing at the year-end', 'Occurs after the year-end and relates to new conditions', 'Is a significant change in share price', 'Requires a note only'], correctAnswer: 'Occurs after the year-end and provides evidence of conditions existing at the year-end', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_53', question: 'IAS 37 defines a provision as a...', options: ['Liability of uncertain timing or amount', 'Contingent asset', 'Future expense', 'Bank overdraft'], correctAnswer: 'Liability of uncertain timing or amount', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_54', question: 'According to IAS 38, research costs must be...', options: ['Capitalised as an asset', 'Expensed as incurred', 'Amortised over 10 years', 'Ignored'], correctAnswer: 'Expensed as incurred', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_55', question: 'Under IAS 38, development costs can be capitalised ONLY if...', options: ['The project is technically feasible and likely to generate future economic benefits', 'The CEO approves it', 'The costs are low', 'The project has started'], correctAnswer: 'The project is technically feasible and likely to generate future economic benefits', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_56', question: 'IAS 8 deals with...', options: ['Accounting Policies, Changes in Accounting Estimates and Errors', 'Income Taxes', 'Leases', 'Employee Benefits'], correctAnswer: 'Accounting Policies, Changes in Accounting Estimates and Errors', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_57', question: 'Which standard covers the impairment of assets?', options: ['IAS 36', 'IAS 2', 'IAS 16', 'IAS 38'], correctAnswer: 'IAS 36', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_58', question: 'An impairment loss occurs when...', options: ['Carrying amount > Recoverable amount', 'Carrying amount < Recoverable amount', 'Fair value > Cost', 'Residual value is zero'], correctAnswer: 'Carrying amount > Recoverable amount', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_59', question: 'Under IAS 2, Net Realisable Value (NRV) is...', options: ['Estimated selling price – estimated costs to complete and sell', 'Historical cost', 'Replacement cost', 'Fair value'], correctAnswer: 'Estimated selling price – estimated costs to complete and sell', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
  { id: 'gq_acc_60', question: 'IAS 1 states that a complete set of financial statements includes...', options: ['SFP, SPL, SOCIE, SCF, and Notes', 'Just SFP and SPL', 'Budget and Cash flow', 'Trial Balance and Journal'], correctAnswer: 'SFP, SPL, SOCIE, SCF, and Notes', topic: 'Accounting Standards (IAS/IFRS)', levels: ['A-Level'] },
];
