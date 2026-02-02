
import React, { useState, useEffect } from 'react';
import { StudySession, UserProfile, Subject } from '../types.ts';
import { useNavigate } from 'react-router-dom';

interface StudyPlanScreenProps {
  tasks: StudySession[];
  user: UserProfile;
  onUpdateSession: (session: StudySession) => void;
  onAddSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
  onRecalculate: () => void;
  onUpdateProfile: (user: UserProfile) => void;
}

const SkeletonPlan: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-pulse px-4">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2 flex-1">
        <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
    <div className="space-y-12 pt-10">
      {[1, 2].map(i => (
        <div key={i} className="relative pl-10 border-l-4 border-slate-100">
          <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-slate-100 border-4 border-white"></div>
          <div className="h-8 w-48 bg-slate-100 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-slate-50 rounded-[2rem] border border-slate-100"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StudyPlanScreen: React.FC<StudyPlanScreenProps> = ({ 
  tasks, 
  user,
  onUpdateSession, 
  onAddSession, 
  onDeleteSession, 
  onRecalculate,
  onUpdateProfile
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [tempHours, setTempHours] = useState(user.dailyStudyHours);
  const navigate = useNavigate();

  // Form states for new/edit
  const [formDate, setFormDate] = useState('');
  const [formSubject, setFormSubject] = useState<Subject>(Subject.PHYSICS);
  const [formTitle, setFormTitle] = useState('');
  const [formDuration, setFormDuration] = useState(60);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const groupedTasks: Record<string, StudySession[]> = {};
  tasks.forEach(t => {
    if (!groupedTasks[t.date]) groupedTasks[t.date] = [];
    groupedTasks[t.date].push(t);
  });

  const dates = Object.keys(groupedTasks).sort();
  const today = new Date().toISOString().split('T')[0];

  const handleOpenEdit = (session: StudySession) => {
    setEditingSession(session);
    setFormDate(session.date);
    setFormSubject(session.subject);
    setFormTitle(session.topicTitle);
    setFormDuration(session.durationMinutes);
  };

  const handleOpenAdd = () => {
    setIsAddingTask(true);
    setFormDate(today);
    setFormSubject(user.subjects[0] || Subject.PHYSICS);
    setFormTitle('');
    setFormDuration(60);
  };

  const handleSave = () => {
    if (editingSession) {
      onUpdateSession({
        ...editingSession,
        date: formDate,
        subject: formSubject,
        topicTitle: formTitle,
        durationMinutes: formDuration
      });
      setEditingSession(null);
    } else {
      onAddSession({
        id: `custom-${Date.now()}`,
        date: formDate,
        subject: formSubject,
        topicTitle: formTitle,
        durationMinutes: formDuration,
        status: 'planned'
      });
      setIsAddingTask(false);
    }
  };

  const toggleComplete = (session: StudySession) => {
    onUpdateSession({
      ...session,
      status: session.status === 'completed' ? 'planned' : 'completed'
    });
  };

  const updateDailyHours = () => {
    onUpdateProfile({ ...user, dailyStudyHours: tempHours });
    onRecalculate();
  };

  if (isLoading) return <SkeletonPlan />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Your Study Roadmap</h1>
          <p className="text-slate-500 font-medium">Customize your daily missions according to your pace.</p>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
              <span>Target Focus</span>
              <span>{tempHours} hrs/day</span>
            </div>
            <input 
              type="range" min="1" max="12" step="1"
              value={tempHours}
              onChange={(e) => setTempHours(parseInt(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <button 
              onClick={updateDailyHours}
              className="w-full py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              Update & Recalculate
            </button>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-white text-slate-700 font-black rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            Add Custom Task
          </button>
        </div>
      </header>

      <div className="space-y-12 pt-4">
        {dates.length > 0 ? dates.map(date => {
          const isToday = date === today;
          const isPast = date < today;
          const displayDate = new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', month: 'short', day: 'numeric' 
          });

          return (
            <div key={date} className={`relative pl-10 border-l-4 ${isToday ? 'border-blue-600' : isPast ? 'border-slate-200' : 'border-slate-100'}`}>
              <div className={`absolute -left-[14px] top-0 w-6 h-6 rounded-full border-4 border-white ${isToday ? 'bg-blue-600 shadow-xl shadow-blue-200 scale-125' : isPast ? 'bg-slate-300' : 'bg-slate-100'} transition-all`}></div>
              
              <div className="flex items-center gap-4 mb-6">
                <h3 className={`text-2xl font-black ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                  {isToday ? `Today's Mission` : displayDate}
                </h3>
              </div>

              <div className="grid gap-4">
                {groupedTasks[date].map(session => (
                  <div 
                    key={session.id}
                    className={`p-6 rounded-[2rem] border-2 flex items-center gap-5 transition-all group ${
                      session.status === 'completed' 
                        ? 'bg-green-50 border-green-100' 
                        : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50'
                    }`}
                  >
                    <button 
                      onClick={() => toggleComplete(session)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                        session.status === 'completed' ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500'
                      }`}
                    >
                      {session.status === 'completed' ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      )}
                    </button>
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/quiz/${session.subject}/${session.topicTitle}`)}>
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{session.subject}</div>
                      <div className={`font-black text-xl tracking-tight ${session.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {session.topicTitle}
                      </div>
                      <div className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{session.durationMinutes} Minutes • Class Topic</div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleOpenEdit(session)}
                         className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-200 uppercase tracking-wider"
                       >
                         Edit
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
             <p className="text-slate-400 font-bold">Your roadmap is currently empty.</p>
             <button onClick={onRecalculate} className="mt-4 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200">Regenerate Roadmap</button>
          </div>
        )}
      </div>

      {(editingSession || isAddingTask) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-8 text-white">
              <h3 className="text-2xl font-black">{isAddingTask ? 'Add New Study Task' : 'Modify Study Session'}</h3>
              <p className="opacity-70 font-medium">Plan your time effectively for better retention.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Date</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Subject</label>
                  <select 
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value as Subject)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700"
                  >
                    {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Topic Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Revision of Thermodynamics"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 px-1">
                  <span>Session Duration</span>
                  <span>{formDuration} Minutes</span>
                </div>
                <input 
                  type="range" min="15" max="240" step="15"
                  value={formDuration}
                  onChange={e => setFormDuration(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setEditingSession(null); setIsAddingTask(false); }}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                {editingSession && (
                   <button 
                     onClick={() => { onDeleteSession(editingSession.id); setEditingSession(null); }}
                     className="py-4 px-6 bg-red-50 text-red-500 font-black rounded-2xl hover:bg-red-100 transition-all"
                   >
                     Delete
                   </button>
                )}
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  {isAddingTask ? 'Create Task' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanScreen;
