/* PLAN DE ACCIÓN:
   1. Modificar estilos de colores oscuros a colores claros minimalistas (fondo de modal en blanco puro, bordes suaves grisáceos, tipografías oscuras).
   2. Agregar estados y selectores para la fecha detallada: número de día (`dateNum`) y nombre del mes (`month`).
   3. Auto-detectar y asignar la fecha actual al abrir el modal.
   4. Asegurar que la transacción enviada al callback `onAdd` incluya `dateNum` y `month`.
*/

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, ChevronDown } from 'lucide-react';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CATEGORIES = {
  income: ['Sueldo', 'Freelance', 'Regalo', 'Inversiones', 'Otros Ingresos'],
  expense: ['Comida', 'Transporte', 'Ocio', 'Salud', 'Hogar', 'Suscripciones', 'Otros Gastos']
};

export default function AddTransactionModal({ isOpen, onClose, onAdd, type }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState('Lunes');
  const [dateNum, setDateNum] = useState('1');
  const [month, setMonth] = useState('Enero');
  const [category, setCategory] = useState('');

  // Sincronizar categorías por defecto
  useEffect(() => {
    if (type) {
      setCategory(CATEGORIES[type][0]);
    }
  }, [type, isOpen]);

  // Autodetectar fecha actual del presente año
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      
      // Día de la semana (Lunes a Domingo)
      const dayIndex = today.getDay(); // 0: Domingo, 1: Lunes...
      const daysTranslation = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      setDay(daysTranslation[dayIndex]);
      
      // Número de día (1-31)
      setDateNum(today.getDate().toString());
      
      // Mes
      const monthIndex = today.getMonth(); // 0: Enero...
      setMonth(MONTHS[monthIndex]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) {
      alert('Por favor introduce un monto y una descripción válidos.');
      return;
    }

    const newTx = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      day,
      dateNum,
      month,
      category,
    };

    onAdd(newTx);
    
    // Resetear form
    setAmount('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Click de fondo para cerrar */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Sheet container (Bottom-sheet) */}
      <div className="w-full max-w-md bg-white border-t border-slate-100 rounded-t-3xl shadow-2xl relative z-10 animate-slide-up flex flex-col max-h-[92%] overflow-y-auto custom-scrollbar">
        {/* Mango de arrastre decorativo tipo iOS */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3" />

        {/* Cabecera */}
        <div className="px-6 pb-2 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full ${type === 'income' ? 'bg-teal-500' : 'bg-rose-500'}`} />
            Nuevo {type === 'income' ? 'Ingreso' : 'Gasto'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-all btn-active"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 flex flex-col gap-5 text-slate-700">
          
          {/* Monto de la transacción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Monto
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 font-bold text-2xl">$</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Descripción
            </label>
            <input
              type="text"
              placeholder="Ej. Comida rápida, Sueldo base..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm font-medium"
              maxLength={40}
              required
            />
          </div>

          {/* Selector de Día de la Semana */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Día de la semana
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all btn-active ${
                    day === d
                      ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {d.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Fecha Detallada (Día del mes y Mes) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Día del mes
              </label>
              <div className="relative">
                <select
                  value={dateNum}
                  onChange={(e) => setDateNum(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-teal-500 transition-all"
                >
                  {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mes (2026)
              </label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-teal-500 transition-all"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES[type]?.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition-all btn-active ${
                    category === cat
                      ? type === 'income'
                        ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm'
                        : 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            className={`w-full py-4 mt-2 rounded-2xl font-bold transition-all text-white shadow-lg btn-active ${
              type === 'income'
                ? 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/20'
                : 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20'
            }`}
          >
            Guardar {type === 'income' ? 'Ingreso' : 'Gasto'}
          </button>
        </form>
      </div>
    </div>
  );
}
