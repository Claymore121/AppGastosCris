/* PLAN DE ACCIÓN:
   1. Importar `MonthlyWeeklySummary` en `src/App.jsx`.
   2. Integrar el componente `<MonthlyWeeklySummary transactions={transactions} />` en el flujo de la vista de usuario.
   3. Ubicarlo justo debajo de la sección de botones de acción rápida, ofreciendo un desglose mensual agrupado por semanas antes del historial detallado de transacciones.
   4. Asegurar que las clases de espaciado mantengan la armonía estética y responsiva del dispositivo móvil.
*/

import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Wallet, ArrowUpRight, ArrowDownRight, Calendar, LogOut } from 'lucide-react';
import WeeklyChart from './components/WeeklyChart';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionHistory from './components/TransactionHistory';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import MonthlyWeeklySummary from './components/MonthlyWeeklySummary';
import { supabase } from './supabaseClient';

export default function App() {
  // Estado de Autenticación
  const [authRole, setAuthRole] = useState(() => {
    return localStorage.getItem('weekly_auth_role') || null;
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [editTx, setEditTx] = useState(null);

  // Cargar transacciones desde Supabase
  useEffect(() => {
    if (authRole) {
      fetchTransactions();
    }
  }, [authRole]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('[DATABASE FETCH ERROR]: Error cargando transacciones de Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  // Almacenar rol de sesión
  const handleLogin = (role) => {
    setAuthRole(role);
    localStorage.setItem('weekly_auth_role', role);
  };

  const handleLogout = () => {
    setAuthRole(null);
    localStorage.removeItem('weekly_auth_role');
  };

  // Cálculos de totales
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = async (newTx) => {
    try {
      // Omitimos el id local autogenerado para que Supabase asigne su ID incremental/UUID
      const { id, ...txData } = newTx;
      const { data, error } = await supabase
        .from('transactions')
        .insert([txData])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setTransactions(prev => [data[0], ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('[DATABASE INSERT ERROR]: Falló al insertar en Supabase:', err);
      alert('Error al guardar la transacción en Supabase.');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('[DATABASE DELETE ERROR]: Falló al eliminar en Supabase:', err);
      alert('Error al eliminar la transacción de Supabase.');
    }
  };

  const handleOpenEdit = (tx) => {
    setEditTx(tx);
    setModalType(tx.type);
    setModalOpen(true);
  };

  const handleUpdateTransaction = async (updatedTx) => {
    try {
      const { id, ...txData } = updatedTx;
      const oldTx = editTx;
      const { data, error } = await supabase
        .from('transactions')
        .update(txData)
        .eq('id', id)
        .select();

      if (error) throw error;

      const { error: logError } = await supabase
        .from('edit_history')
        .insert([{
          transaction_id: id,
          old_data: oldTx,
          new_data: updatedTx,
        }]);

      if (logError) console.error('[AUDIT LOG ERROR]:', logError);

      if (data && data.length > 0) {
        setTransactions(prev => prev.map(t => t.id === id ? data[0] : t));
      }
      setEditTx(null);
      setModalOpen(false);
    } catch (err) {
      console.error('[DATABASE UPDATE ERROR]: Falló al actualizar en Supabase:', err);
      alert('Error al actualizar la transacción.');
    }
  };

  // Ruteo condicional según estado de Login
  if (!authRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (authRole === 'admin') {
    return (
      <AdminDashboard 
        realTransactions={transactions} 
        onDeleteRealTx={handleDeleteTransaction}
        onLogout={handleLogout} 
      />
    );
  }

  // Interfaz de Usuario Normal (Tema Claro)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center p-0 sm:p-4 md:p-8 font-sans">
      {/* Contenedor estilo App Móvil */}
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:border border-slate-100 shadow-2xl flex flex-col min-h-screen sm:min-h-[850px] relative overflow-hidden">
        
        {/* Fondo decorativo radial claro */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-teal-400/5 to-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado / AppBar */}
        <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Finanzas Semanales
            </h1>
            <p className="text-xs text-slate-400">Control de gastos e ingresos</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-rose-500 transition-all btn-active"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Contenido con Scroll */}
        <main className="flex-1 px-6 pb-6 overflow-y-auto custom-scrollbar flex flex-col space-y-6 z-10">
          
          {/* SECCIÓN 1: Gráfico Semanal (Arriba) */}
          <section className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Flujo Semanal
            </h2>
            <WeeklyChart transactions={transactions} />
          </section>

          {/* SECCIÓN 2: Balance de Dinero Restante (Abajo del gráfico) */}
          <section className="text-center py-2 flex flex-col items-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dinero Disponible</p>
            <div className={`text-4xl font-extrabold tracking-tight mt-1 transition-all ${
              balance >= 0 ? 'text-teal-600' : 'text-rose-600'
            }`}>
              ${balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            {/* Tarjetas rápidas de ingresos vs gastos */}
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <div className="bg-teal-50/50 border border-teal-100/50 rounded-2xl p-3 flex items-center justify-between shadow-sm shadow-teal-100/10">
                <div>
                  <p className="text-[9px] text-teal-600 font-bold uppercase tracking-wider">Ingresos</p>
                  <p className="text-sm font-extrabold text-teal-700 mt-0.5">
                    +${totalIncome.toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-3 flex items-center justify-between shadow-sm shadow-rose-100/10">
                <div>
                  <p className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">Gastos</p>
                  <p className="text-sm font-extrabold text-rose-700 mt-0.5">
                    -${totalExpenses.toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: Botones de Acción (Debajo del balance) */}
          <section className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setModalType('income'); setEditTx(null); setModalOpen(true); }}
              className="py-3.5 px-4 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all btn-active"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Ingreso</span>
            </button>
            <button
              onClick={() => { setModalType('expense'); setEditTx(null); setModalOpen(true); }}
              className="py-3.5 px-4 bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all btn-active"
            >
              <MinusCircle className="w-5 h-5" />
              <span>Gasto</span>
            </button>
          </section>

          {/* SECCIÓN 4: Historial de Gastos e Ingresos */}
          <section className="flex-1 flex flex-col min-h-[220px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial de Transacciones</h3>
              <span className="text-xs text-slate-400 font-medium">{transactions.length} items</span>
            </div>
            <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden shadow-inner">
              <TransactionHistory 
                transactions={transactions} 
                onEdit={handleOpenEdit} 
              />
            </div>
          </section>

          {/* SECCIÓN 5: Reporte Mensual por Semanas (Movido al final) */}
          <MonthlyWeeklySummary transactions={transactions} />
        </main>
      </div>

      {/* Modal Deslizable */}
      <AddTransactionModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setEditTx(null); }} 
        onAdd={handleAddTransaction} 
        onUpdate={handleUpdateTransaction}
        editTx={editTx}
        type={modalType} 
      />
    </div>
  );
}
