import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Metric } from '../types';
import { format } from 'date-fns';

interface MetricChartProps {
  metrics: Metric[];
  type: string;
  color?: string;
}

export const MetricChart: React.FC<MetricChartProps> = ({ metrics, type, color = "#10b981" }) => {
  const data = metrics
    .filter(m => m.type === type)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: format(new Date(m.date), 'MMM dd'),
      value: m.value
    }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
        No data for {type} yet
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#color${type})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
