import React, { useState } from 'react';
import { formatCurrency, formatShortCurrency } from '../../utils/formatters';

interface RevenueExpenseLineChartProps {
  timeframe?: '7d' | '30d' | 'year';
  onTimeframeChange?: (tf: '7d' | '30d' | 'year') => void;
}

export const RevenueExpenseLineChart: React.FC<RevenueExpenseLineChartProps> = ({
  timeframe = '30d',
  onTimeframeChange,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const data30d = [
    { label: '01/08', income: 45000000, expense: 18500000 },
    { label: '05/08', income: 15500000, expense: 22000000 },
    { label: '08/08', income: 82000000, expense: 25000000 },
    { label: '10/08', income: 42000000, expense: 14000000 },
    { label: '15/08', income: 95000000, expense: 38000000 },
    { label: '18/08', income: 30000000, expense: 32400000 },
    { label: '20/08', income: 65000000, expense: 285000000 },
    { label: '23/08', income: 185000000, expense: 12500000 },
    { label: '24/08', income: 120000000, expense: 45000000 },
    { label: '26/08', income: 90000000, expense: 28000000 },
  ];

  const data7d = [
    { label: '20/08', income: 65000000, expense: 285000000 },
    { label: '21/08', income: 24000000, expense: 8500000 },
    { label: '22/08', income: 38000000, expense: 15000000 },
    { label: '23/08', income: 185000000, expense: 12500000 },
    { label: '24/08', income: 120000000, expense: 45000000 },
    { label: '25/08', income: 45000000, expense: 18000000 },
    { label: '26/08', income: 90000000, expense: 28000000 },
  ];

  const dataYear = [
    { label: 'T1', income: 420000000, expense: 280000000 },
    { label: 'T2', income: 380000000, expense: 260000000 },
    { label: 'T3', income: 510000000, expense: 340000000 },
    { label: 'T4', income: 580000000, expense: 390000000 },
    { label: 'T5', income: 640000000, expense: 410000000 },
    { label: 'T6', income: 720000000, expense: 480000000 },
    { label: 'T7', income: 790000000, expense: 520000000 },
    { label: 'T8', income: 926500000, expense: 608700000 },
  ];

  const activeData = timeframe === '7d' ? data7d : timeframe === 'year' ? dataYear : data30d;

  const maxVal = Math.max(...activeData.map((d) => Math.max(d.income, d.expense))) * 1.15;
  const height = 240;
  const width = 680;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (idx: number) => padLeft + (idx / (activeData.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - (val / maxVal) * chartH;

  const incomePoints = activeData.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');
  const expensePoints = activeData.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' ');

  const incomeArea = `${getX(0)},${padTop + chartH} ${incomePoints} ${getX(activeData.length - 1)},${padTop + chartH}`;
  const expenseArea = `${getX(0)},${padTop + chartH} ${expensePoints} ${getX(activeData.length - 1)},${padTop + chartH}`;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Biến động Doanh thu & Chi phí</h3>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi dòng tiền vào/ra theo chu kỳ thực tế</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 text-xs font-medium mr-2">
            <span className="inline-flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Doanh thu
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Chi phí
            </span>
          </div>
          {onTimeframeChange && (
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => onTimeframeChange('7d')}
                className={`px-2.5 py-1 rounded-md transition-all ${timeframe === '7d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                7 Ngày
              </button>
              <button
                onClick={() => onTimeframeChange('30d')}
                className={`px-2.5 py-1 rounded-md transition-all ${timeframe === '30d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                30 Ngày
              </button>
              <button
                onClick={() => onTimeframeChange('year')}
                className={`px-2.5 py-1 rounded-md transition-all ${timeframe === 'year' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                Năm nay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + chartH * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={idx}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padLeft - 8} y={y + 3} fill="#94A3B8" fontSize="10" textAnchor="end">
                  {formatShortCurrency(val)}
                </text>
              </g>
            );
          })}

          {/* Areas */}
          <polygon points={incomeArea} fill="url(#incomeGrad)" />
          <polygon points={expenseArea} fill="url(#expenseGrad)" />

          {/* Lines */}
          <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={incomePoints} />
          <polyline fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={expensePoints} />

          {/* Points & Interactive Nodes */}
          {activeData.map((d, i) => {
            const x = getX(i);
            const yInc = getY(d.income);
            const yExp = getY(d.expense);
            const isHovered = selectedPoint === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setSelectedPoint(i)}
                onMouseLeave={() => setSelectedPoint(null)}
              >
                {/* Vertical hover line */}
                {isHovered && (
                  <line x1={x} y1={padTop} x2={x} y2={padTop + chartH} stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 2" />
                )}

                {/* Income point */}
                <circle cx={x} cy={yInc} r={isHovered ? 5.5 : 3.5} fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />

                {/* Expense point */}
                <circle cx={x} cy={yExp} r={isHovered ? 5.5 : 3.5} fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />

                {/* X Axis Label */}
                <text x={x} y={padTop + chartH + 18} fill={isHovered ? '#0F172A' : '#64748B'} fontSize="10" textAnchor="middle" fontWeight={isHovered ? '600' : '400'}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {selectedPoint !== null && (
          <div
            className="absolute z-20 bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(getX(selectedPoint) / width) * 100}%`,
              top: '40%',
            }}
          >
            <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1">
              Kỳ: {activeData[selectedPoint].label}
            </div>
            <div className="flex items-center justify-between gap-3 text-emerald-400">
              <span>Doanh thu:</span>
              <span className="font-medium">{formatCurrency(activeData[selectedPoint].income)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-rose-400">
              <span>Chi phí:</span>
              <span className="font-medium">{formatCurrency(activeData[selectedPoint].expense)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sky-300 font-semibold pt-1 mt-1 border-t border-slate-800">
              <span>Chênh lệch:</span>
              <span>{formatCurrency(activeData[selectedPoint].income - activeData[selectedPoint].expense)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CostStructureDonut: React.FC<{ items?: { name: string; percentage: number; color: string; amount: number }[] }> = ({ items }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const defaultItems = [
    { name: 'Lương NV & BHXH (6422)', percentage: 46.8, color: '#EF4444', amount: 285000000 },
    { name: 'Thuê Văn phòng (6427)', percentage: 18.1, color: '#F97316', amount: 110000000 },
    { name: 'Hạ tầng Cloud AI (6428)', percentage: 15.1, color: '#F59E0B', amount: 92000000 },
    { name: 'Marketing (6418)', percentage: 11.2, color: '#8B5CF6', amount: 68500000 },
    { name: 'Tiếp khách & Công tác (6428)', percentage: 8.8, color: '#EC4899', amount: 53200000 },
  ];

  const data = items && items.length > 0 ? items : defaultItems;

  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Cơ cấu Chi phí</h3>
          <p className="text-xs text-slate-500">Tỷ trọng các nhóm chi phí chính</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-rose-50 text-rose-600 rounded-md">
          Tổng: {formatShortCurrency(data.reduce((s, i) => s + i.amount, 0))}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
            {data.map((item, idx) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += item.percentage;
              const isHov = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHov ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">Chiếm cao nhất</span>
            <span className="text-lg font-bold text-slate-800">46.8%</span>
            <span className="text-[11px] text-rose-500 font-medium">Lương NV</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {data.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                hoveredIdx === idx ? 'bg-slate-50 font-semibold' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-mono">{formatShortCurrency(item.amount)}</span>
                <span className="font-bold text-slate-800 w-11 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CashFlowBarChart: React.FC = () => {
  const data = [
    { day: '01', inflow: 45, outflow: 18, balance: 450 },
    { day: '05', inflow: 15, outflow: 22, balance: 443 },
    { day: '10', inflow: 82, outflow: 14, balance: 511 },
    { day: '15', inflow: 95, outflow: 38, balance: 568 },
    { day: '20', inflow: 65, outflow: 285, balance: 348 },
    { day: '24', inflow: 185, outflow: 45, balance: 488 },
    { day: '28', inflow: 90, outflow: 28, balance: 550 },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Diễn biến Dòng tiền Sổ quỹ</h3>
          <p className="text-xs text-slate-500">So sánh Thu vào, Chi ra và Số dư tích lũy 30 ngày qua (Đơn vị: Triệu VNĐ)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-3 h-3 bg-emerald-500 rounded-xs"></span> Tiền vào
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="w-3 h-3 bg-rose-500 rounded-xs"></span> Tiền ra
          </span>
        </div>
      </div>

      <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
            <div className="w-full flex items-end justify-center gap-1 h-36">
              {/* Inflow bar */}
              <div
                className="w-3 sm:w-5 bg-emerald-500 hover:bg-emerald-600 rounded-t-xs transition-all relative group"
                style={{ height: `${(item.inflow / 290) * 100}%` }}
                title={`Thu: +${item.inflow} Tr`}
              />
              {/* Outflow bar */}
              <div
                className="w-3 sm:w-5 bg-rose-500 hover:bg-rose-600 rounded-t-xs transition-all relative group"
                style={{ height: `${(item.outflow / 290) * 100}%` }}
                title={`Chi: -${item.outflow} Tr`}
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium group-hover:text-slate-900 mt-1">
              {item.day}/08
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AIForecastChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-full uppercase tracking-wider">
              AI Prediction Model
            </span>
            <h3 className="font-semibold text-slate-800 text-base">Mô hình Dự báo Doanh thu & Dòng tiền T9/2026</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Dự báo dựa trên mô hình học sâu chuỗi thời gian ARIMA + Monte Carlo</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-blue-600">
            <span className="w-3 h-0.5 bg-blue-600"></span> Dữ liệu thực tế
          </span>
          <span className="flex items-center gap-1.5 text-indigo-500">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500"></span> Dự báo AI (±8%)
          </span>
        </div>
      </div>

      <div className="h-56 relative w-full flex items-center justify-center bg-slate-50/50 rounded-lg p-2">
        <svg viewBox="0 0 600 180" className="w-full h-full">
          {/* Corridor Confidence Area */}
          <polygon
            points="360,95 440,75 520,60 580,50 580,95 520,110 440,120 360,105"
            fill="#818CF8"
            fillOpacity="0.15"
          />

          {/* Actual Line (T1 - T8) */}
          <polyline
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            points="30,130 90,125 150,110 210,100 270,85 360,100"
          />

          {/* Forecast Dotted Line (T9 - T10) */}
          <polyline
            fill="none"
            stroke="#6366F1"
            strokeWidth="3"
            strokeDasharray="5 5"
            strokeLinecap="round"
            points="360,100 440,88 520,75 580,65"
          />

          {/* Actual nodes */}
          <circle cx="30" cy="130" r="4" fill="#2563EB" />
          <circle cx="90" cy="125" r="4" fill="#2563EB" />
          <circle cx="150" cy="110" r="4" fill="#2563EB" />
          <circle cx="210" cy="100" r="4" fill="#2563EB" />
          <circle cx="270" cy="85" r="4" fill="#2563EB" />
          <circle cx="360" cy="100" r="5" fill="#2563EB" stroke="#fff" strokeWidth="2" />

          {/* Forecast nodes */}
          <circle cx="440" cy="88" r="4" fill="#6366F1" />
          <circle cx="520" cy="75" r="4" fill="#6366F1" />
          <circle cx="580" cy="65" r="5" fill="#6366F1" stroke="#fff" strokeWidth="2" />

          {/* Boundary Separator */}
          <line x1="360" y1="20" x2="360" y2="160" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="360" y="15" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="bold">
            Hôm nay (26/08)
          </text>

          {/* Labels */}
          <text x="30" y="170" fill="#94A3B8" fontSize="10" textAnchor="middle">T4</text>
          <text x="90" y="170" fill="#94A3B8" fontSize="10" textAnchor="middle">T5</text>
          <text x="150" y="170" fill="#94A3B8" fontSize="10" textAnchor="middle">T6</text>
          <text x="210" y="170" fill="#94A3B8" fontSize="10" textAnchor="middle">T7</text>
          <text x="270" y="170" fill="#94A3B8" fontSize="10" textAnchor="middle">T8</text>
          <text x="360" y="170" fill="#2563EB" fontSize="10" textAnchor="middle" fontWeight="bold">Hiện tại</text>
          <text x="440" y="170" fill="#6366F1" fontSize="10" textAnchor="middle" fontWeight="bold">Dự báo T9</text>
          <text x="520" y="170" fill="#6366F1" fontSize="10" textAnchor="middle" fontWeight="bold">Dự báo T10</text>
        </svg>
      </div>

      <div className="mt-3 p-3 bg-indigo-50/80 rounded-lg border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
        <span className="font-bold text-indigo-700 shrink-0">AI Insight:</span>
        <p>
          Doanh thu Tháng 9 dự báo đạt <span className="font-semibold text-indigo-700">1.050.000.000 ₫ (+13.3%)</span> với độ tin cậy 92%, nhờ vào 3 hợp đồng chuyển giao công nghệ mới được nghiệm thu.
        </p>
      </div>
    </div>
  );
};
