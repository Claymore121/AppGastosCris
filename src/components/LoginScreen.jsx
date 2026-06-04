/* PLAN DE ACCIÓN:
   1. Administrar el estado del rol seleccionado ('user' o 'admin').
   2. Administrar el estado del PIN ingresado por el usuario.
   3. Cargar las credenciales seguras desde las variables de entorno (`import.meta.env.VITE_USER_PIN` y `import.meta.env.VITE_ADMIN_PIN`), con fallbacks por defecto (`user123` y `admin123`).
   4. Al enviar el formulario, validar el PIN ingresado contra el rol seleccionado.
   5. Si es correcto, llamar a `onLogin(role)`. Si es incorrecto, mostrar una alerta amigable de error.
   6. Estilizar la pantalla en un formato claro, minimalista y responsive, con bordes redondeados amplios y sombras sutiles.
*/

import React, { useState } from 'react';
import { Shield, User, KeyRound, AlertCircle } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [role, setRole] = useState('user'); // 'user' o 'admin'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Pines cargados desde variables de entorno
    const userPin = import.meta.env.VITE_USER_PIN || 'user123';
    const adminPin = import.meta.env.VITE_ADMIN_PIN || 'admin123';

    if (role === 'user' && pin === userPin) {
      onLogin('user');
    } else if (role === 'admin' && pin === adminPin) {
      onLogin('admin');
    } else {
      setError('El PIN ingresado es incorrecto. Inténtalo de nuevo.');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center animate-scale-in">
        
        {/* Cabecera / Marca */}
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-500 mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">Acceso al Sistema</h2>
        <p className="text-sm text-slate-400 text-center mt-1">Elige tu rol y digita tu código de acceso semanal</p>

        {/* Selector de Rol */}
        <div className="grid grid-cols-2 gap-3 w-full mt-8">
          <button
            type="button"
            onClick={() => { setRole('user'); setError(''); }}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all btn-active ${
              role === 'user'
                ? 'border-teal-500 bg-teal-50/20 text-teal-600'
                : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600 bg-slate-50/50'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Usuario</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all btn-active ${
              role === 'admin'
                ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600'
                : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600 bg-slate-50/50'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
          </button>
        </div>

        {/* Formulario de PIN */}
        <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              PIN de Acceso
            </label>
            <input
              type="password"
              placeholder="Digite PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold tracking-widest text-slate-800 placeholder-slate-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              required
            />
          </div>

          {/* Mostrar error si lo hay */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-500 font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white shadow-lg transition-all btn-active ${
              role === 'user'
                ? 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
