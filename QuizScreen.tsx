
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserProfile, Subject, QuizQuestion, QuizResult } from '../types.ts';
import { RAW_SYLLABUS } from '../constants.ts';
import { generateQuiz } from '../services/geminiService.ts';

interface QuizScreenProps {
  user: UserProfile;
  onResult: (result: QuizResult) => void;
}

const QuizLoading: React.FC<{ topic: string }> = ({ topic }) => (
  <div className="flex flex-col items-center justify-center pt-20 space-y-10 max-w-lg mx-auto text-center px-4">
    <div className="relative">
      <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-300 animate-bounce">
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      </div>
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white border-4 border-white animate-pulse">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
      </div>
    </div>
    
    <div className="space-y-4">
      <h2 className="text-4xl font-black text-slate-800 tracking-tight">AI Lab is Synthesizing...</h2>
      <p className="text-xl text-slate-500 font-medium">Drafting 5 expert-level challenges for <br/><span className="text-blue-600 font-black">"{topic}"</span></p>
    </div>

    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative shadow-inner">
      <div className="absolute inset-0 bg-blue-600 animate-progress origin-left"></div>
    </div>
    
    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm animate-pulse uppercase tracking-widest">
      <span>Calibrating difficulty</span>
      <span className="flex gap-1"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></span>
    </div>

    <style>{`
      @keyframes progress {
        0% { transform: scaleX(0); }
        10% { transform: scaleX(0.1); }
        40% { transform: scaleX(0.4); }
        60% { transform: scaleX(0.7); }
        90% { transform: scaleX(0.9); }
        100% { transform: scaleX(1); }
      }
      .animate-progress {
        animation: progress 8s ease-out infinite;
      }
    `}</style>
  </div>
);

const QuizScreen: React.FC<QuizScreenProps> = ({ user, onResult }) => {
  const params = useParams<{ subject?: string; topic?: string }>();
  const [stage, setStage] = useState<'selection' | 'loading' | 'active'>('selection');
  const [subject, setSubject] = useState<Subject>((params.subject as Subject) || user.subjects[0] || Subject.PHYSICS);
  const [topic, setTopic] = useState(params.topic || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const startQuiz = useCallback(async (s: Subject = subject, t: string = topic) => {
    if (!t) return;
    setStage('loading');
    try {
      const qs = await generateQuiz(s, t, 5);
      if (qs.length === 0) throw new Error("No questions generated");
      setQuestions(qs);
      setUserAnswers(new Array(qs.length).fill(-1));
      setStage('active');
    } catch (err) {
      console.error(err);
      setStage('selection');
      alert("Failed to generate quiz. Please try again.");
    }
  }, [subject, topic]);

  useEffect(() => {
    if (params.subject && params.topic) {
      setSubject(params.subject as Subject);
      setTopic(params.topic);
      startQuiz(params.subject as Subject, params.topic);
    } else if (RAW_SYLLABUS[user.classLevel][subject] && !topic) {
      setTopic(RAW_SYLLABUS[user.classLevel][subject][0]);
    }
  }, [params.subject, params.topic, user.classLevel, subject, startQuiz]);

  const handleSelectOption = (index: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = index;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (q.correctAnswer === userAnswers[i]) score++;
    });

    const result: QuizResult = {
      id: Date.now().toString(),
      userId: user.uid,
      date: new Date().toISOString(),
      subject,
      topicTitle: topic,
      score,
      total: questions.length,
      questions,
      userAnswers
    };

    onResult(result);
    navigate(`/results/${result.id}`);
  };

  if (stage === 'selection') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Adaptive Challenge Lab</h1>
          <p className="text-slate-500 font-medium">Select a module to begin your AI-calibrated practice.</p>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Choose Subject</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {user.subjects.map(s => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-4 py-4 rounded-2xl text-xs font-black border-2 transition-all ${
                    subject === s ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-500 border-slate-50 hover:border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Target Topic</label>
            <select 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-blue-600 outline-none bg-slate-50 font-bold text-slate-700 appearance-none"
            >
              {RAW_SYLLABUS[user.classLevel][subject]?.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => startQuiz()}
            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 mt-4 active:scale-[0.98]"
          >
            Start Synthesis
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'loading') {
    return <QuizLoading topic={topic} />;
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-4">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{topic}</span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">Challenge {currentIndex + 1} of {questions.length}</h2>
        </div>
        <div className="w-40 bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-blue-600 h-full transition-all duration-700 ease-out" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 min-h-[450px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="space-y-10 relative z-10">
          <p className="text-2xl font-black text-slate-800 leading-tight">
            {currentQ.question}
          </p>

          <div className="grid gap-4">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-5 ${
                  userAnswers[currentIndex] === idx 
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-8 ring-blue-50/50 shadow-lg' 
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  userAnswers[currentIndex] === idx ? 'bg-blue-600 text-white' : 'bg-white text-slate-300 border border-slate-200'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-bold text-lg">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 font-black hover:text-slate-600 uppercase tracking-widest text-xs"
          >
            Abandon Test
          </button>
          <button
            onClick={nextQuestion}
            disabled={userAnswers[currentIndex] === -1}
            className="px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-30 shadow-2xl shadow-blue-200 active:scale-95"
          >
            {currentIndex === questions.length - 1 ? 'Finalize Result' : 'Next Challenge'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
