import React from 'react';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Habit } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: number, status: boolean) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle }) => {
  const isCompleted = habit.completed === 1;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
        isCompleted 
          ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
          : "bg-white border-slate-200 text-slate-900 shadow-sm"
      )}
      onClick={() => onToggle(habit.id, !isCompleted)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-xl",
          isCompleted ? "bg-emerald-100" : "bg-slate-100"
        )}>
          {isCompleted ? <Trophy className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
        </div>
        <div>
          <h3 className="font-semibold text-sm">{habit.name}</h3>
          <p className="text-xs opacity-60">{habit.category}</p>
        </div>
      </div>
      {isCompleted ? (
        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
      )}
    </motion.div>
  );
};
