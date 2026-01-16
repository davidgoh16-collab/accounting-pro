
import React, { useState } from 'react';

// --- Types ---
export interface ChartDataPoint {
    label: string;
    value: number;
    category?: string;
}

interface ChartProps {
    data: ChartDataPoint[];
    title?: string;
}

// --- Helper Colors ---
const COLORS = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
];

// --- Simple Pie Chart ---
export const SimplePieChart: React.FC<ChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;

    // Sort by value desc for better visualization
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 max-w-md mx-auto">
            {title && <h4 className="text-center font-bold mb-4 text-stone-800 dark:text-stone-100">{title}</h4>}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-48 h-48 shrink-0">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                        {sortedData.map((item, index) => {
                            const percentage = item.value / total;
                            const angle = percentage * 360;
                            const largeArc = angle > 180 ? 1 : 0;

                            // Calculate coordinates
                            const r = 50;
                            const cx = 50;
                            const cy = 50;

                            const x1 = cx + r * Math.cos((Math.PI * cumulativeAngle) / 180);
                            const y1 = cy + r * Math.sin((Math.PI * cumulativeAngle) / 180);

                            const endAngle = cumulativeAngle + angle;
                            const x2 = cx + r * Math.cos((Math.PI * endAngle) / 180);
                            const y2 = cy + r * Math.sin((Math.PI * endAngle) / 180);

                            const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                            cumulativeAngle += angle;

                            return (
                                <path
                                    key={item.label}
                                    d={pathData}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="white"
                                    strokeWidth="1"
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <title>{`${item.label}: ${item.value}%`}</title>
                                </path>
                            );
                        })}
                    </svg>
                </div>
                <div className="flex-1 w-full">
                    <ul className="space-y-2 text-sm">
                        {sortedData.map((item, index) => (
                            <li key={item.label} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    {item.label}
                                </span>
                                <span className="font-bold text-stone-900 dark:text-stone-100">{item.value}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Simple Line Chart ---
export const SimpleLineChart: React.FC<ChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    // 1. Group by category (series)
    const seriesMap: Record<string, { x: string; y: number }[]> = {};
    const xLabels = Array.from(new Set(data.map(d => d.label))); // X-Axis Labels (e.g., Years)

    data.forEach(d => {
        const cat = d.category || 'Default';
        if (!seriesMap[cat]) seriesMap[cat] = [];
        seriesMap[cat].push({ x: d.label, y: d.value });
    });

    const categories = Object.keys(seriesMap);

    // 2. Determine Scale
    const allValues = data.map(d => d.value);
    const minVal = Math.min(0, ...allValues); // Start at 0 unless negative
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal;

    // 3. Render Helpers
    const getY = (val: number) => 100 - ((val - minVal) / (range || 1)) * 100;
    const getX = (index: number) => (index / (xLabels.length - 1)) * 100;

    return (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 w-full overflow-hidden">
            {title && <h4 className="font-bold mb-6 text-stone-800 dark:text-stone-100">{title}</h4>}

            <div className="relative h-64 w-full">
                {/* Y-Axis Grid Lines */}
                {[0, 25, 50, 75, 100].map(p => (
                    <div key={p} className="absolute w-full border-t border-stone-200 dark:border-stone-700" style={{ top: `${p}%` }}>
                        <span className="absolute -left-8 -top-2 text-xs text-stone-400">
                            {Math.round(minVal + (range * (100 - p) / 100))}
                        </span>
                    </div>
                ))}

                {/* Chart Area */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible ml-8">
                    {/* Zero Line if applicable */}
                    {minVal < 0 && maxVal > 0 && (
                        <line
                            x1="0" y1={getY(0)} x2="100" y2={getY(0)}
                            stroke="currentColor" strokeWidth="0.5" className="text-stone-400 opacity-50"
                        />
                    )}

                    {categories.map((cat, catIdx) => {
                        const points = seriesMap[cat].map(pt => {
                            const xIdx = xLabels.indexOf(pt.x);
                            return `${getX(xIdx)},${getY(pt.y)}`;
                        }).join(' ');

                        return (
                            <g key={cat}>
                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke={COLORS[catIdx % COLORS.length]}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="vector-effect-non-scaling-stroke hover:stroke-[3px] transition-all"
                                >
                                    <title>{cat}</title>
                                </polyline>
                                {/* Dots */}
                                {seriesMap[cat].map((pt, idx) => {
                                     const xIdx = xLabels.indexOf(pt.x);
                                     return (
                                        <circle
                                            key={idx}
                                            cx={getX(xIdx)}
                                            cy={getY(pt.y)}
                                            r="1.5"
                                            fill="white"
                                            stroke={COLORS[catIdx % COLORS.length]}
                                            strokeWidth="1"
                                            className="hover:r-2 transition-all"
                                        >
                                            <title>{`${cat} (${pt.x}): ${pt.y}`}</title>
                                        </circle>
                                     )
                                })}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 ml-8 text-xs text-stone-500 overflow-x-auto">
                 {/* Only show every nth label if too many */}
                {xLabels.map((lbl, i) => (
                    <span key={lbl} style={{ opacity: xLabels.length > 10 && i % 2 !== 0 ? 0 : 1 }}>{lbl}</span>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {categories.map((cat, i) => (
                    <div key={cat} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-stone-700 dark:text-stone-300">{cat}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Simple Bar Chart ---
// For Categorical Data (e.g. Map Data represented as bars)
export const SimpleBarChart: React.FC<ChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
            {title && <h4 className="font-bold mb-4 text-stone-800 dark:text-stone-100">{title}</h4>}
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-stone-700 dark:text-stone-300">{item.label}</span>
                            <span className="text-stone-500">{item.value}%</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(item.value / maxVal) * 100}%`,
                                    backgroundColor: COLORS[idx % COLORS.length]
                                }}
                            />
                        </div>
                        {item.category && <p className="text-xs text-stone-400 mt-0.5">{item.category}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};
