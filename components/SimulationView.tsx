import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Info, HelpCircle, Calculator, TrendingUp, DollarSign, CheckCircle2, AlertCircle, RotateCcw, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthUser } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, BarChart, Bar, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface BreakEvenData {
    units: number;
    totalRevenue: number;
    totalCosts: number;
    fixedCosts: number;
}

// Persistence Hook
const useSimulationPersistence = <T,>(key: string, initialState: T) => {
    const [state, setState] = useState<T>(() => {
        const saved = localStorage.getItem(`geo_pro_sim_${key}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return initialState;
            }
        }
        return initialState;
    });

    useEffect(() => {
        localStorage.setItem(`geo_pro_sim_${key}`, JSON.stringify(state));
    }, [key, state]);

    const reset = () => setState(initialState);

    return [state, setState, reset] as const;
};

const BreakEvenSimulator: React.FC = () => {
    const [fixedCosts, setFixedCosts, resetFixed] = useSimulationPersistence<number>('be_fixed', 5000);
    const [sellingPrice, setSellingPrice, resetPrice] = useSimulationPersistence<number>('be_price', 50);
    const [variableCost, setVariableCost, resetVar] = useSimulationPersistence<number>('be_var', 20);
    const [baseline, setBaseline] = useState<{fixed: number, price: number, var: number} | null>(null);
    const [chartData, setChartData] = useState<BreakEvenData[]>([]);

    const resetAll = () => {
        resetFixed();
        resetPrice();
        resetVar();
        setBaseline(null);
    };

    const saveBaseline = () => {
        setBaseline({ fixed: fixedCosts, price: sellingPrice, var: variableCost });
    };

    const contribution = sellingPrice - variableCost;
    const breakEvenUnits = contribution > 0 ? Math.ceil(fixedCosts / contribution) : 0;
    const breakEvenRevenue = breakEvenUnits * sellingPrice;

    useEffect(() => {
        const data: BreakEvenData[] = [];
        const maxUnits = Math.max(breakEvenUnits * 2, 500);
        const step = Math.ceil(maxUnits / 10);

        for (let i = 0; i <= maxUnits; i += step) {
            data.push({
                units: i,
                totalRevenue: i * sellingPrice,
                totalCosts: fixedCosts + (i * variableCost),
                fixedCosts: fixedCosts
            });
        }
        setChartData(data);
    }, [fixedCosts, sellingPrice, variableCost, breakEvenUnits]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-8"
        >
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calculator size={80} />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Calculator className="mr-2 text-indigo-600" size={24} />
                            Input Variables
                        </h2>
                        <button 
                            onClick={resetAll}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Reset to defaults"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fixed Costs (£)</label>
                            <input 
                                type="number" 
                                step="100"
                                value={fixedCosts} 
                                onChange={(e) => setFixedCosts(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (£)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={sellingPrice} 
                                onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Variable Cost (£)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={variableCost} 
                                onChange={(e) => setVariableCost(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Start Scenarios</h3>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => { setFixedCosts(2000); setSellingPrice(4); setVariableCost(1.2); }}
                                className="text-xs bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                🍰 Artisan Bakery
                            </button>
                            <button 
                                onClick={() => { setFixedCosts(15000); setSellingPrice(29.99); setVariableCost(2); }}
                                className="text-xs bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                💻 SaaS Startup
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <button 
                            onClick={saveBaseline}
                            className={`w-full py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${baseline ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}`}
                        >
                            {baseline ? 'Update Baseline' : 'Set Baseline for Comparison'}
                        </button>
                        {baseline && (
                            <p className="text-[10px] text-slate-400 text-center mt-2 italic">Baseline set: £{baseline.fixed} FC | £{baseline.price} Price</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
                        <TrendingUp className="mr-2 text-emerald-600" size={24} />
                        Key Metrics
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <motion.div 
                            key={contribution}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="p-4 bg-indigo-50 rounded-lg border border-indigo-100"
                        >
                            <span className="text-sm text-indigo-700 font-medium block">Contribution</span>
                            <span className="text-2xl font-bold text-indigo-900">£{contribution.toFixed(2)}</span>
                        </motion.div>
                        <motion.div 
                            key={breakEvenUnits}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="p-4 bg-emerald-50 rounded-lg border border-emerald-100"
                        >
                            <span className="text-sm text-emerald-700 font-medium block">Break-Even Units</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-emerald-900">{breakEvenUnits.toLocaleString()} units</span>
                                {baseline && (
                                    <span className={`text-xs font-bold ${breakEvenUnits <= (baseline.fixed / (baseline.price - baseline.var)) ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        ({breakEvenUnits - Math.ceil(baseline.fixed / (baseline.price - baseline.var)) >= 0 ? '+' : ''}{breakEvenUnits - Math.ceil(baseline.fixed / (baseline.price - baseline.var))})
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <div className="mb-6 flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                        <Info className="mr-3 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900">Break-Even Chart</h3>
                            <p className="text-sm">Where Total Revenue crosses Total Costs.</p>
                        </div>
                    </div>
                    <div className="flex-grow min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="units" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => [`£${value.toLocaleString()}`, '']} />
                                <Legend verticalAlign="top" height={36}/>
                                <Line type="monotone" dataKey="totalRevenue" stroke="#6366f1" strokeWidth={3} dot={false} name="Total Revenue" />
                                <Line type="monotone" dataKey="totalCosts" stroke="#f43f5e" strokeWidth={3} dot={false} name="Total Costs" />
                                <Line type="monotone" dataKey="fixedCosts" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Fixed Costs" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

interface CashFlowData {
    month: string;
    receipts: number;
    payments: number;
    netCashFlow: number;
    closingBalance: number;
}

const CashFlowSimulator: React.FC = () => {
    const [openingBalance, setOpeningBalance, resetOpening] = useSimulationPersistence<number>('cf_opening', 1000);
    const [monthlyReceipts, setMonthlyReceipts, resetReceipts] = useSimulationPersistence<number[]>('cf_receipts', [2000, 2500, 3000, 1500, 2000, 3500]);
    const [monthlyPayments, setMonthlyPayments, resetPayments] = useSimulationPersistence<number[]>('cf_payments', [1800, 2200, 2500, 2800, 2000, 2200]);
    const [chartData, setChartData] = useState<CashFlowData[]>([]);

    const resetAll = () => {
        resetOpening();
        resetReceipts();
        resetPayments();
    };

    useEffect(() => {
        const data: CashFlowData[] = [];
        let currentBalance = openingBalance;
        const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];

        for (let i = 0; i < 6; i++) {
            const r = monthlyReceipts[i] || 0;
            const p = monthlyPayments[i] || 0;
            const net = r - p;
            const closing = currentBalance + net;
            
            data.push({
                month: months[i],
                receipts: r,
                payments: p,
                netCashFlow: net,
                closingBalance: closing
            });
            currentBalance = closing;
        }
        setChartData(data);
    }, [openingBalance, monthlyReceipts, monthlyPayments]);

    const handleReceiptChange = (index: number, val: number) => {
        const newReceipts = [...monthlyReceipts];
        newReceipts[index] = val;
        setMonthlyReceipts(newReceipts);
    };

    const handlePaymentChange = (index: number, val: number) => {
        const newPayments = [...monthlyPayments];
        newPayments[index] = val;
        setMonthlyPayments(newPayments);
    };

    const totalReceipts = monthlyReceipts.reduce((a, b) => a + b, 0);
    const totalPayments = monthlyPayments.reduce((a, b) => a + b, 0);
    const finalBalance = chartData.length > 0 ? chartData[chartData.length - 1].closingBalance : openingBalance;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col lg:flex-row gap-8"
        >
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Calculator className="mr-2 text-indigo-600" size={24} />
                            Cash Flow Inputs
                        </h2>
                        <button 
                            onClick={resetAll}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Reset to defaults"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance (£)</label>
                            <input 
                                type="number" 
                                step="100"
                                value={openingBalance} 
                                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map((m, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="font-bold text-slate-700 text-sm">{m} Details</span>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500">Receipts</label>
                                            <input 
                                                type="number" 
                                                step="50"
                                                value={monthlyReceipts[i]} 
                                                onChange={(e) => handleReceiptChange(i, parseFloat(e.target.value) || 0)}
                                                className="w-full p-1 text-sm border border-slate-300 rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500">Payments</label>
                                            <input 
                                                type="number" 
                                                step="50"
                                                value={monthlyPayments[i]} 
                                                onChange={(e) => handlePaymentChange(i, parseFloat(e.target.value) || 0)}
                                                className="w-full p-1 text-sm border border-slate-300 rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Start Scenarios</h3>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => { 
                                    setOpeningBalance(5000); 
                                    setMonthlyReceipts([8000, 12000, 15000, 5000, 4000, 6000]);
                                    setMonthlyPayments([6000, 7000, 8000, 6000, 6000, 6000]);
                                }}
                                className="text-xs bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                ⛱️ Seasonal Retail
                            </button>
                            <button 
                                onClick={() => { 
                                    setOpeningBalance(1000); 
                                    setMonthlyReceipts([3000, 3000, 10000, 3000, 3000, 15000]);
                                    setMonthlyPayments([4000, 4000, 4000, 4000, 4000, 4000]);
                                }}
                                className="text-xs bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                💼 Consultancy
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
                        <TrendingUp className="mr-2 text-emerald-600" size={24} />
                        Cash Summary
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <span className="text-sm text-indigo-700 font-medium block">Total Receipts</span>
                            <span className="text-2xl font-bold text-indigo-900">£{totalReceipts.toLocaleString()}</span>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                            <span className="text-sm text-rose-700 font-medium block">Total Payments</span>
                            <span className="text-2xl font-bold text-rose-900">£{totalPayments.toLocaleString()}</span>
                        </div>
                        <div className={`p-4 rounded-lg border ${finalBalance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <span className={`text-sm font-medium block ${finalBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Closing Balance</span>
                            <span className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>£{finalBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                            <ArrowUpRight size={16} className="mr-2 text-indigo-500" />
                            Net Cash Flow Trend
                        </h3>
                        <div className="space-y-2">
                            {chartData.map((data, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                                    <span className="text-slate-500 font-medium">{data.month}</span>
                                    <span className={`font-bold ${data.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {data.netCashFlow >= 0 ? '+' : ''}£{data.netCashFlow.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <div className="mb-6 flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                        <Info className="mr-3 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900">Cash Flow Visualisation</h3>
                            <p className="text-sm">
                                The bars show your monthly inflows and outflows. The line tracks your <strong>Closing Balance</strong> over time. 
                                Watch out for months where the line dips below zero!
                            </p>
                        </div>
                    </div>

                    <div className="flex-grow min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => [`£${value.toLocaleString()}`, '']} />
                                <Legend verticalAlign="top" height={36}/>
                                <Bar dataKey="receipts" fill="#6366f1" name="Receipts" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="payments" fill="#f43f5e" name="Payments" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="closingBalance" stroke="#10b981" strokeWidth={4} name="Closing Balance" dot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                                <HelpCircle size={18} className="mr-2 text-slate-500" />
                                Key Definitions
                            </h4>
                            <ul className="text-sm space-y-1 text-slate-600">
                                <li><strong>Net Cash Flow</strong> = Receipts - Payments</li>
                                <li><strong>Closing Balance</strong> = Opening Balance + Net Cash Flow</li>
                                <li><strong>Liquidity</strong> = The ability of a business to meet its short-term debts.</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                                <DollarSign size={18} className="mr-2 text-amber-600" />
                                Exam Tip
                            </h4>
                            <p className="text-sm text-amber-700 italic">
                                "Profit is NOT the same as cash! A business can be profitable but still fail due to poor cash flow management. Always check the timing of payments."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

interface AppraisalData {
    year: number;
    cashFlow: number;
    cumulative: number;
}

const InvestmentAppraisalSimulator: React.FC = () => {
    const [initialInvestment, setInitialInvestment, resetInvestment] = useSimulationPersistence<number>('ia_investment', 100000);
    const [annualCashFlows, setAnnualCashFlows, resetFlows] = useSimulationPersistence<number[]>('ia_flows', [30000, 35000, 40000, 30000, 25000]);
    const [discountRate, setDiscountRate, resetRate] = useSimulationPersistence<number>('ia_rate', 10);
    const [chartData, setChartData] = useState<AppraisalData[]>([]);

    const resetAll = () => {
        resetInvestment();
        resetFlows();
        resetRate();
    };

    useEffect(() => {
        const data: AppraisalData[] = [{ year: 0, cashFlow: -initialInvestment, cumulative: -initialInvestment }];
        let cum = -initialInvestment;
        for (let i = 0; i < annualCashFlows.length; i++) {
            cum += annualCashFlows[i];
            data.push({
                year: i + 1,
                cashFlow: annualCashFlows[i],
                cumulative: cum
            });
        }
        setChartData(data);
    }, [initialInvestment, annualCashFlows]);

    const handleFlowChange = (index: number, val: number) => {
        const flows = [...annualCashFlows];
        flows[index] = val;
        setAnnualCashFlows(flows);
    };

    // Calculate Payback
    let paybackYears = 0;
    let paybackMonths = 0;
    let found = false;
    for (let i = 0; i < chartData.length - 1; i++) {
        if (chartData[i].cumulative < 0 && chartData[i+1].cumulative >= 0) {
            paybackYears = chartData[i].year;
            const remaining = -chartData[i].cumulative;
            const nextFlow = chartData[i+1].cashFlow;
            paybackMonths = Math.ceil((remaining / nextFlow) * 12);
            found = true;
            break;
        }
    }

    // Calculate ARR
    const totalProfit = annualCashFlows.reduce((a, b) => a + b, 0) - initialInvestment;
    const averageProfit = totalProfit / annualCashFlows.length;
    const arr = (averageProfit / initialInvestment) * 100;

    // Calculate NPV
    const npv = annualCashFlows.reduce((acc, flow, i) => {
        return acc + (flow / Math.pow(1 + (discountRate / 100), i + 1));
    }, -initialInvestment);

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col lg:flex-row gap-8"
        >
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Calculator className="mr-2 text-indigo-600" size={24} />
                            Project Details
                        </h2>
                        <button 
                            onClick={resetAll}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Reset to defaults"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Investment (£)</label>
                            <input 
                                type="number" 
                                step="1000"
                                value={initialInvestment} 
                                onChange={(e) => setInitialInvestment(parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Discount Rate (%)</label>
                            <input 
                                type="number" 
                                step="0.5"
                                value={discountRate} 
                                onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Annual Net Cash Flows (£)</label>
                            {annualCashFlows.map((flow, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 w-12">Year {i+1}</span>
                                    <input 
                                        type="number" 
                                        step="100"
                                        value={flow} 
                                        onChange={(e) => handleFlowChange(i, parseFloat(e.target.value) || 0)}
                                        className="flex-grow p-1 text-sm border border-slate-300 rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Start Scenarios</h3>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => { 
                                    setInitialInvestment(35000); 
                                    setAnnualCashFlows([12000, 12000, 10000, 8000, 5000]);
                                }}
                                className="text-xs bg-slate-100 hover:bg-violet-100 hover:text-violet-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                🚚 Delivery Van
                            </button>
                            <button 
                                onClick={() => { 
                                    setInitialInvestment(500000); 
                                    setAnnualCashFlows([100000, 150000, 200000, 250000, 300000]);
                                }}
                                className="text-xs bg-slate-100 hover:bg-violet-100 hover:text-violet-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                🏭 New Factory
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
                        <TrendingUp className="mr-2 text-emerald-600" size={24} />
                        Appraisal Results
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <span className="text-sm text-indigo-700 font-medium block">Payback Period</span>
                            <span className="text-2xl font-bold text-indigo-900">
                                {found ? `${paybackYears}y ${paybackMonths}m` : 'Never recovered'}
                            </span>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <span className="text-sm text-emerald-700 font-medium block">Accounting Rate of Return</span>
                            <span className="text-2xl font-bold text-emerald-900">{arr.toFixed(2)}%</span>
                        </div>
                        <div className={`p-4 rounded-lg border ${npv >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-rose-50 border-rose-100'}`}>
                            <span className={`text-sm font-medium block ${npv >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>Net Present Value (NPV)</span>
                            <span className={`text-2xl font-bold ${npv >= 0 ? 'text-blue-900' : 'text-rose-900'}`}>£{npv.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <div className="mb-6 flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                        <Info className="mr-3 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900">Cumulative Cash Flow</h3>
                            <p className="text-sm">
                                The point where the cumulative line crosses £0 is the <strong>Payback Point</strong>. 
                                A steeper line indicates faster recovery of the initial cost.
                            </p>
                        </div>
                    </div>

                    <div className="flex-grow min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => [`£${value.toLocaleString()}`, '']} />
                                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
                                <Line type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={4} name="Cumulative Cash Flow" dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                                <HelpCircle size={18} className="mr-2 text-slate-500" />
                                ARR Formula
                            </h4>
                            <div className="text-xs space-y-2 text-slate-600 bg-white p-2 rounded border border-slate-100">
                                <p className="font-bold text-center underline">Average Annual Profit</p>
                                <p className="text-center">Initial Investment</p>
                                <p className="text-center font-bold">× 100</p>
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                                <DollarSign size={18} className="mr-2 text-amber-600" />
                                Exam Tip
                            </h4>
                            <p className="text-sm text-amber-700 italic">
                                "Payback ignores the 'time value of money' and any cash flows occurring AFTER the payback point. ARR uses accounting profit, not just cash flows!"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

interface VarianceData {
    category: string;
    budget: number;
    actual: number;
    variance: number;
    type: 'F' | 'A';
}

const VarianceAnalysisSimulator: React.FC = () => {
    const [data, setData, resetData] = useSimulationPersistence<{[key: string]: {budget: number, actual: number}}>('va_data', {
        'Sales Revenue': { budget: 50000, actual: 52000 },
        'Direct Materials': { budget: 15000, actual: 16500 },
        'Direct Labor': { budget: 10000, actual: 9500 },
        'Overheads': { budget: 5000, actual: 5500 }
    });

    const categories = Object.keys(data);
    const chartData: VarianceData[] = categories.map(cat => {
        const b = data[cat].budget;
        const a = data[cat].actual;
        const diff = cat.includes('Sales') ? a - b : b - a;
        return {
            category: cat,
            budget: b,
            actual: a,
            variance: Math.abs(diff),
            type: diff >= 0 ? 'F' : 'A'
        };
    });

    const handleInputChange = (cat: string, field: 'budget' | 'actual', val: number) => {
        setData(prev => ({
            ...prev,
            [cat]: { ...prev[cat], [field]: val }
        }));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, rotateX: -10 }}
            animate={{ opacity: 1, rotateX: 0 }}
            className="flex flex-col lg:flex-row gap-8"
        >
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle size={80} />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Calculator className="mr-2 text-indigo-600" size={24} />
                            Variance Inputs
                        </h2>
                        <button 
                            onClick={resetData}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Reset to defaults"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        {categories.map(cat => (
                            <div key={cat} className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">{cat}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Budgeted</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={data[cat].budget} 
                                            onChange={(e) => handleInputChange(cat, 'budget', parseFloat(e.target.value) || 0)}
                                            className="w-full p-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Actual</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={data[cat].actual} 
                                            onChange={(e) => handleInputChange(cat, 'actual', parseFloat(e.target.value) || 0)}
                                            className="w-full p-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Start Scenarios</h3>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => { 
                                    setData({
                                        'Sales Revenue': { budget: 50000, actual: 52000 },
                                        'Direct Materials': { budget: 15000, actual: 16500 },
                                        'Direct Labor': { budget: 10000, actual: 9500 },
                                        'Overheads': { budget: 5000, actual: 5500 }
                                    });
                                }}
                                className="text-xs bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                📈 Normal Month
                            </button>
                            <button 
                                onClick={() => { 
                                    setData({
                                        'Sales Revenue': { budget: 40000, actual: 38000 },
                                        'Direct Materials': { budget: 10000, actual: 15000 },
                                        'Direct Labor': { budget: 8000, actual: 8500 },
                                        'Overheads': { budget: 4000, actual: 4000 }
                                    });
                                }}
                                className="text-xs bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                ⚠️ Cost Crisis
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
                        <TrendingUp className="mr-2 text-emerald-600" size={24} />
                        Variance Summary
                    </h2>
                    <div className="space-y-3">
                        {chartData.map(d => (
                            <div key={d.category} className={`p-3 rounded-lg border flex justify-between items-center ${d.type === 'F' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 block uppercase">{d.category}</span>
                                    <span className={`text-lg font-bold ${d.type === 'F' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        £{d.variance.toLocaleString()} ({d.type})
                                    </span>
                                </div>
                                {d.type === 'F' ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <div className="mb-6 flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                        <Info className="mr-3 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900">Budget vs. Actual Comparison</h3>
                            <p className="text-sm">
                                <strong>Favourable (F)</strong> means higher profit than budgeted (Higher Sales or Lower Costs).<br/>
                                <strong>Adverse (A)</strong> means lower profit than budgeted (Lower Sales or Higher Costs).
                            </p>
                        </div>
                    </div>

                    <div className="flex-grow min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => [`£${value.toLocaleString()}`, '']} />
                                <Legend />
                                <Bar dataKey="budget" fill="#94a3b8" name="Budgeted" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="actual" fill="#6366f1" name="Actual" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                                <HelpCircle size={18} className="mr-2 text-slate-500" />
                                Why Variances Occur?
                            </h4>
                            <ul className="text-sm space-y-1 text-slate-600">
                                <li><strong>Materials:</strong> Price changes or wastage.</li>
                                <li><strong>Labor:</strong> Wage rate changes or efficiency/idle time.</li>
                                <li><strong>Sales:</strong> Market demand or pricing strategy.</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                                <DollarSign size={18} className="mr-2 text-amber-600" />
                                Exam Tip
                            </h4>
                            <p className="text-sm text-amber-700 italic">
                                "Always state whether a variance is Favourable or Adverse. Don't just show the number! Explain the potential reasons, e.g., 'Cheaper materials led to a Favourable Price Variance but an Adverse Usage Variance due to poor quality'."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

interface RatioData {
    ratio: string;
    value: number;
    target: number;
    unit: string;
}

const RatioAnalysisSimulator: React.FC = () => {
    const [incomeData, setIncomeData, resetIncome] = useSimulationPersistence('ra_income', {
        revenue: 100000,
        grossProfit: 40000,
        netProfit: 15000,
        operatingProfit: 20000
    });

    const [balanceData, setBalanceData, resetBalance] = useSimulationPersistence('ra_balance', {
        inventory: 12000,
        currentAssets: 45000,
        currentLiabilities: 30000,
        nonCurrentLiabilities: 50000,
        equity: 100000
    });

    const resetAll = () => {
        resetIncome();
        resetBalance();
    };

    const capitalEmployed = balanceData.equity + balanceData.nonCurrentLiabilities;

    const ratios: RatioData[] = [
        { 
            ratio: 'Gross Profit Margin', 
            value: (incomeData.grossProfit / incomeData.revenue) * 100, 
            target: 45, 
            unit: '%' 
        },
        { 
            ratio: 'Net Profit Margin', 
            value: (incomeData.netProfit / incomeData.revenue) * 100, 
            target: 20, 
            unit: '%' 
        },
        { 
            ratio: 'ROCE', 
            value: (incomeData.operatingProfit / capitalEmployed) * 100, 
            target: 15, 
            unit: '%' 
        },
        { 
            ratio: 'Current Ratio', 
            value: balanceData.currentAssets / balanceData.currentLiabilities, 
            target: 1.5, 
            unit: ':1' 
        },
        { 
            ratio: 'Liquid Ratio', 
            value: (balanceData.currentAssets - balanceData.inventory) / balanceData.currentLiabilities, 
            target: 1.0, 
            unit: ':1' 
        },
        { 
            ratio: 'Gearing', 
            value: (balanceData.nonCurrentLiabilities / capitalEmployed) * 100, 
            target: 40, 
            unit: '%' 
        }
    ];

    const handleIncomeChange = (field: string, val: number) => {
        setIncomeData(prev => ({ ...prev, [field]: val }));
    };

    const handleBalanceChange = (field: string, val: number) => {
        setBalanceData(prev => ({ ...prev, [field]: val }));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-8"
        >
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Award size={80} />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Calculator className="mr-2 text-indigo-600" size={24} />
                            Financial Data
                        </h2>
                        <button 
                            onClick={resetAll}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Reset to defaults"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Income Statement</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Revenue</label>
                                    <input type="number" step="0.01" value={incomeData.revenue} onChange={(e) => handleIncomeChange('revenue', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Gross Profit</label>
                                    <input type="number" step="0.01" value={incomeData.grossProfit} onChange={(e) => handleIncomeChange('grossProfit', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Operating Profit</label>
                                    <input type="number" step="0.01" value={incomeData.operatingProfit} onChange={(e) => handleIncomeChange('operatingProfit', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Net Profit</label>
                                    <input type="number" step="0.01" value={incomeData.netProfit} onChange={(e) => handleIncomeChange('netProfit', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Balance Sheet</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Inventory</label>
                                    <input type="number" step="100" value={balanceData.inventory} onChange={(e) => handleBalanceChange('inventory', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Curr. Assets</label>
                                    <input type="number" step="100" value={balanceData.currentAssets} onChange={(e) => handleBalanceChange('currentAssets', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Curr. Liabs</label>
                                    <input type="number" step="100" value={balanceData.currentLiabilities} onChange={(e) => handleBalanceChange('currentLiabilities', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Long-term Debt</label>
                                    <input type="number" step="100" value={balanceData.nonCurrentLiabilities} onChange={(e) => handleBalanceChange('nonCurrentLiabilities', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Total Equity</label>
                                    <input type="number" step="1000" value={balanceData.equity} onChange={(e) => handleBalanceChange('equity', parseFloat(e.target.value) || 0)} className="w-full p-1 text-sm border border-slate-300 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Start Scenarios</h3>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => { 
                                    setIncomeData({ revenue: 200000, grossProfit: 80000, operatingProfit: 30000, netProfit: 25000 });
                                    setBalanceData({ inventory: 20000, currentAssets: 60000, currentLiabilities: 40000, nonCurrentLiabilities: 20000, equity: 100000 });
                                }}
                                className="text-xs bg-slate-100 hover:bg-pink-100 hover:text-pink-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                ✨ Healthy Retailer
                            </button>
                            <button 
                                onClick={() => { 
                                    setIncomeData({ revenue: 500000, grossProfit: 150000, operatingProfit: 60000, netProfit: 30000 });
                                    setBalanceData({ inventory: 50000, currentAssets: 12000, currentLiabilities: 100000, nonCurrentLiabilities: 300000, equity: 150000 });
                                }}
                                className="text-xs bg-slate-100 hover:bg-pink-100 hover:text-pink-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                                🚩 High Gearing
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
                        <TrendingUp className="mr-2 text-emerald-600" size={24} />
                        Ratio Insights
                    </h2>
                    <div className="space-y-4">
                        {ratios.map(r => {
                            const isGood = r.ratio === 'Gearing' ? r.value <= r.target : r.value >= r.target;
                            return (
                                <div key={r.ratio} className={`p-3 rounded-lg border flex justify-between items-center ${isGood ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 block uppercase">{r.ratio}</span>
                                        <span className={`text-lg font-bold ${isGood ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {r.value.toFixed(2)}{r.unit}
                                        </span>
                                    </div>
                                    {isGood ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <div className="mb-6 flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                        <Info className="mr-3 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900">Performance vs. Benchmarks</h3>
                            <p className="text-sm">
                                Compare your business's ratios against industry targets. Values above the target (for profitability/liquidity) or below (for gearing) are generally considered strong.
                            </p>
                        </div>
                    </div>

                    <div className="flex-grow min-h-[400px] grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="h-[350px]">
                            <h4 className="text-center text-xs font-bold text-slate-400 uppercase mb-2">Performance vs. Targets</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ratios} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="ratio" tick={{ fontSize: 9 }} interval={0} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" name="Actual Ratio" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="target" fill="#cbd5e1" name="Industry Target" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-[350px]">
                            <h4 className="text-center text-xs font-bold text-slate-400 uppercase mb-2">Business Balance Radar</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart outerRadius="70%" data={ratios}>
                                    <PolarGrid stroke="#f1f5f9" />
                                    <PolarAngleAxis dataKey="ratio" tick={{ fontSize: 8, fill: '#64748b' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 8 }} />
                                    <Radar name="Actual" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                    <Radar name="Target" dataKey="target" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                                    <Tooltip />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-indigo-900 text-indigo-50 rounded-lg border border-indigo-700 shadow-inner">
                            <h4 className="font-bold mb-2 flex items-center text-indigo-300">
                                <HelpCircle size={18} className="mr-2" />
                                Strategic Analysis Report
                            </h4>
                            <div className="text-xs space-y-2">
                                {ratios.some(r => r.ratio === 'Gearing' ? r.value > 50 : r.value < r.target * 0.5) ? (
                                    <div className="p-2 bg-rose-500/20 rounded border border-rose-500/30">
                                        <p className="text-rose-200 font-bold">⚠️ High Risk Exposure</p>
                                        <p className="text-rose-300">Significant financial imbalances detected. The business is heavily leveraged or shows poor liquidity.</p>
                                    </div>
                                ) : (
                                    <div className="p-2 bg-emerald-500/20 rounded border border-emerald-500/30">
                                        <p className="text-emerald-200 font-bold">✅ Financial Stability</p>
                                        <p className="text-emerald-300">The business maintains a healthy risk profile with manageable debt levels and solid liquidity.</p>
                                    </div>
                                )}
                                <div className="space-y-1 mt-2">
                                    <p className="leading-relaxed">
                                        <strong>Liquidity:</strong> {ratios.find(r => r.ratio === 'Current Ratio')!.value < 1.0 ? 
                                            "Dangerous. Current liabilities exceed current assets. Risk of insolvency." : 
                                            ratios.find(r => r.ratio === 'Current Ratio')!.value > 2.0 ?
                                            "Caution. Very high liquidity may suggest inefficient use of cash/stock." :
                                            "Solid. Ideal balance between safety and efficiency."}
                                    </p>
                                    <p className="leading-relaxed">
                                        <strong>Efficiency:</strong> {ratios.find(r => r.ratio === 'ROCE')!.value > 15 ? 
                                            "Excellent. Capital is generating high returns, likely from strong margins or asset turnover." : 
                                            "Low. Returns are trailing industry averages; consider reviewing fixed cost structures."}
                                    </p>
                                    <p className="leading-relaxed text-indigo-300 italic">
                                        * Recommendations are based on standard AQA Business benchmarking criteria.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                                <DollarSign size={18} className="mr-2 text-amber-600" />
                                Exam Tip
                            </h4>
                            <p className="text-sm text-amber-700 italic">
                                "Ratios mean nothing in isolation. Always compare them over time (Intra-firm) or against competitors (Inter-firm). A high current ratio might actually mean capital is tied up in idle stock!"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

interface SimulationViewProps {
    onBack: () => void;
    user: AuthUser;
    simulationId: string;
}

const SimulationView: React.FC<SimulationViewProps> = ({ onBack, user, simulationId }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-600 hover:text-indigo-600 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Hub
                </button>

                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">AQA A-Level Accounting Simulation Suite</h1>
                    <p className="text-slate-600 text-lg">Visualise AQA-standard models and test how changing variables impacts business performance in real-time.</p>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={simulationId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {simulationId === 'break_even_analysis' && <BreakEvenSimulator />}
                        {simulationId === 'cash_flow_forecast' && <CashFlowSimulator />}
                        {simulationId === 'investment_appraisal' && <InvestmentAppraisalSimulator />}
                        {simulationId === 'variance_analysis' && <VarianceAnalysisSimulator />}
                        {simulationId === 'ratio_analysis' && <RatioAnalysisSimulator />}
                        
                        {!['break_even_analysis', 'cash_flow_forecast', 'investment_appraisal', 'variance_analysis', 'ratio_analysis'].includes(simulationId) && (
                            <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                                <div className="text-5xl mb-4">🚧</div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Simulation Under Development</h3>
                                <p>The {simulationId.replace(/_/g, ' ')} simulation is being prepared for the AQA specification.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SimulationView;