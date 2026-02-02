
import React, { useMemo, useState, useEffect } from 'react';
import { AppState } from '../types.ts';
import { Link, useNavigate } from 'react-router-dom';
import { MOTIVATIONAL_QUOTES } from '../constants.ts';

const SkeletonDashboard: React.FC = () => (
  <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-pulse">
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1 space-y-4 w-full">
        <div className="h-6 w-32 bg-slate-100 rounded-full"></div>
        <div className="h-12 w-3/4 bg-slate-200 rounded-2xl"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded-lg"></div>
        <div className="flex gap-4 pt-4">
          <div className="h-14 w-40 bg-slate-200 rounded-2xl"></div>
          <div className="h-14 w-40 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 w-32 md:w-40 bg-slate-100 rounded-[2rem]"></div>
        ))}
      </div>
    </div>
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 h-48"></div>
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-slate-100 rounded-[2rem]"></div>
        ))}
      </div>
      <div className="h-96 bg-slate-200 rounded-[2rem]"></div>
    </div>
  </div>
);

const DashboardScreen: React.FC<{ state: AppState }> = ({ state }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, doubts, quizHistory, sessions, syllabus } = state;
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todaysSessions = sessions.filter(s => s.date === todayStr);
  
  const totalTopics = syllabus.reduce((acc, ch) => acc + ch.topics.length, 0);
  const completedTopics = syllabus.reduce((acc, ch) => acc + ch.topics.filter(t => t.isCompleted).length, 0);
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const countdown = useMemo(() => {
    if (!user?.examDate) return null;
    const examDate = new Date(user.examDate);
    const timeDiff = examDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return {
      days: daysDiff > 0 ? daysDiff : 0,
      isExpired: daysDiff < 0,
      isToday: daysDiff === 0,
      isUrgent: daysDiff > 0 && daysDiff <= 30
    };
  }, [user?.examDate, today]);

  const quote = useMemo(() => {
    const q = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    return q.replace('{class}', user?.classLevel || '10');
  }, [user]);

  const heatmapData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const quizzesOnDay = quizHistory.filter(q => q.date.split('T')[0] === date).length;
      const doubtsOnDay = doubts.filter(d => d.timestamp.split('T')[0] === date).length;
      const totalActivity = quizzesOnDay + doubtsOnDay;
      
      return {
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        count: totalActivity,
        intensity: totalActivity === 0 ? 0 : totalActivity === 1 ? 1 : totalActivity <= 3 ? 2 : 3
      };
    });
  }, [quizHistory, doubts]);

  if (isLoading) return <SkeletonDashboard />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-black uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Active Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">
            Rise and Shine, <span className="text-blue-600">{user?.name}</span>!
          </h1>
          <p className="text-lg text-slate-500 font-medium italic">"{quote}"</p>
          <div className="flex gap-4 pt-4">
            <Link to="/study-plan" className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
              View Schedule
            </Link>
            <Link to="/doubt-solver" className="px-8 py-4 bg-white text-slate-700 font-black rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all">
              Solve Doubts
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          {countdown && (
            <div className={`p-6 rounded-[2rem] border border-transparent transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group col-span-2 sm:col-span-1 ${
              countdown.isUrgent ? 'bg-orange-50 text-orange-600' : 
              countdown.isExpired ? 'bg-slate-50 text-slate-500' : 
              'bg-blue-600 text-white shadow-xl shadow-blue-100'
            }`}>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${!countdown.isUrgent && !countdown.isExpired ? 'text-blue-100' : 'opacity-70'}`}>
                {countdown.isExpired ? 'Exam Passed' : 'Days Until Exam'}
              </div>
              <div className="text-3xl font-black">
                {countdown.isToday ? 'D-Day!' : countdown.isExpired ? 'Done' : countdown.days}
              </div>
              {!countdown.isExpired && (
                <svg className="absolute -bottom-4 -right-4 w-20 h-20 opacity-20 group-hover:scale-125 transition-transform" viewBox="0 0 36 36">
                  <path className="stroke-current" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              )}
            </div>
          )}
          <StatCard label="Streak" value={`${user?.streak || 0} Days`} color="orange" />
          <StatCard label="Accuracy" value="84%" color="green" />
          <StatCard label="Completed" value={`${progressPercent}%`} color="blue" />
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Learning Consistency</h2>
            <p className="text-sm text-slate-500 font-medium">Your activity (quizzes + doubts) over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-200"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
            </div>
            <span>More</span>
          </div>
        </div>
        
        <div className="flex justify-between md:justify-start md:gap-8 overflow-x-auto pb-2">
          {heatmapData.map((item) => {
            const colors = [
              'bg-slate-100',
              'bg-blue-200',
              'bg-blue-400',
              'bg-blue-600',
            ];
            return (
              <div key={item.date} className="flex flex-col items-center gap-2 min-w-[3rem]">
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${colors[item.intensity]} transition-all hover:scale-110 cursor-help relative group shadow-sm`}
                  title={`${item.count} activities on ${item.date}`}
                >
                  {item.count > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {item.count} activities
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${item.date === todayStr ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800">Target Chapters</h2>
            <span className="text-sm font-bold text-slate-400">{completedTopics} of {totalTopics} topics finished</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {syllabus.map(ch => (
              <ChapterProgressCard key={ch.id} chapter={ch} onAction={(topic) => navigate(`/quiz/${ch.subject}/${topic}`)} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800">Today's Missions</h2>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            {todaysSessions.length > 0 ? todaysSessions.map(session => (
              <div key={session.id} className="p-4 rounded-2xl border border-slate-50 hover:border-blue-100 bg-slate-50 transition-all flex items-center justify-between group">
                <div>
                  <div className="text-[10px] font-black uppercase text-blue-600 tracking-tighter">{session.subject}</div>
                  <div className="font-bold text-slate-800">{session.topicTitle}</div>
                  <div className="text-xs text-slate-400 font-medium">{session.durationMinutes} min session</div>
                </div>
                <button 
                  onClick={() => navigate(`/quiz/${session.subject}/${session.topicTitle}`)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium">No sessions scheduled for today!</p>
                <Link to="/study-plan" className="text-blue-600 font-bold text-sm mt-2 block">Generate New Schedule</Link>
              </div>
            )}
          </div>
          
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Need a Hint?</h3>
              <p className="text-sm text-indigo-100 font-medium mb-6">Our AI tutor has solved {doubts.length} of your doubts so far.</p>
              <Link to="/doubt-solver" className="px-6 py-3 bg-white text-indigo-600 font-black rounded-xl text-sm block text-center hover:bg-indigo-50 transition-all">
                Ask a Doubt
              </Link>
            </div>
            <svg className="absolute -bottom-10 -right-10 w-40 h-40 text-indigo-500 opacity-20 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.243 14.243a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6.464 16.464a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707z"></path></svg>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, color: string }> = ({ label, value, color }) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className={`${colors[color]} p-6 rounded-[2rem] border border-transparent hover:border-current/10 transition-all flex flex-col items-center justify-center text-center`}>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
};

const ChapterProgressCard: React.FC<{ chapter: any, onAction: (topic: string) => void }> = ({ chapter, onAction }) => {
  const currentTopic = chapter.topics.find((t: any) => !t.isCompleted && t.isUnlocked) || chapter.topics[0];
  const completedCount = chapter.topics.filter((t: any) => t.isCompleted).length;
  const progress = Math.round((completedCount / chapter.topics.length) * 100);

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">{chapter.subject}</span>
          <span className="text-xs font-bold text-slate-400">{progress}%</span>
        </div>
        <h3 className="font-black text-slate-800 text-lg mb-1 truncate">{chapter.title}</h3>
        <p className="text-xs text-slate-400 font-medium mb-4">Target: {currentTopic.title}</p>
        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden mb-6">
          <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <button 
        onClick={() => onAction(currentTopic.title)}
        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
        {progress === 100 ? 'Revise Module' : 'Practice Topic'}
      </button>
    </div>
  );
};

export default DashboardScreen;
