
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Subject, NoteRecord, NoteType } from '../types.ts';
import { generateShortNotes } from '../services/geminiService.ts';
import AcademicPaper from '../components/AcademicPaper.tsx';

interface ShortNotesScreenProps {
  user: UserProfile;
  notes: NoteRecord[];
  onAddNote: (note: NoteRecord) => void;
  onDeleteNote: (id: string) => void;
}

const ShortNotesScreen: React.FC<ShortNotesScreenProps> = ({ user, notes, onAddNote, onDeleteNote }) => {
  const [chapter, setChapter] = useState('');
  const [subject, setSubject] = useState<Subject>(user.subjects[0] || Subject.PHYSICS);
  const [noteType, setNoteType] = useState<NoteType>(NoteType.SUMMARY);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [currentView, setCurrentView] = useState<{title: string, content: string, type: NoteType, subject: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const statusMessages = [
    "Contacting AI Academic Cloud...",
    "Retrieving NCERT Guidelines...",
    "Synthesizing Expert Keypoints...",
    "Drafting Detailed Explanations...",
    "Optimizing Structural Layout...",
    "Finalizing Document Formatting..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let idx = 0;
      setLoadingStatus(statusMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % statusMessages.length;
        setLoadingStatus(statusMessages[idx]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter.trim()) return;
    setLoading(true);
    setCurrentView(null);
    try {
      const content = await generateShortNotes(subject, chapter, noteType);
      const newNote: NoteRecord = {
        id: Date.now().toString(),
        userId: user.uid,
        subject,
        chapterTitle: chapter,
        content,
        type: noteType,
        timestamp: new Date().toISOString()
      };
      onAddNote(newNote);
      setCurrentView({ title: chapter, content, type: noteType, subject });
      setChapter('');
    } catch (err) {
      alert("Something went wrong during generation. Check your connection!");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Full notes copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 px-4">
      <header className="text-center space-y-2">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Mastery Document Lab</h1>
        <p className="text-slate-500 font-medium text-lg">Generate high-fidelity notes for your board preparation.</p>
      </header>

      {/* Advanced Generator Panel */}
      <section className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -ml-32 -mb-32 opacity-50"></div>

        <form onSubmit={handleGenerate} className="relative z-10 space-y-10">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Target Subject</label>
                <div className="flex flex-wrap gap-2">
                  {user.subjects.map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubject(sub)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                        subject === sub ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Note Modality</label>
                <div className="grid grid-cols-2 gap-4">
                  {[NoteType.SUMMARY, NoteType.DETAILED].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNoteType(type)}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                        noteType === type ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${noteType === type ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {type === NoteType.SUMMARY ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        )}
                      </div>
                      <span className="font-black text-sm text-slate-800">{type} Notes</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Chapter Identity</label>
                <input 
                  type="text"
                  value={chapter}
                  onChange={e => setChapter(e.target.value)}
                  placeholder="e.g. Chemical Bonding, Newton's Laws..."
                  className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 text-xl font-bold placeholder:text-slate-200"
                />
              </div>
              
              <button
                disabled={loading || !chapter.trim()}
                className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-30 active:scale-95 flex items-center justify-center gap-4"
              >
                {loading ? (
                  <>
                     <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span>{loadingStatus}</span>
                  </>
                ) : 'Synthesize Notes'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Interactive Page Result */}
      {currentView && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-between items-center max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-black text-slate-800">Generated Research Paper</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => copyToClipboard(currentView.content)}
                className="px-6 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm"
              >
                Copy Content
              </button>
              <button 
                onClick={() => setCurrentView(null)}
                className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all text-sm"
              >
                Close View
              </button>
            </div>
          </div>
          <AcademicPaper 
            title={currentView.title} 
            tag={currentView.subject} 
            subtitle={`${currentView.type} Edition • Revision Ready`} 
            content={currentView.content} 
          />
        </div>
      )}

      {/* History Archive */}
      <section className="space-y-8" id="preview-anchor">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your Personal Archive</h3>
          <div className="relative group w-full md:w-80">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search chapters..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 text-sm focus:ring-4 focus:ring-indigo-100 outline-none bg-white transition-all font-medium"
            />
          </div>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div key={note.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 group hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-2 h-full ${note.type === NoteType.DETAILED ? 'bg-indigo-600' : 'bg-blue-400'}`}></div>
                
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full">{note.subject}</span>
                    <button 
                      onClick={() => onDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-500 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{note.chapterTitle}</h4>
                  <div className="flex items-center gap-2 mt-4">
                     <div className={`w-2 h-2 rounded-full ${note.type === NoteType.DETAILED ? 'bg-indigo-600' : 'bg-blue-400'}`}></div>
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{note.type} • {new Date(note.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setCurrentView({ title: note.chapterTitle, content: note.content, type: note.type, subject: note.subject });
                    document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-4 bg-slate-50 text-indigo-600 font-black rounded-2xl text-sm hover:bg-indigo-600 hover:text-white transition-all border border-indigo-50"
                >
                  Read Document
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mx-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h4 className="text-2xl font-bold text-slate-400">Archive is empty!</h4>
            <p className="text-slate-300 mt-2 font-medium">Your personalized study materials will be stored here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShortNotesScreen;
