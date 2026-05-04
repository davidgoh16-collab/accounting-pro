
import { Question, CaseStudyMaster } from './types';

// AQA A-Level Accounting 7127 — Sample Questions for AI Generator
export const ALL_QUESTIONS: Question[] = [
  {
    id: 'q-acc-p1-01-1',
    examYear: 2024,
    questionNumber: '01.1',
    unit: 'The Double Entry Model',
    title: 'Books of Prime Entry',
    prompt: 'Explain the purpose of books of prime entry and identify three examples used in a typical business.',
    marks: 4,
    ao: { ao1: 4, ao2: 0, ao3: 0 },
    caseStudy: {
      title: 'Context',
      content: 'No specific stimulus provided. Your answer should draw on your own knowledge of double entry bookkeeping.'
    },
    markScheme: {
      title: 'AQA Mark Scheme: Notes for answers (AO1)',
      content: `Point marked. Allow 1 mark per valid point with extra mark(s) for developed points (d).
For example:
- Books of prime entry are the first books where transactions are recorded before being posted to the ledger accounts (1).
- The sales day book records credit sales (1).
- The purchases day book records credit purchases (1).
- The cash book records all receipts and payments (1). It may also serve as a ledger account (1)(d).
- The general journal records non-routine transactions such as corrections and year-end adjustments (1).
Max 3 for listing without development. Credit any valid points.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p1-01-2',
    examYear: 2024,
    questionNumber: '01.2',
    unit: 'Verification of Accounting Records',
    title: 'Bank Reconciliation Statement',
    prompt: 'Prepare a bank reconciliation statement as at 31 March from the information provided in Figure 1.',
    marks: 8,
    ao: { ao1: 2, ao2: 6, ao3: 0 },
    figures: [
      { name: 'Figure 1: Cash book and bank statement extracts for March', url: '' }
    ],
    caseStudy: {
      title: 'Stimulus: Figure 1',
      content: 'Figure 1 shows the cash book balance of £3,450 (debit) and a bank statement balance of £4,120 (credit). Unpresented cheques total £890 and outstanding lodgements total £220.'
    },
    markScheme: {
      title: 'AQA Mark Scheme: Notes for answers (AO1 + AO2)',
      content: `AO1: Knowledge of bank reconciliation format and purpose.
AO2: Accurate application of figures.
Updated cash book balance: Start with cash book balance, adjust for items on bank statement not in cash book.
Bank reconciliation statement:
- Balance per bank statement: £4,120
- Add: Outstanding lodgements: £220
- Less: Unpresented cheques: (£890)
- Balance per updated cash book: £3,450
Award marks for correct format (2), correct adjustments (4), correct final balance (2).`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p1-02-1',
    examYear: 2024,
    questionNumber: '02.1',
    unit: 'Accounting Concepts',
    title: 'Depreciation Methods',
    prompt: 'A business purchases a machine for £40,000 with an estimated useful life of 5 years and a residual value of £5,000. Calculate the annual depreciation charge using (a) the straight-line method and (b) the reducing balance method at 30%.',
    marks: 6,
    ao: { ao1: 2, ao2: 4, ao3: 0 },
    caseStudy: {
      title: 'Context',
      content: 'No stimulus. Apply your knowledge of depreciation methods to the data given in the question.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `(a) Straight-line: (£40,000 – £5,000) / 5 = £7,000 per annum (3 marks: formula 1, substitution 1, answer 1)
(b) Reducing balance at 30%:
Year 1: £40,000 × 30% = £12,000 (NBV £28,000)
Year 2: £28,000 × 30% = £8,400 (NBV £19,600)
(3 marks: method 1, Year 1 correct 1, Year 2 correct 1)`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p1-03-1',
    examYear: 2024,
    questionNumber: '03.1',
    unit: 'Financial Statements of Sole Traders',
    title: 'Income Statement Preparation',
    prompt: 'From the trial balance extract provided in Figure 2, prepare an income statement for the year ended 31 December 2023 for J. Smith, a sole trader.',
    marks: 15,
    ao: { ao1: 5, ao2: 10, ao3: 0 },
    figures: [
      { name: 'Figure 2: Trial balance extract for J. Smith as at 31 December 2023', url: '' }
    ],
    caseStudy: {
      title: 'Stimulus: Figure 2',
      content: 'Revenue £180,000; Purchases £95,000; Opening inventory £12,000; Closing inventory £14,000; Wages £22,000; Rent £8,000; Insurance £3,600 (includes £600 prepayment); Irrecoverable debts £1,200.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `Income Statement for year ended 31 Dec 2023:
Revenue: £180,000
Less Cost of Sales: Opening inventory £12,000 + Purchases £95,000 – Closing inventory £14,000 = £93,000
Gross Profit: £87,000
Less Expenses: Wages £22,000 + Rent £8,000 + Insurance £3,000 (adjusted) + Irrecoverable debts £1,200 = £34,200
Profit for the year: £52,800
Award marks for: correct format (3), cost of sales (4), gross profit (1), adjusted expenses (5), net profit (2).`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p1-04-1',
    examYear: 2024,
    questionNumber: '04.1',
    unit: 'Analysis and Interpretation of Financial Information',
    title: 'Ratio Analysis and Evaluation',
    prompt: 'Using the financial statements provided in Figure 3, calculate the gross profit margin, ROCE, and current ratio for both 2022 and 2023. Evaluate the financial performance of the business over the two-year period.',
    marks: 20,
    ao: { ao1: 4, ao2: 8, ao3: 8 },
    figures: [
      { name: 'Figure 3: Summarised financial statements for Thornton Ltd, 2022 and 2023', url: '' }
    ],
    caseStudy: {
      title: 'Stimulus: Figure 3',
      content: '2023: Revenue £500,000, Cost of Sales £300,000, Operating Profit £80,000, Current Assets £120,000, Current Liabilities £90,000, Capital Employed £400,000. 2022: Revenue £450,000, Cost of Sales £260,000, Operating Profit £85,000, Current Assets £100,000, Current Liabilities £60,000, Capital Employed £380,000.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `AO1: Knowledge of ratio formulae and their significance.
AO2: Correct calculation of ratios for both years.
AO3: Evaluation of performance trends with reasoned judgement.
GPM 2023: 40%, 2022: 42.2% — slight decline.
ROCE 2023: 20%, 2022: 22.4% — declining return.
Current ratio 2023: 1.33:1, 2022: 1.67:1 — deteriorating liquidity.
Level 3 (16-20): Detailed analysis with inter-year comparison, identification of trends, and balanced evaluation considering limitations of ratio analysis.
Level 2 (11-15): Sound analysis with correct ratios and some comparison.
Level 1 (1-10): Basic calculations with limited analysis.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p2-01-1',
    examYear: 2024,
    questionNumber: '01.1',
    unit: 'Marginal Costing',
    title: 'Break-Even Analysis',
    prompt: 'A business sells a product at £25 per unit. Variable costs are £15 per unit and fixed costs total £40,000 per annum. Calculate (a) the contribution per unit, (b) the break-even point in units, and (c) the margin of safety if actual sales are 5,500 units.',
    marks: 8,
    ao: { ao1: 2, ao2: 6, ao3: 0 },
    caseStudy: {
      title: 'Context',
      content: 'No specific stimulus. Apply marginal costing principles to the data provided.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `(a) Contribution per unit = £25 – £15 = £10 (2 marks)
(b) Break-even = £40,000 / £10 = 4,000 units (3 marks: formula 1, substitution 1, answer 1)
(c) Margin of safety = 5,500 – 4,000 = 1,500 units or 27.3% (3 marks)`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p2-02-1',
    examYear: 2024,
    questionNumber: '02.1',
    unit: 'Standard Costing and Variance Analysis',
    title: 'Material and Labour Variances',
    prompt: 'Calculate the material price variance, material usage variance, labour rate variance, and labour efficiency variance from the data provided in Figure 4. State whether each variance is favourable or adverse.',
    marks: 12,
    ao: { ao1: 4, ao2: 8, ao3: 0 },
    figures: [
      { name: 'Figure 4: Standard and actual cost data for Product X', url: '' }
    ],
    caseStudy: {
      title: 'Stimulus: Figure 4',
      content: 'Standard: 5 kg at £3/kg, 2 hours at £12/hour. Actual (1,000 units): 5,200 kg at £3.20/kg, 1,900 hours at £12.50/hour.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `Material price variance: (£3.00 – £3.20) × 5,200 = £1,040 Adverse (3 marks)
Material usage variance: (5,000 – 5,200) × £3.00 = £600 Adverse (3 marks)
Labour rate variance: (£12.00 – £12.50) × 1,900 = £950 Adverse (3 marks)
Labour efficiency variance: (2,000 – 1,900) × £12.00 = £1,200 Favourable (3 marks)
Award 1 mark for correct formula, 1 for correct calculation, 1 for correct F/A identification per variance.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p2-03-1',
    examYear: 2024,
    questionNumber: '03.1',
    unit: 'Capital Investment Appraisal',
    title: 'NPV and Payback Period',
    prompt: 'A business is considering an investment of £100,000. The expected net cash flows are: Year 1: £30,000, Year 2: £35,000, Year 3: £40,000, Year 4: £25,000, Year 5: £20,000. The cost of capital is 10%. Calculate (a) the payback period, (b) the net present value. Advise whether the business should proceed with the investment.',
    marks: 15,
    ao: { ao1: 3, ao2: 6, ao3: 6 },
    caseStudy: {
      title: 'Context',
      content: 'Discount factors at 10%: Year 1: 0.909, Year 2: 0.826, Year 3: 0.751, Year 4: 0.683, Year 5: 0.621.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `(a) Payback: Cumulative: Y1 £30k, Y2 £65k, Y3 £105k. Payback = 2 years + (£35,000/£40,000 × 12) = 2 years 10.5 months (5 marks)
(b) NPV: £27,270 + £28,910 + £30,040 + £17,075 + £12,420 = £115,715 – £100,000 = £15,715 (positive) (5 marks)
(c) Advice: NPV is positive (£15,715), indicating the project earns more than the 10% cost of capital. Payback is under 3 years. Both methods support the investment. However, non-financial factors should be considered. (5 marks)
Level 2 (4-5): Reasoned advice referencing both methods with consideration of limitations.
Level 1 (1-3): Basic advice referencing one method.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p3-01-1',
    examYear: 2024,
    questionNumber: '01.1',
    unit: 'Accounting Standards (IAS/IFRS)',
    title: 'Purpose of Accounting Standards',
    prompt: 'Explain why International Accounting Standards (IAS) are important for the preparation of financial statements.',
    marks: 6,
    ao: { ao1: 4, ao2: 2, ao3: 0 },
    caseStudy: {
      title: 'Context',
      content: 'No specific stimulus provided. Draw on your knowledge of IAS/IFRS.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `Point marked with development.
- IAS provide a consistent framework for preparing financial statements, ensuring comparability between businesses (1)(d).
- They help ensure that financial statements give a true and fair view (1).
- They reduce the scope for creative accounting (1).
- They provide guidance on specific accounting treatments (e.g., IAS 16 on depreciation, IAS 2 on inventory valuation) (1)(d).
- They are particularly important for multinational companies where investors need to compare accounts across borders (1)(d).
- They enhance the credibility and reliability of financial information (1).
Max 4 for listing without development.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-acc-p3-02-1',
    examYear: 2024,
    questionNumber: '02.1',
    unit: 'Ethics for Accountants',
    title: 'Ethical Dilemma',
    prompt: 'A junior accountant discovers that their manager has been overstating revenue by including sales from the next financial period. Discuss the ethical issues involved and advise what actions the accountant should take.',
    marks: 15,
    ao: { ao1: 5, ao2: 5, ao3: 5 },
    caseStudy: {
      title: 'Context',
      content: 'The business is a private limited company seeking bank finance. The manager has asked the accountant not to raise the issue.'
    },
    markScheme: {
      title: 'AQA Mark Scheme',
      content: `AO1: Knowledge of ethical principles (integrity, objectivity, professional behaviour, confidentiality).
AO2: Application to the specific scenario.
AO3: Evaluation of ethical issues and reasoned advice.
Level 3 (11-15): Thorough discussion of ethical principles, clear application to scenario, well-reasoned advice considering professional obligations and potential consequences.
Level 2 (6-10): Sound discussion with some application and partial advice.
Level 1 (1-5): Basic identification of ethical issues with limited application.
Key points: Breach of accruals concept; overstating revenue misleads stakeholders; integrity requires the accountant to report; conflict between loyalty to employer and professional duty; should escalate internally first, then consider external reporting.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-cox-01',
    examYear: 2021,
    questionNumber: 'Cox.01',
    unit: 'The Role of the Accountant in Business',
    title: 'Accounting Records and Stakeholders',
    prompt: 'Al Porter has started a new business which is financed by £20,000 from his personal savings and a bank loan of £10,000.\n\n(a) Explain two reasons why Al should keep accounting records. (4 marks)\n(b) Identify three external stakeholders in Al\'s business. State the interest they will have in the accounting records. (6 marks)',
    marks: 10,
    ao: { ao1: 6, ao2: 4, ao3: 0 },
    caseStudy: {
      title: 'Business Context: Al Porter',
      content: 'Al Porter is a new business owner. His startup capital consists of £20,000 personal savings and a £10,000 bank loan.'
    },
    markScheme: {
      title: 'Mark Scheme (Cox 2021)',
      content: `(a) Reasons (2 marks each, max 4):
1. To monitor performance (profit/loss).
2. To fulfill legal/tax obligations (HMRC).
3. To provide information for decision making.
4. To provide evidence for bank/lenders.

(b) Stakeholders (2 marks each, max 6):
1. Bank/Lender: To assess ability to repay the loan and interest.
2. HMRC: To calculate the correct amount of tax due.
3. Suppliers: To assess creditworthiness before offering trade credit.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-cox-02',
    examYear: 2021,
    questionNumber: 'Cox.02',
    unit: 'The Double Entry Model',
    title: 'Source Documents and Sales Ledger',
    prompt: '(a) Identify the source document used by Alcaria to record each of the following transactions (3 marks):\n1. Alcaria sold goods to Sam Brass for £275.\n2. Sam Brass returned goods valued at £84 to Alcaria.\n3. Sam Brass sent a cheque, after deducting a cash discount of £18, to clear the balance.\n\n(b) Complete the account of Sam Brass in the books of Alcaria for the month of May 20-4. (9 marks)',
    marks: 12,
    ao: { ao1: 3, ao2: 9, ao3: 0 },
    caseStudy: {
      title: 'Business Context: Alcaria',
      content: 'At 1 May 20-4, Sam Brass owed Alcaria £745.\n7 May: Sold goods to Sam Brass for £275.\n16 May: Sam Brass returned goods valued at £84.\n24 May: Sam Brass sent a cheque, after deducting a cash discount of £18, to clear the balance owing at 1 May.'
    },
    markScheme: {
      title: 'Mark Scheme (Cox 2021)',
      content: `(a) Source Documents:
1. Sales Invoice
2. Credit Note (Issued)
3. Cheque counterfoil / Remittance advice

(b) Sam Brass Account:
Dr: 1 May Balance b/d £745; 7 May Sales £275. Total Dr: £1,020
Cr: 16 May Sales Returns £84; 24 May Bank £727 (£745-£18); 24 May Discount Allowed £18. Total Cr so far: £829.
31 May Balance c/d £191. (The £727+£18 clears the opening £745 balance).`
    },
    level: 'A-Level'
  },
  {
    id: 'q-cox-03',
    examYear: 2021,
    questionNumber: 'Cox.03',
    unit: 'The Double Entry Model',
    title: 'Source Documents and Purchases Ledger',
    prompt: '(a) Identify source documents and accounts for (6 marks):\n1. Payment of wages by cheque.\n2. Return of goods to a credit supplier.\n\n(b) Complete the purchases ledger account of Fashion Frocks in the books of Hayley Ortez for June 20-1. Balance the account at 30 June. (9 marks)',
    marks: 15,
    ao: { ao1: 6, ao2: 9, ao3: 0 },
    caseStudy: {
      title: 'Business Context: Hayley Ortez',
      content: '1 June: Balance b/f £1,275.\n8 June: Credit purchases £950.\n12 June: Bank transfer £1,205; Discount received £70.\n18 June: Returns £150.\n23 June: Credit purchases £650.'
    },
    markScheme: {
      title: 'Mark Scheme (Cox 2021)',
      content: `(a) 1. Source: Cheque counterfoil. Dr: Wages, Cr: Bank.
2. Source: Debit Note / Credit Note (Received). Dr: Supplier, Cr: Purchases Returns.

(b) Fashion Frocks Account:
Cr: 1 June Bal b/f £1,275; 8 June Purchases £950; 23 June Purchases £650. Total Cr: £2,875.
Dr: 12 June Bank £1,205; 12 June Discount Received £70; 18 June Purchases Returns £150. Total Dr: £1,425.
30 June Balance c/d £1,450.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-cox-04',
    examYear: 2021,
    questionNumber: 'Cox.04',
    unit: 'The Double Entry Model',
    title: 'Transaction Analysis and Double Entry',
    prompt: '(a) Identify the source document for (5 marks):\n1. Credit purchases of shoes.\n2. Returns to manufacturer.\n3. Cash/cheques deposited into bank.\n4. Payment to supplier by cheque.\n5. Credit sales of trainers.\n\n(b) Identify accounts to be debited and credited for (8 marks):\n1. Shop till purchased on credit for £1,000.\n2. £5,000 paid into bank from personal savings.\n3. £1,200 paid to Shoe Traders (supplier).\n4. Shop rent of £750 paid by bank transfer.',
    marks: 13,
    ao: { ao1: 5, ao2: 8, ao3: 0 },
    caseStudy: {
      title: 'Business Context: Michel Cavares',
      content: 'Michel Cavares owns a shoe business and uses a manual accounting system without control accounts.'
    },
    markScheme: {
      title: 'Mark Scheme (Cox 2021)',
      content: `(a) Source Documents:
1. Purchase Invoice
2. Debit Note
3. Paying-in slip
4. Cheque counterfoil
5. Sales Invoice

(b) Double Entry:
1. Dr: Equipment (Shop Till), Cr: AJ Supplies
2. Dr: Bank, Cr: Capital
3. Dr: Shoe Traders, Cr: Bank
4. Dr: Rent, Cr: Bank`
    },
    level: 'A-Level'
  },
  {
    id: 'q-cox-05',
    examYear: 2021,
    questionNumber: 'Cox.05',
    unit: 'The Double Entry Model',
    title: 'Trial Balance Evaluation',
    prompt: 'Assess the usefulness of the trial balance as a means of checking the accuracy of the ledgers.',
    marks: 6,
    ao: { ao1: 2, ao2: 0, ao3: 4 },
    caseStudy: {
      title: 'Accounting Concept',
      content: 'A trial balance is a list of ledger balances at a point in time.'
    },
    markScheme: {
      title: 'Mark Scheme (Cox 2021)',
      content: `Arguments for usefulness:
- Checks arithmetic accuracy of double entry.
- Errors of omission/commission/principle do not prevent balancing but can be highlighted if totals differ.

Limitations (not useful for):
- Error of omission (transaction missing).
- Error of commission (wrong account, same category).
- Error of principle (wrong category, e.g., asset vs expense).
- Error of original entry (wrong amount in both accounts).
- Compensating errors.
- Reversal of entries.`
    },
    level: 'A-Level'
  }
];

// AQA A-Level Accounting — Business Scenario Case Studies
export const MASTER_CASE_STUDIES: CaseStudyMaster[] = [
    { name: 'J. Smith Sole Trader', aqaUnitMapping: ['Financial Statements of Sole Traders', 'Accounting Concepts'], businessContext: 'Sole Trader', keyConcepts: ['Income statement', 'Statement of financial position', 'Accruals', 'Depreciation'], criticalDetailExample: 'Illustrates preparation of sole trader final accounts with adjustments for accruals, prepayments, and depreciation.', levels: ['A-Level'] },
    { name: 'Thornton Ltd', aqaUnitMapping: ['Limited Company Accounts', 'Analysis and Interpretation of Financial Information'], businessContext: 'Private Limited Company', keyConcepts: ['Published accounts', 'Ratio analysis', 'Profitability', 'Liquidity'], criticalDetailExample: 'A medium-sized Ltd company used for ratio analysis comparison across two financial years.', levels: ['A-Level'] },
    { name: 'Parker & Jones Partnership', aqaUnitMapping: ['Partnership Accounts'], businessContext: 'Partnership', keyConcepts: ['Appropriation account', 'Capital accounts', 'Goodwill', 'Admission of partner'], criticalDetailExample: 'Demonstrates partnership accounting including goodwill adjustments when a new partner is admitted.', levels: ['A-Level'] },
    { name: 'GreenTech Manufacturing Ltd', aqaUnitMapping: ['Marginal Costing', 'Absorption and Activity Based Costing'], businessContext: 'Manufacturing Company', keyConcepts: ['Break-even', 'Contribution', 'Overhead absorption', 'Activity based costing'], criticalDetailExample: 'A manufacturing company used to contrast marginal and absorption costing approaches for decision-making.', levels: ['A-Level'] },
    { name: 'Northern Rail Engineering', aqaUnitMapping: ['Standard Costing and Variance Analysis', 'Budgeting'], businessContext: 'Engineering Firm', keyConcepts: ['Standard costs', 'Material variances', 'Labour variances', 'Budgetary control'], criticalDetailExample: 'Illustrates variance analysis with material price/usage and labour rate/efficiency variances.', levels: ['A-Level'] },
    { name: 'Bright Futures Academy', aqaUnitMapping: ['Budgeting'], businessContext: 'Not-for-profit Organisation', keyConcepts: ['Cash budgets', 'Trade receivables budget', 'Budgetary control'], criticalDetailExample: 'A not-for-profit scenario demonstrating cash flow management and budget preparation.', levels: ['A-Level'] },
    { name: 'Harrison Capital Projects', aqaUnitMapping: ['Capital Investment Appraisal'], businessContext: 'Investment Scenario', keyConcepts: ['Payback period', 'ARR', 'NPV', 'Non-financial factors'], criticalDetailExample: 'Compares two investment proposals using payback, ARR, and NPV with discussion of qualitative factors.', levels: ['A-Level'] },
    { name: 'Wilson Retail Incomplete Records', aqaUnitMapping: ['Incomplete Records'], businessContext: 'Retail Business', keyConcepts: ['Margins', 'Mark-ups', 'Statement of affairs', 'Missing figures'], criticalDetailExample: 'A retail business whose records were partially destroyed by fire, requiring reconstruction of accounts.', levels: ['A-Level'] },
    { name: 'TechStart PLC', aqaUnitMapping: ['Limited Company Accounts', 'Accounting Standards (IAS/IFRS)'], businessContext: 'Public Limited Company', keyConcepts: ['Share capital', 'Reserves', 'IAS 1', 'Statement of changes in equity'], criticalDetailExample: 'A PLC scenario examining compliance with IAS 1 in published accounts, including statement of changes in equity.', levels: ['A-Level'] },
    { name: 'Carter & Patel Audit Scenario', aqaUnitMapping: ['Ethics for Accountants', 'The Role of the Accountant in Business'], businessContext: 'Accountancy Practice', keyConcepts: ['Integrity', 'Objectivity', 'Confidentiality', 'Ethical dilemmas'], criticalDetailExample: 'An ethical dilemma involving a conflict of interest when an auditor discovers client irregularities.', levels: ['A-Level'] },
    { name: 'CloudBooks Software Ltd', aqaUnitMapping: ['Impact of Technology on Accounting'], businessContext: 'Technology Company', keyConcepts: ['Cloud accounting', 'Automation', 'AI', 'Cyber security'], criticalDetailExample: 'Examines how technology is transforming accounting practices including cloud-based systems and AI-driven analytics.', levels: ['A-Level'] },
    { name: 'Riverside Café', aqaUnitMapping: ['The Double Entry Model', 'Verification of Accounting Records'], businessContext: 'Small Business', keyConcepts: ['Double entry', 'Bank reconciliation', 'Control accounts', 'Suspense accounts'], criticalDetailExample: 'A small business scenario illustrating common bookkeeping errors and their correction through suspense accounts.', levels: ['A-Level'] },
];

export const MULTIPLE_CHOICE_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 'mcq-aqa-01',
    topic: 'The Role of the Accountant in Business',
    question: 'Which of the following is a liability for a business?',
    options: ['Accounts Receivable', 'Inventory', 'Accrued Expenses', 'Prepaid Rent'],
    correctAnswer: 2, // Accrued Expenses
    explanation: 'Accrued expenses represent amounts owed for expenses incurred but not yet paid, making them a current liability on the Statement of Financial Position.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-02',
    topic: 'The Role of the Accountant in Business',
    question: 'Which stakeholder group is primarily interested in a business\'s ability to pay its debts as they fall due?',
    options: ['Shareholders', 'Employees', 'Suppliers', 'HM Revenue and Customs'],
    correctAnswer: 2, // Suppliers
    explanation: 'Suppliers (trade creditors) are primarily interested in liquidity to ensure they will be paid for goods or services provided on credit.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-03',
    topic: 'The Double Entry Model',
    question: 'A business pays £500 for insurance by cheque. Which accounts should be debited and credited?',
    options: [
      'Debit Insurance, Credit Cash',
      'Debit Bank, Credit Insurance',
      'Debit Insurance, Credit Bank',
      'Debit Cash, Credit Insurance'
    ],
    correctAnswer: 2, // Debit Insurance, Credit Bank
    explanation: 'Paying for an expense reduces an asset (Bank) and increases an expense (Insurance). Debiting an expense increases it; crediting an asset decreases it.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-04',
    topic: 'Verification of Accounting Records',
    question: 'Which of the following errors would be revealed by a trial balance?',
    options: [
      'A transaction omitted entirely from the books',
      'A transaction entered in the wrong class of account',
      'A transaction entered in the wrong person\'s account',
      'One side of a transaction entered twice'
    ],
    correctAnswer: 3, // One side of a transaction entered twice
    explanation: 'A trial balance only reveals errors where the total debits do not equal the total credits (arithmetical errors). Errors of omission, principle, and commission affect both sides equally and remain hidden.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-05',
    topic: 'Limited Company Accounts',
    question: 'Where is the Dividend Paid by a limited company recorded in the final accounts?',
    options: [
      'Income Statement',
      'Statement of Financial Position',
      'Statement of Changes in Equity',
      'Manufacturing Account'
    ],
    correctAnswer: 2, // Statement of Changes in Equity
    explanation: 'Dividends paid are a distribution of profit and are recorded in the Statement of Changes in Equity (SOCE) under the retained earnings column.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-06',
    topic: 'Partnership Accounts',
    question: 'In the absence of a partnership agreement, how are profits and losses shared?',
    options: [
      'In the ratio of capital contributions',
      'Equally among all partners',
      'Based on the number of years in the business',
      'According to the amount of work performed'
    ],
    correctAnswer: 1, // Equally
    explanation: 'Under the Partnership Act 1890, in the absence of an agreement, profits and losses are shared equally, regardless of capital contributed or time worked.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-07',
    topic: 'Accounting Concepts',
    question: 'Which accounting concept requires that revenue and costs are recognised as they are earned or incurred, not as money is received or paid?',
    options: [
      'Prudence',
      'Accruals (Matching)',
      'Going Concern',
      'Materiality'
    ],
    correctAnswer: 1, // Accruals
    explanation: 'The accruals (or matching) concept states that revenue and costs are matched to the period in which they occur, ensuring profit is accurately calculated for that timeframe.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-08',
    topic: 'Absorption and Activity Based Costing',
    question: 'Which of the following is considered an indirect cost in a manufacturing business?',
    options: [
      'Direct materials used in production',
      'Wages of production line workers',
      'Factory rent and rates',
      'Royalties paid per unit produced'
    ],
    correctAnswer: 2, // Factory rent
    explanation: 'Indirect costs (overheads) cannot be easily traced to a specific unit of production. Factory rent is a fixed overhead shared across all units.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-09',
    topic: 'Marginal Costing',
    question: 'How is the contribution per unit calculated?',
    options: [
      'Selling Price - Fixed Costs',
      'Selling Price - Total Costs',
      'Selling Price - Variable Costs',
      'Total Revenue - Total Variable Costs'
    ],
    correctAnswer: 2, // Selling Price - Variable Costs
    explanation: 'Contribution per unit is the selling price minus the variable cost per unit. It represents the amount each unit contributes towards covering fixed costs and then generating profit.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-10',
    topic: 'Analysis and Interpretation of Financial Information',
    question: 'A business has a current ratio of 2.5:1 and a liquid (acid test) ratio of 0.8:1. What does this suggest?',
    options: [
      'The business has too much cash',
      'The business has a high level of inventory',
      'The business cannot pay its current liabilities',
      'The business is highly geared'
    ],
    correctAnswer: 1, // High level of inventory
    explanation: 'The liquid ratio excludes inventory. A significantly lower liquid ratio compared to the current ratio suggests that a large portion of current assets is tied up in inventory.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-11',
    topic: 'Ethics for Accountants',
    question: 'Which fundamental ethical principle requires an accountant to be straightforward and honest in all professional and business relationships?',
    options: [
      'Objectivity',
      'Integrity',
      'Professional Competence',
      'Confidentiality'
    ],
    correctAnswer: 1, // Integrity
    explanation: 'Integrity implies fair dealing and truthfulness. Accountants must not be associated with reports or information they believe to be false or misleading.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-12',
    topic: 'Standard Costing and Variance Analysis',
    question: 'A material price variance is calculated as:',
    options: [
      '(Standard Price - Actual Price) × Standard Quantity',
      '(Standard Quantity - Actual Quantity) × Standard Price',
      '(Standard Price - Actual Price) × Actual Quantity',
      '(Standard Quantity - Actual Quantity) × Actual Price'
    ],
    correctAnswer: 2, // (SP-AP) * AQ
    explanation: 'The material price variance measures the difference between what we expected to pay and what we actually paid for the quantity of material purchased.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-13',
    topic: 'Capital Investment Appraisal',
    question: 'Which investment appraisal method takes into account the time value of money?',
    options: [
      'Payback Period',
      'Accounting Rate of Return (ARR)',
      'Net Present Value (NPV)',
      'Gross Profit Margin'
    ],
    correctAnswer: 2, // NPV
    explanation: 'Net Present Value (NPV) uses discounting to reflect that money received today is worth more than the same amount received in the future.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-14',
    topic: 'Accounting Standards (IAS/IFRS)',
    question: 'According to IAS 1, which of the following must be included in a complete set of financial statements?',
    options: [
      'A Chairman\'s Statement',
      'A Statement of Cash Flows',
      'A Marketing Report',
      'An Environmental Audit'
    ],
    correctAnswer: 1, // Statement of Cash Flows
    explanation: 'IAS 1 specifies that a complete set of financial statements includes a Statement of Financial Position, Statement of Profit or Loss, Statement of Changes in Equity, and a Statement of Cash Flows.',
    levels: ['A-Level']
  },
  {
    id: 'mcq-aqa-15',
    topic: 'Incomplete Records',
    question: 'If a business has a mark-up of 25%, what is its margin?',
    options: [
      '20%',
      '25%',
      '33.3%',
      '15%'
    ],
    correctAnswer: 0, // 20%
    explanation: 'Margin = Mark-up / (1 + Mark-up). So, 0.25 / 1.25 = 0.20 or 20%.',
    levels: ['A-Level']
  }
];
