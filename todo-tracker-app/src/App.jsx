import { useState, useEffect } from 'react';
import { BarChart3, Clock3, Target, Brain, CheckCircle2, Bell, BellOff, Trash2, Edit2 } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('todoTracker');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, time: '00:00 - 01:00', task: 'Deep Sleep', subject: 'Health', status: 'Done', priority: 'Low' },
      { id: 2, time: '01:00 - 02:00', task: 'Sleep Cycle', subject: 'Health', status: 'Done', priority: 'Low' },
      { id: 3, time: '06:00 - 07:00', task: 'Workout + Meditation', subject: 'Fitness', status: 'Pending', priority: 'High' },
      { id: 4, time: '08:00 - 09:00', task: 'Deep Work', subject: 'Study', status: 'In Progress', priority: 'High' },
    ];
  });

  const [newTask, setNewTask] = useState({
    time: '',
    task: '',
    subject: '',
    status: 'Pending',
    priority: 'Medium'
  });

  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);

  useEffect(() => {
    localStorage.setItem('todoTracker', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!alarmEnabled) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      
      const currentTask = tasks.find(t => {
        const [start] = t.time.split(' - ');
        if (!start) return false;
        const taskHour = parseInt(start.split(':')[0]);
        return taskHour === currentHour && t.status === 'Pending';
      });

      if (currentTask && now.getMinutes() === 0 && now.getSeconds() === 0) {
        alert(`🚨 Reminder: It's time for "${currentTask.task}" (${currentTask.subject})`);
        if (Notification.permission === 'granted') {
          new Notification('Task Reminder', {
            body: `Time for: ${currentTask.task}`,
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarmEnabled, tasks]);

  const toggleAlarm = () => {
    if (!alarmEnabled && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setAlarmEnabled(!alarmEnabled);
  };

  const addTask = () => {
    if (!newTask.time || !newTask.task || !newTask.subject) return;
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({ time: '', task: '', subject: '', status: 'Pending', priority: 'Medium' });
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedHour?.id === id) setSelectedHour(null);
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const completedCount = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length || 1;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const progress = [
    { label: 'Completed', value: Math.round((tasks.filter(t => t.status === 'Done').length / totalTasks) * 100) },
    { label: 'In Progress', value: Math.round((tasks.filter(t => t.status === 'In Progress').length / totalTasks) * 100) },
    { label: 'Pending', value: Math.round((tasks.filter(t => t.status === 'Pending').length / totalTasks) * 100) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-1000">

        {/* Header */}
        <div className="lg:col-span-3 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-600/50">
          <div>
            <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              🚀 Productivity Command Center
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Track every hour like a digital strategist ⚡</p>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleAlarm}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-lg ${
                alarmEnabled 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {alarmEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              {alarmEnabled ? 'Alarm Active' : 'Enable Alarm'}
            </button>
            <div className="text-right hidden md:block">
              <p className="text-slate-400 text-sm">Stay consistent</p>
              <p className="text-2xl font-bold text-white">🔥 Focus Mode</p>
            </div>
          </div>
        </div>

        {/* Timetable Section */}
        <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 flex flex-col h-[85vh]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Clock3 className="text-cyan-400" size={28}/> 
              24-Hour Tracker
            </h2>
          </div>

          {/* Add Task Form */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 mb-6 transition-all hover:border-slate-600/50">
            <h3 className="text-xl font-semibold mb-4 text-slate-200">➕ Customize Your Day</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Time (e.g. 11:00-12:00)"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                className="lg:col-span-1 p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Task Name"
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                className="lg:col-span-1 p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Subject"
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                className="lg:col-span-1 p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="lg:col-span-1 p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <button
                onClick={addTask}
                className="lg:col-span-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-4 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
              >
                Add
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 text-center shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-3xl font-bold text-white">{tasks.length}</h3>
              <p className="text-sm mt-1 text-slate-400">Total Tasks</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-3xl font-bold text-green-400">{completedCount}</h3>
              <p className="text-sm mt-1 text-green-400/80">Completed</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-3xl font-bold text-yellow-400">{tasks.filter(t=>t.status==='Pending').length}</h3>
              <p className="text-sm mt-1 text-yellow-400/80">Pending</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-3xl font-bold text-blue-400">{progressPercent}%</h3>
              <p className="text-sm mt-1 text-blue-400/80">Completion</p>
            </div>
          </div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {tasks.sort((a,b) => a.time.localeCompare(b.time)).map((item) => (
              <div
                key={item.id}
                className="group flex flex-col md:flex-row md:items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 hover:bg-slate-800 transition-all cursor-pointer hover:border-slate-500/50"
                onClick={() => setSelectedHour(item)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-cyan-400 font-mono bg-cyan-400/10 px-2 py-1 rounded">🕒 {item.time}</p>
                    <h3 className={`text-lg font-semibold ${item.status === 'Done' ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {item.task}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {item.subject}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0" onClick={e => e.stopPropagation()}>
                  <select 
                    value={item.status}
                    onChange={(e) => updateTaskStatus(item.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold outline-none appearance-none cursor-pointer transition-colors ${
                      item.status === 'Done' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      item.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>

                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      item.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 
                      item.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                      'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}
                  >
                    ⚡ {item.priority}
                  </span>

                  <button 
                    onClick={() => deleteTask(item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p>No tasks yet. Add one above to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress & Analytics */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 flex flex-col h-[85vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <BarChart3 className="text-cyan-400" /> Daily Analytics
          </h2>

          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-xl font-bold text-white relative z-10">🎯 Focus Meter</h3>
            <p className="text-slate-400 mt-2 text-sm relative z-10">Your completion rate for the day.</p>
            
            <div className="w-full bg-slate-900 rounded-full h-5 mt-5 overflow-hidden relative z-10 p-0.5 border border-slate-700">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-md animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 relative z-10">
              <p className="text-sm font-medium text-cyan-400">{progressPercent}% Achieved</p>
              {progressPercent >= 80 && <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full animate-bounce">On Fire! 🔥</span>}
            </div>
          </div>

          <div className="space-y-5 mb-8">
            <h3 className="text-lg font-semibold text-slate-200">Status Breakdown</h3>
            {progress.map((bar, index) => (
              <div key={index} className="group">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{bar.label}</span>
                  <span className="text-slate-400">{bar.value}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      bar.label === 'Completed' ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 
                      bar.label === 'In Progress' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 
                      'bg-gradient-to-r from-red-500 to-rose-400'
                    }`}
                    style={{ width: `${bar.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Target Section */}
          <div className="mt-auto bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors">
            <h3 className="font-semibold text-lg text-white flex items-center gap-2 mb-3">
              <Target className="text-cyan-400" size={20}/> Daily Goal
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Complete at least 80% tasks today and keep the momentum rolling like a neon train through midnight rain.
            </p>
          </div>
        </div>

        {/* Selected Hour Details Modal/Section - shown when clicking a task */}
        {selectedHour && (
          <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="text-cyan-400" size={28}/>
                <h2 className="text-2xl font-bold text-white">Task Insights</h2>
              </div>
              <button 
                onClick={() => setSelectedHour(null)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <p className="text-cyan-400 font-mono text-sm mb-2">{selectedHour.time}</p>
                <h3 className="text-2xl font-bold text-white">{selectedHour.task}</h3>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Subject</p>
                    <p className="font-semibold text-white">{selectedHour.subject}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Priority</p>
                    <p className={`font-semibold ${selectedHour.priority === 'High' ? 'text-orange-400' : 'text-blue-400'}`}>
                      {selectedHour.priority}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-green-400"/>
                  <h3 className="text-lg font-semibold text-white">Status</h3>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {['Pending', 'In Progress', 'Done'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateTaskStatus(selectedHour.id, status)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedHour.status === status 
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
