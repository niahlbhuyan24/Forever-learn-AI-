
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile, DoubtRecord, Subject } from '../types.ts';
import { solveDoubt } from '../services/geminiService.ts';
import AcademicPaper from '../components/AcademicPaper.tsx';

interface DoubtSolverScreenProps {
  user: UserProfile;
  history: DoubtRecord[];
  onAddDoubt: (doubt: DoubtRecord) => void;
}

const DoubtSolverScreen: React.FC<DoubtSolverScreenProps> = ({ user, history, onAddDoubt }) => {
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState<Subject>((searchParams.get('subject') as Subject) || user.subjects[0] || Subject.PHYSICS);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<{question: string, answer: string, subject: Subject} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('All');

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchSearch = h.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubject = filterSubject === 'All' || h.subject === filterSubject;
      return matchSearch && matchSubject;
    });
  }, [history, searchTerm, filterSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setCurrentView(null);
    try {
      const answer = await solveDoubt(subject, question);
      const record: DoubtRecord = {
        id: Date.now().toString(),
        userId: user.uid,
        subject,
        question,
        answer,
        timestamp: new Date().toISOString()
      };
      onAddDoubt(record);
      setCurrentView({ question, answer, subject });
      setQuestion('');
    } catch (err) {
      alert("Failed to reach tutor. Check your connection!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">AI Doubt Solver</h1>
          <p className="text-slate-500 font-medium mt-1">Stuck on a problem? Ask your AI tutor for a structured breakdown.</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Resolved</div>
          <div className="text-2xl font-black text-indigo-600">{history.length}</div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-wrap gap-2">
            {user.subjects.map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubject(sub)}
                className={`px-6 py-2.5 rounded-full text-xs font-black transition-all border-2 ${
                  subject === sub ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={`Type your ${subject} doubt here... e.g. "Explain the mechanism of Breathing"`}
              rows={4}
              className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition-all text-slate-800 text-lg font-medium placeholder:text-slate-300"
            />
            <button
              disabled={loading || !question.trim()}
              className="absolute bottom-6 right-6 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-30 flex items-center gap-3 active:scale-95"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Tutor Analyzing...
                </>
              ) : 'Get Breakdown'}
            </button>
          </div>
        </form>
      </div>

      {currentView && (
        <div className="animate-in slide-in-from-bottom-6 duration-500">
          <div className="flex justify-between items-center mb-4 px-4">
             <h3 className="text-xl font-black text-slate-800">Resolved Solution</h3>
             <button onClick={() => setCurrentView(null)} className="text-slate-400 font-bold hover:text-slate-600">Close</button>
          </div>
          <AcademicPaper 
            title={currentView.question} 
            tag={currentView.subject} 
            subtitle="AI Tutor Breakdown" 
            content={currentView.answer} 
          />
        </div>
      )}

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-2xl font-black text-slate-800">Doubts Archive</h3>
          <div className="flex gap-2 flex-wrap">
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-5 py-2.5 rounded-xl border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="grid gap-4">
            {filteredHistory.map(record => (
              <div 
                key={record.id} 
                className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => {
                  setCurrentView({ question: record.question, answer: record.answer, subject: record.subject });
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-full">{record.subject}</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(record.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-slate-800 font-bold text-lg truncate block group-hover:text-blue-600 transition-colors">{record.question}</h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-400">Your curious mind is empty!</h4>
            <p className="text-slate-300 mt-2 font-medium">Solved doubts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtSolverScreen;
