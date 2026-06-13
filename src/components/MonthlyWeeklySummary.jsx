import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

const MONTHS_LIST = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MonthlyWeeklySummary({ transactions }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (transactions.length > 0) {
      return transactions[0].month;
    }
    const currentMonthIndex = new Date().getMonth();
    return MONTHS_LIST[currentMonthIndex];
  });

  const availableMonths = MONTHS_LIST.filter(month => 
    transactions.some(t => t.month === month)
  );

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [transactions]);

  const monthTransactions = transactions.filter(t => t.month === selectedMonth);

  const getWeeklyData = () => {
    const weeks = [
      { name: 'Semana 1', label: 'Días 1 al 7', income: 0, expense: 0, initialMoney: 0, finalBalance: 0 },
      { name: 'Semana 2', label: 'Días 8 al 14', income: 0, expense: 0, initialMoney: 0, finalBalance: 0 },
      { name: 'Semana 3', label: 'Días 15 al 21', income: 0, expense: 0, initialMoney: 0, finalBalance: 0 },
      { name: 'Semana 4', label: 'Días 22 al 28', income: 0, expense: 0, initialMoney: 0, finalBalance: 0 },
      { name: 'Semana 5', label: 'Días 29 al 31', income: 0, expense: 0, initialMoney: 0, finalBalance: 0 }
    ];

    monthTransactions.forEach(t => {
      const dateVal = parseInt(t.dateNum || '1', 10);
      let weekIndex = 4;

      if (dateVal >= 1 && dateVal <= 7) {
        weekIndex = 0;
      } else if (dateVal >= 8 && dateVal <= 14) {
        weekIndex = 1;
      } else if (dateVal >= 15 && dateVal <= 21) {
        weekIndex = 2;
      } else if (dateVal >= 22 && dateVal <= 28) {
        weekIndex = 3;
      }

      if (t.type === 'income') {
        weeks[weekIndex].income += Number(t.amount);
      } else {
        weeks[weekIndex].expense += Number(t.amount);
      }
    });

    let carryOver = 0;
    weeks.forEach(week => {
      week.initialMoney = carryOver;
      week.finalBalance = week.initialMoney + week.income - week.expense;
      carryOver = week.finalBalance > 0 ? week.finalBalance : 0;
    });

    return weeks;
  };

  const weeklySummary = getWeeklyData();

  if (transactions.length === 0) {
    return null;
  }

  const activeMonthToShow = availableMonths.includes(selectedMonth) 
    ? selectedMonth 
    : (availableMonths[0] || selectedMonth);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
          Resumen Mensual por Semanas
        </h3>
        
        <div className="relative">
          <select
            value={activeMonthToShow}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-3 pr-8 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700 appearance-none focus:outline-none focus:border-teal-500 transition-all cursor-pointer shadow-sm shadow-slate-100"
          >
            {availableMonths.length > 0 ? (
              availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))
            ) : (
              <option value={activeMonthToShow}>{activeMonthToShow}</option>
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-2.5">
        {weeklySummary.map((week) => {
          const hasFlow = week.income > 0 || week.expense > 0 || week.initialMoney > 0;

          return (
            <div 
              key={week.name}
              className={`p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                hasFlow 
                  ? 'bg-white border-slate-100 hover:border-slate-200/80 shadow-sm shadow-slate-100'
                  : 'bg-slate-50/40 border-slate-200/40 opacity-60'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">{week.name}</h4>
                  <p className="text-[9px] text-slate-400 font-semibold">{week.label}</p>
                </div>
                {hasFlow && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    week.finalBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {week.finalBalance >= 0 ? '+' : '-'}${Math.abs(week.finalBalance).toLocaleString('es-ES')}
                  </span>
                )}
              </div>

              {hasFlow ? (
                <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-slate-100">
                  {week.initialMoney > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-[10px] font-bold text-slate-500">Dinero inicial</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-600">+${week.initialMoney.toLocaleString('es-ES')}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span className="text-[10px] font-bold text-slate-500">Ingresos</span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700">+${week.income.toLocaleString('es-ES')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="text-[10px] font-bold text-slate-500">Gastos</span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700">-${week.expense.toLocaleString('es-ES')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-600">Saldo final</span>
                    <span className={`text-[11px] font-bold ${
                      week.finalBalance >= 0 ? 'text-teal-600' : 'text-rose-600'
                    }`}>
                      {week.finalBalance >= 0 ? '+' : '-'}${Math.abs(week.finalBalance).toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 font-medium italic mt-1 pt-2 border-t border-slate-100">Sin transacciones registradas esta semana</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
