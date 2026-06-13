import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const MONTHS_LIST = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_ORDER = { 'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3, 'Viernes': 4, 'Sábado': 5, 'Domingo': 6 };

const WEEK_RANGES = [
  { name: 'Semana 1', label: 'Días 1 al 7', start: 1, end: 7 },
  { name: 'Semana 2', label: 'Días 8 al 14', start: 8, end: 14 },
  { name: 'Semana 3', label: 'Días 15 al 21', start: 15, end: 21 },
  { name: 'Semana 4', label: 'Días 22 al 28', start: 22, end: 28 },
  { name: 'Semana 5', label: 'Días 29 al 31', start: 29, end: 31 },
];

const getWeekIndex = (dateNum) => {
  if (dateNum >= 1 && dateNum <= 7) return 0;
  if (dateNum >= 8 && dateNum <= 14) return 1;
  if (dateNum >= 15 && dateNum <= 21) return 2;
  if (dateNum >= 22 && dateNum <= 28) return 3;
  return 4;
};

export default function WeeklyChart({ transactions }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (transactions.length > 0) {
      return transactions[0].month;
    }
    return MONTHS_LIST[new Date().getMonth()];
  });

  const availableMonths = MONTHS_LIST.filter(month =>
    transactions.some(t => t.month === month)
  );

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [transactions]);

  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const currentMonthName = MONTHS_LIST[now.getMonth()];
    if (selectedMonth === currentMonthName) {
      return getWeekIndex(now.getDate());
    }
    return 0;
  });

  useEffect(() => {
    const now = new Date();
    const currentMonthName = MONTHS_LIST[now.getMonth()];
    if (selectedMonth === currentMonthName) {
      setCurrentWeek(getWeekIndex(now.getDate()));
    } else {
      setCurrentWeek(0);
    }
  }, [selectedMonth]);

  const monthTransactions = transactions.filter(t => t.month === selectedMonth);
  const weekRange = WEEK_RANGES[currentWeek];

  const weekTransactions = monthTransactions.filter(t => {
    const d = parseInt(t.dateNum || '1', 10);
    return d >= weekRange.start && d <= weekRange.end;
  });

  const dayGroups = {};
  weekTransactions.forEach(t => {
    if (!dayGroups[t.day]) dayGroups[t.day] = { income: 0, expense: 0 };
    if (t.type === 'income') dayGroups[t.day].income += Number(t.amount);
    else dayGroups[t.day].expense += Number(t.amount);
  });

  let chartData = DAYS_OF_WEEK
    .filter(day => dayGroups[day])
    .map(day => ({
      name: day.substring(0, 3),
      dayName: day,
      income: dayGroups[day].income,
      expense: dayGroups[day].expense,
      balance: dayGroups[day].income - dayGroups[day].expense,
    }))
    .sort((a, b) => DAY_ORDER[a.dayName] - DAY_ORDER[b.dayName]);

  let cum = 0;
  chartData.forEach(d => {
    cum += d.balance;
    d.cumulative = cum;
  });

  const hasData = chartData.length > 0;
  const finalBalance = chartData.length > 0 ? chartData[chartData.length - 1].cumulative : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-xs shadow-xl shadow-slate-200/50">
          <p className="font-bold text-slate-700 mb-1">{data.dayName}</p>
          <div className="flex flex-col gap-1">
            {data.income > 0 && <p className="text-teal-600 font-semibold">Ingresos: +${data.income.toLocaleString('es-ES')}</p>}
            {data.expense > 0 && <p className="text-rose-600 font-semibold">Gastos: -${data.expense.toLocaleString('es-ES')}</p>}
            <p className={`font-bold mt-0.5 ${data.cumulative >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
              Balance: {data.cumulative >= 0 ? '+' : ''}${data.cumulative.toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mt-2">
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-3 pr-8 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700 appearance-none focus:outline-none focus:border-teal-500 transition-all cursor-pointer shadow-sm shadow-slate-100"
          >
            {availableMonths.length > 0 ? (
              availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))
            ) : (
              <option value={selectedMonth}>{selectedMonth}</option>
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
            disabled={currentWeek === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <span className="text-xs font-bold text-slate-700 min-w-[130px] text-center select-none">
            {weekRange.name} ({weekRange.label})
          </span>

          <button
            onClick={() => setCurrentWeek(Math.min(4, currentWeek + 1))}
            disabled={currentWeek === 4}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="w-full h-48 flex items-center justify-center relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(val) => `$${val.toLocaleString('es-ES')}`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }} />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke={finalBalance >= 0 ? '#0D9488' : '#E11D48'}
                fill="url(#colorBalance)"
                strokeWidth={2.5}
                animationDuration={800}
                dot={{ fill: finalBalance >= 0 ? '#0D9488' : '#E11D48', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: finalBalance >= 0 ? '#0D9488' : '#E11D48', strokeWidth: 0, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 h-full">
            <p className="text-sm font-semibold">Sin datos en {weekRange.name.toLowerCase()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Cambia de semana o agrega registros</p>
          </div>
        )}
      </div>
    </div>
  );
}
