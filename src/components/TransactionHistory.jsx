/* PLAN DE ACCIÓN:
   1. Modificar estilos de colores oscuros a colores claros minimalistas (fondo de tarjetas en blanco, bordes grises claros, texto en slate-800).
   2. Ajustar los estilos del selector de filtros a la paleta clara (botones grises suaves con acento slate).
   3. Mostrar la fecha formateada combinando el día de la semana (`day`), el número del día (`dateNum`) y la abreviatura del mes (`month`).
   4. Asegurar que si los registros viejos no tienen `dateNum` o `month`, se muestre solo el día de la semana con gracia.
*/

import React, { useState } from 'react';
import { 
  Trash2, 
  Utensils, 
  Car, 
  Gamepad2, 
  HeartPulse, 
  Home, 
  Briefcase, 
  HelpCircle, 
  Tv,
  Coins,
  Sparkles,
  Gift
} from 'lucide-react';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Comida':
      return <Utensils className="w-4 h-4 text-orange-500" />;
    case 'Transporte':
      return <Car className="w-4 h-4 text-blue-500" />;
    case 'Ocio':
      return <Gamepad2 className="w-4 h-4 text-purple-500" />;
    case 'Salud':
      return <HeartPulse className="w-4 h-4 text-rose-500" />;
    case 'Hogar':
      return <Home className="w-4 h-4 text-amber-500" />;
    case 'Suscripciones':
      return <Tv className="w-4 h-4 text-cyan-500" />;
    case 'Sueldo':
      return <Briefcase className="w-4 h-4 text-emerald-500" />;
    case 'Freelance':
      return <Sparkles className="w-4 h-4 text-teal-500" />;
    case 'Regalo':
      return <Gift className="w-4 h-4 text-pink-500" />;
    case 'Inversiones':
      return <Coins className="w-4 h-4 text-yellow-500" />;
    default:
      return <HelpCircle className="w-4 h-4 text-slate-500" />;
  }
};

export default function TransactionHistory({ transactions, onDelete }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === 'all') return true;
    return t.type === activeFilter;
  });

  return (
    <div className="flex flex-col h-full max-h-[300px] sm:max-h-[350px]">
      {/* Botones de Filtro */}
      <div className="flex border-b border-slate-100 px-3 py-2 bg-slate-50 gap-1.5">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'expense', label: 'Gastos' },
          { id: 'income', label: 'Ingresos' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all btn-active ${
              activeFilter === filter.id
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Lista de Transacciones */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-white">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 transition-all group animate-fade-in"
            >
              {/* Icono + Detalles */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {getCategoryIcon(tx.category)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 line-clamp-1">{tx.description}</h4>
                  
                  {/* Fecha Detallada */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-medium">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-500">{tx.day}</span>
                    {tx.dateNum && tx.month && (
                      <>
                        <span>•</span>
                        <span>{tx.dateNum} de {tx.month.substring(0, 3)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{tx.category}</span>
                  </div>
                </div>
              </div>

              {/* Monto + Eliminar */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={`text-sm font-extrabold ${
                    tx.type === 'income' ? 'text-teal-600' : 'text-rose-600'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('es-ES')}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="p-2 rounded-lg bg-transparent text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border hover:border-rose-100 active:scale-95 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 py-10">
            <HelpCircle className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
            <p className="text-xs font-bold">Sin transacciones</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Utiliza los botones de arriba para agregar registros</p>
          </div>
        )}
      </div>
    </div>
  );
}
