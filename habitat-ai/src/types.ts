export interface Habit {
  id: number;
  name: string;
  category: string;
  frequency: string;
  completed: number | null;
}

export interface Metric {
  id: number;
  type: string;
  value: number;
  unit: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
