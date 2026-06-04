/* PLAN DE ACCIÓN:
   1. Administrar el estado para el mes seleccionado (`selectedMonth`), por defecto "Junio" o el mes de la última transacción.
   2. Definir una lista de los meses disponibles para filtrar según las transacciones existentes en el sistema.
   3. Clasificar cada transacción del mes seleccionado en una de las 5 semanas según su campo `dateNum` (1-7: S1, 8-14: S2, 15-21: S3, 22-28: S4, 29-31: S5).
   4. Calcular el total acumulado de ingresos y gastos para cada una de las semanas.
   5. Renderizar un diseño minimalista claro con una tarjeta para cada semana del mes que contraste ingresos y gastos de forma limpia.
   6. Asegurar responsividad total para la visualización móvil.
*/

import React, { useState, useEffect } from 'react';
import { CalendarDays, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

const MONTHS_LIST = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MonthlyWeeklySummary({ transactions }) {
  // Autodetectar el mes por defecto de la última transacción o el mes actual
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (transactions.length > 0) {
      return transactions[0].month;
    }
    const currentMonthIndex = new Date().getMonth();
    return MONTHS_LIST[currentMonthIndex];
  });

  // Obtener la lista única de meses que tienen transacciones para el selector
  const availableMonths = MONTHS_LIST.filter(month => 
    transactions.some(t => t.month === month)
  );

  // Asegurar que si el mes actual disponible no tiene transacciones pero hay otros meses, seleccionamos el primero
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [transactions]);

  // Filtrar transacciones del mes seleccionado
  const monthTransactions = transactions.filter(t => t.month === selectedMonth);

  // Clasificar transacciones por semanas del mes
  const getWeeklyData = () => {
    const weeks = [
      { name: 'Semana 1', label: 'Días 1 al 7', income: 0, expense: 0 },
      { name: 'Semana 2', label: 'Días 8 al 14', income: 0, expense: 0 },
      { name: 'Semana 3', label: 'Días 15 al 21', income: 0, expense: 0 },
      { name: 'Semana 4', label: 'Días 22 al 28', income: 0, expense: 0 },
      { name: 'Semana 5', label: 'Días 29 al 31', income: 0, expense: 0 }
    ];

    monthTransactions.forEach(t => {
      const dateVal = parseInt(t.dateNum || '1', 10);
      let weekIndex = 4; // Semana 5 por defecto si es >= 29

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

    return weeks;
  };

  const weeklySummary = getWeeklyData();

  // Si no hay meses disponibles, mostrar una vista vacía elegante
  if (transactions.length === 0) {
    return null;
  }

  const activeMonthToShow = availableMonths.includes(selectedMonth) 
    ? selectedMonth 
    : (availableMonths[0] || selectedMonth);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Cabecera con selector de mes */}
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

      {/* Lista de Semanas */}
      <div className="space-y-2.5">
        {weeklySummary.map((week) => {
          const totalWeekFlow = week.income - week.expense;
          const hasFlow = week.income > 0 || week.expense > 0;

          return (
            <div 
              key={week.name}
              className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                hasFlow 
                  ? 'bg-white border-slate-100 hover:border-slate-200/80 shadow-sm shadow-slate-100'
                  : 'bg-slate-50/40 border-slate-200/40 opacity-60'
              }`}
            >
              {/* Info de la Semana */}
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">{week.name}</h4>
                  <p className="text-[9px] text-slate-400 font-semibold">{week.label}</p>
                </div>
                {hasFlow && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    totalWeekFlow >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {totalWeekFlow >= 0 ? '+' : '-'}${Math.abs(totalWeekFlow).toLocaleString('es-ES')}
                  </span>
                )}
              </div>

              {/* Barra de Distribución / Desglose */}
              {hasFlow ? (
                <div className="grid grid-cols-2 gap-2 mt-0.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Entró</p>
                      <p className="text-[11px] font-bold text-teal-700">+${week.income.toLocaleString('es-ES')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Gastó</p>
                      <p className="text-[11px] font-bold text-rose-700">-${week.expense.toLocaleString('es-ES')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 font-medium italic mt-0.5">Sin transacciones registradas esta semana</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
