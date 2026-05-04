import React from 'react';
import { Page, AuthUser } from '../types';
import HubLayout from './HubLayout';
import HubCard from './HubCard';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface SimulationsHubViewProps {
    onNavigate: (page: Page, param?: any) => void;
    user: AuthUser;
}

const SimulationsHubView: React.FC<SimulationsHubViewProps> = ({ onNavigate, user }) => {
    return (
        <HubLayout
            title="AQA Accounting Simulations"
            subtitle="Master complex accounting models and 'What-If' scenarios aligned with the AQA A Level specification."
            gradient="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600"
            onBack={() => onNavigate('dashboard')}
        >
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                <HubCard
                    icon={<TrendingUp className="text-indigo-500" size={40} />}
                    title="Break-Even Analysis"
                    description="Visualise how fixed costs, variable costs, and selling price affect the break-even point and Margin of Safety."
                    onClick={() => onNavigate('simulation_view', 'break_even_analysis')}
                    shadowColor="shadow-indigo-500/20"
                    accentColor="text-indigo-600 hover:text-indigo-700"
                />

                <HubCard
                    icon={<BarChart3 className="text-emerald-500" size={40} />}
                    title="Cash Flow Forecast"
                    description="Manage receipts and payments to maintain liquidity. See the impact of credit terms on your closing balance."
                    onClick={() => onNavigate('simulation_view', 'cash_flow_forecast')}
                    shadowColor="shadow-emerald-500/20"
                    accentColor="text-emerald-600 hover:text-emerald-700"
                />

                <HubCard
                    icon={<PieChart className="text-violet-500" size={40} />}
                    title="Investment Appraisal"
                    description="Evaluate capital projects using Payback, ARR, and NPV as per AQA Project Appraisal standards."
                    onClick={() => onNavigate('simulation_view', 'investment_appraisal')}
                    shadowColor="shadow-violet-500/20"
                    accentColor="text-violet-600 hover:text-violet-700"
                />

                <HubCard
                    icon={<TrendingUp className="text-orange-500" size={40} />}
                    title="Variance Analysis"
                    description="Master Budgetary Control by comparing budgeted vs. actual figures to identify Favourable and Adverse variances."
                    onClick={() => onNavigate('simulation_view', 'variance_analysis')}
                    shadowColor="shadow-orange-500/20"
                    accentColor="text-orange-600 hover:text-orange-700"
                />

                <HubCard
                    icon={<BarChart3 className="text-pink-500" size={40} />}
                    title="Ratio Analysis"
                    description="Calculate and interpret liquidity, profitability, and gearing ratios against industry benchmarks."
                    onClick={() => onNavigate('simulation_view', 'ratio_analysis')}
                    shadowColor="shadow-pink-500/20"
                    accentColor="text-pink-600 hover:text-pink-700"
                />
            </main>
        </HubLayout>
    );
};

export default SimulationsHubView;