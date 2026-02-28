import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Moon, 
  Weight, 
  Droplets,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
  Settings,
  MessageSquare,
  Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HabitCard } from './components/HabitCard';
import { MetricChart } from './components/MetricChart';
import { AICoach } from './components/AICoach';
import { Habit, Metric } from './types';
import { getHealthInsights } from './services/gemini';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coach' | 'schedule' | 'settings' | 'workout'>('dashboard');
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    aiAnalysis: true,
    darkMode: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsRes, metricsRes] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/metrics')
      ]);
      const habitsData = await habitsRes.json();
      const metricsData = await metricsRes.json();
      setHabits(habitsData);
      setMetrics(metricsData);

      // Get AI insights
      const aiInsights = await getHealthInsights(habitsData, metricsData);
      setInsights(aiInsights);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const toggleHabit = async (id: number, status: boolean) => {
    try {
      await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: id, status })
      });
      setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: status ? 1 : 0 } : h));
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const addMetric = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const value = parseFloat(formData.get('value') as string);
    const unit = formData.get('unit') as string;

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, unit })
      });
      setIsAddingMetric(false);
      fetchData();
    } catch (err) {
      console.error("Add metric error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col p-4 fixed h-full z-10">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl hidden lg:block tracking-tight">Habitat AI</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('coach')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'coach' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium hidden lg:block">AI Coach</span>
          </button>
          <button 
            onClick={() => setActiveTab('workout')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'workout' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Workout Plan</span>
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Schedule</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Settings</span>
          </button>
        </nav>

        <div className="p-4 bg-indigo-600 rounded-2xl text-white hidden lg:block">
          <p className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wider">Pro Plan</p>
          <p className="text-sm font-bold mb-3">Unlock Advanced AI Insights</p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, User</h1>
            <p className="text-slate-500">Here's what's happening with your health today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddingMetric(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Log Metric
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-8"
            >
              {/* Left Column: Habits & Insights */}
              <div className="xl:col-span-2 space-y-8">
                {/* AI Insights Banner */}
                <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-indigo-200" />
                      <h2 className="text-lg font-bold">AI Health Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {insights.length > 0 ? insights.map((insight, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                          <p className="text-sm leading-relaxed">{insight}</p>
                        </div>
                      )) : (
                        <div className="col-span-3 text-center py-4 opacity-60 italic">Analyzing your data...</div>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                </section>

                {/* Habits Grid */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      Daily Habits
                    </h2>
                    <button className="text-sm font-semibold text-indigo-600 hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {habits.map(habit => (
                      <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
                    ))}
                  </div>
                </section>

                {/* Charts Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Weight className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold">Weight Trend</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 7 Days</span>
                    </div>
                    <MetricChart metrics={metrics} type="Weight" color="#10b981" />
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold">Sleep Quality</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 7 Days</span>
                    </div>
                    <MetricChart metrics={metrics} type="Sleep" color="#6366f1" />
                  </div>
                </section>
              </div>

              {/* Right Column: Quick Stats & Coach Preview */}
              <div className="space-y-8">
                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-bold mb-6">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <Droplets className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm">Water Intake</span>
                      </div>
                      <span className="font-bold">1.2L / 2.5L</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="font-semibold text-sm">Steps</span>
                      </div>
                      <span className="font-bold">6,432 / 10k</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-xl">
                          <Heart className="w-5 h-5 text-rose-600" />
                        </div>
                        <span className="font-semibold text-sm">Avg. Heart Rate</span>
                      </div>
                      <span className="font-bold">72 BPM</span>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">AI Health Coach</h2>
                    <button 
                      onClick={() => setActiveTab('coach')}
                      className="text-sm font-semibold text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      Full Chat <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <AICoach />
                </section>
              </div>
            </motion.div>
          ) : activeTab === 'coach' ? (
            <motion.div
              key="coach"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2">Your Personal Health Coach</h2>
                <p className="text-slate-500">Ask anything about nutrition, exercise, or your data.</p>
              </div>
              <AICoach />
            </motion.div>
          ) : activeTab === 'schedule' ? (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Your Health Schedule</h2>
                <div className="grid grid-cols-7 gap-4 mb-8">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</div>
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-2xl border flex items-center justify-center text-sm font-medium transition-all cursor-pointer hover:border-indigo-500 ${i + 1 === new Date().getDate() ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900">Upcoming Events</h3>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm">09:00</div>
                      <div>
                        <p className="font-bold text-slate-900">Morning Yoga Session</p>
                        <p className="text-sm text-slate-500">30 minutes • Home</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold shadow-sm">Join</button>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-emerald-600 shadow-sm">13:00</div>
                      <div>
                        <p className="font-bold text-slate-900">Nutrition Consultation</p>
                        <p className="text-sm text-slate-500">45 minutes • Online</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-sm font-bold shadow-sm">Reschedule</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'workout' ? (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Workout Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h3 className="font-bold text-lg mb-2">Morning Routine</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• 10 mins Dynamic Stretching</li>
                      <li>• 3 sets of 15 Push-ups</li>
                      <li>• 3 sets of 20 Bodyweight Squats</li>
                      <li>• 5 mins Meditation</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h3 className="font-bold text-lg mb-2">Evening Routine</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• 15 mins Light Cardio (Walking)</li>
                      <li>• 3 sets of 12 Dumbbell Rows</li>
                      <li>• 3 sets of 15 Lunges</li>
                      <li>• 10 mins Static Stretching</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-lg mb-4">Weekly Progress</h3>
                  <div className="flex items-center gap-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div key={i} className={`flex-1 h-12 rounded-xl border flex items-center justify-center font-bold ${i < 3 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold mb-8">Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">Notifications</p>
                      <p className="text-sm text-slate-500">Receive daily habit reminders</p>
                    </div>
                    <div 
                      onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: settings.notifications ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">AI Analysis</p>
                      <p className="text-sm text-slate-500">Allow AI to provide health insights</p>
                    </div>
                    <div 
                      onClick={() => setSettings(s => ({ ...s, aiAnalysis: !s.aiAnalysis }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.aiAnalysis ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: settings.aiAnalysis ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">Dark Mode</p>
                      <p className="text-sm text-slate-500">Switch to dark theme</p>
                    </div>
                    <div 
                      onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: settings.darkMode ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        alert('Logging out...');
                        setActiveTab('dashboard');
                      }}
                      className="w-full py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) }
        </AnimatePresence>

        {/* Add Metric Modal */}
        <AnimatePresence>
          {isAddingMetric && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingMetric(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
              >
                <h2 className="text-2xl font-bold mb-6">Log New Metric</h2>
                <form onSubmit={addMetric} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Metric Type</label>
                    <select name="type" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="Weight">Weight</option>
                      <option value="Sleep">Sleep Quality (1-10)</option>
                      <option value="Mood">Mood (1-10)</option>
                      <option value="Steps">Steps</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Value</label>
                    <input name="value" type="number" step="0.1" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Unit</label>
                    <input name="unit" type="text" placeholder="kg, hours, etc." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingMetric(false)}
                      className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      Save Metric
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
