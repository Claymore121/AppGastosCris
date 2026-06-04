/* PLAN DE ACCIÓN:
   1. Importar `MonthlyWeeklySummary` en `src/components/AdminDashboard.jsx`.
   2. Calcular la lista de transacciones filtradas por usuario (`userFilteredTxs`).
   3. Renderizar el componente `<MonthlyWeeklySummary transactions={userFilteredTxs} />` en el dashboard del administrador.
   4. De esta manera, el análisis mensual agrupado por semanas se adaptará dinámicamente al usuario que el administrador seleccione para auditar (Usuario Principal, Demo o Todos).
*/

import React, { useState, useEffect } from 'react';
import { LogOut, ShieldAlert, Users, TrendingUp, TrendingDown, Search, Trash2, Clock } from 'lucide-react';
import MonthlyWeeklySummary from './MonthlyWeeklySummary';
import { supabase } from '../supabaseClient';

export default function AdminDashboard({ realTransactions, onDeleteRealTx, onLogout }) {
  const [selectedUser, setSelectedUser] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editHistory, setEditHistory] = useState([]);

  useEffect(() => {
    const fetchEditHistory = async () => {
      const { data } = await supabase
        .from('edit_history')
        .select('*')
        .order('id', { ascending: false });
      setEditHistory(data || []);
    };
    fetchEditHistory();
  }, []);

  const allTransactions = realTransactions.map(t => ({ ...t, user: 'main_user' }));

  const handleDelete = (tx) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      onDeleteRealTx(tx.id);
    }
  };

  const userFilteredTxs = selectedUser === 'all' ? allTransactions : allTransactions.filter(tx => tx.user === selectedUser);

  const filteredTxs = userFilteredTxs.filter(tx => {
    return tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
           tx.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalIncome = allTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = allTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const consolidatedBalance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center p-0 sm:p-4 md:p-8 font-sans">
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:border border-slate-100 shadow-2xl flex flex-col min-h-screen sm:min-h-[850px] relative overflow-hidden">
        
        {/* Encabezado / Admin Bar */}
        <header className="px-6 pt-6 pb-4 bg-indigo-900 text-white flex justify-between items-center rounded-b-2xl shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-800 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Panel Administrador</h1>
              <p className="text-[10px] text-indigo-300">Auditoría global de transacciones</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-indigo-800/50 hover:bg-indigo-800 text-indigo-200 hover:text-white transition-all btn-active flex items-center justify-center"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 px-6 py-5 overflow-y-auto custom-scrollbar flex flex-col space-y-6">
          
          {/* Métricas Consolidadas */}
          <section className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Métricas Consolidadas (Global)
            </h2>

            <div className="flex flex-col items-center py-2">
              <span className="text-xs text-slate-400 font-medium">Balance Total Sistema</span>
              <span className={`text-3xl font-extrabold tracking-tight mt-0.5 ${
                consolidatedBalance >= 0 ? 'text-teal-600' : 'text-rose-600'
              }`}>
                ${consolidatedBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Ingresos</p>
                  <p className="text-xs font-extrabold text-teal-600">${totalIncome.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Gastos</p>
                  <p className="text-xs font-extrabold text-rose-600">${totalExpense.toLocaleString('es-ES')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Filtros de Auditoría */}
          <section className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Auditar por Usuario
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'main_user', label: 'Principal' },
                ].map(usr => (
                  <button
                    key={usr.id}
                    onClick={() => setSelectedUser(usr.id)}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition-all btn-active ${
                      selectedUser === usr.id
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {usr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar descripción o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </section>

          {/* Reporte Mensual por Semanas (Filtro dinámico de transacciones) */}
          <MonthlyWeeklySummary transactions={userFilteredTxs} />

          {/* Listado Auditable */}
          <section className="flex-1 flex flex-col min-h-[250px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Registros del Sistema ({filteredTxs.length})
            </h3>
            
            <div className="flex-1 border border-slate-100 rounded-2xl overflow-y-auto custom-scrollbar divide-y divide-slate-100 bg-white">
              {filteredTxs.length > 0 ? (
                filteredTxs.map(tx => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-all group"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-700">{tx.description}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-teal-50 text-teal-600 border border-teal-100">
                          Principal
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-500">{tx.day}</span>
                        {tx.dateNum && (
                          <span>{tx.dateNum} de {tx.month || 'Mes'}</span>
                        )}
                        <span>•</span>
                        <span>{tx.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-extrabold ${
                        tx.type === 'income' ? 'text-teal-600' : 'text-rose-600'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('es-ES')}
                      </span>
                      <button
                        onClick={() => handleDelete(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border hover:border-rose-100 active:scale-95 transition-all md:opacity-0 group-hover:opacity-100"
                        title="Borrar como administrador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                  <p className="text-xs font-bold">Sin transacciones registradas</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">No coinciden registros con el filtro</p>
                </div>
              )}
            </div>
          </section>

          {/* Historial de Ediciones */}
          {editHistory.length > 0 && (
            <section className="border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Historial de Ediciones
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {editHistory.map(entry => {
                  const oldData = entry.old_data || {};
                  const newData = entry.new_data || {};
                  const changedFields = Object.keys(newData).filter(k => 
                    k !== 'id' && JSON.stringify(oldData[k]) !== JSON.stringify(newData[k])
                  );
                  return (
                    <div key={entry.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-indigo-600">Transacción #{entry.transaction_id}</span>
                        <span className="text-[9px] text-slate-400">{new Date(entry.edited_at).toLocaleString('es-ES')}</span>
                      </div>
                      {changedFields.map(field => (
                        <div key={field} className="text-[10px] text-slate-500 leading-relaxed">
                          <span className="font-semibold text-slate-600">{field}:</span>{' '}
                          <span className="line-through text-rose-400">{oldData[field]}</span>{' '}
                          <span className="text-teal-500">→ {newData[field]}</span>
                        </div>
                      ))}
                      {changedFields.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">Sin cambios detectados</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
