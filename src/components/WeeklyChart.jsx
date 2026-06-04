/* PLAN DE ACCIÓN:
   1. Ajustar el fondo del Tooltip personalizado a un color blanco minimalista (`bg-white`) con bordes limpios y sombra.
   2. Ajustar los colores del gráfico de barras de Recharts para adaptarlos a la paleta de colores claros.
   3. Cambiar la línea de referencia y las etiquetas del eje X a un gris de contraste adecuado para el fondo claro.
   4. Configurar la animación del gráfico para que fluya correctamente en dispositivos móviles.
*/

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function WeeklyChart({ transactions }) {
  // Generar datos agrupados por día
  const chartData = DAYS_OF_WEEK.map(day => {
    const dayTransactions = transactions.filter(t => t.day === day);
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      name: day.substring(0, 3), // Lun, Mar, Mie, etc.
      dayName: day,
      Ingresos: income,
      Gastos: expense,
    };
  });

  const hasData = transactions.length > 0;

  // Personalización del tooltip flotante para tema claro
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-xs shadow-xl shadow-slate-200/50">
          <p className="font-bold text-slate-700 mb-1">{payload[0].payload.dayName}</p>
          <div className="flex flex-col gap-1">
            <p className="text-teal-600 font-semibold">
              Ingresos: ${payload[0].payload.Ingresos.toLocaleString('es-ES')}
            </p>
            <p className="text-rose-600 font-semibold">
              Gastos: ${payload[0].payload.Gastos.toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48 flex items-center justify-center relative mt-2">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
            barSize={12}
            barGap={4}
          >
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 4 }} />
            <ReferenceLine y={0} stroke="#cbd5e1" />
            <Bar 
              dataKey="Ingresos" 
              fill="#0D9488" // Teal 600 amigable
              radius={[4, 4, 0, 0]} 
              animationDuration={800}
            />
            <Bar 
              dataKey="Gastos" 
              fill="#E11D48" // Rose 600 amigable
              radius={[4, 4, 0, 0]} 
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 h-full">
          <p className="text-sm font-semibold">Registra tu primer ingreso o gasto</p>
          <p className="text-[10px] text-slate-400 mt-0.5">para visualizar el gráfico semanal</p>
        </div>
      )}
    </div>
  );
}
