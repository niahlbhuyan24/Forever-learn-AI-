
import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { QuizResult } from '../types.ts';
import { MOTIVATIONAL_QUOTES } from '../constants.ts';

interface ResultsScreenProps {
  history: QuizResult[];
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ history }) => {
  const { id } = useParams<{ id: string }>();
  const result = history.find(r => r.id === id);

  const quote = useMemo(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], 
  []);

  if (!result) return <Navigate to="/dashboard" />;

  const percentage = Math.round((result.score / result.total) * 100);
  const isPass = percentage >= 50;
  
  const getMessage = () => {
    if (percentage >= 80) return { title: "Brilliant!", color: "text-green-600", bg: "bg-green-50" };
    if (percentage >= 50) return { title: "Good Progress!", color: "text-blue-600", bg: "bg-blue-50" };
    return { title: "Try Again!", color: "text-orange-600", bg: "bg-orange-50" };
  };

  const message = getMessage();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className={`${message.bg} p-10 rounded-3xl text-center border border-slate-100 shadow-sm`}>
        <h1 className={`text-4xl font-black ${message.color}`}>{message.title}</h1>
        <p className="text-slate-600 mt-2 font-medium">You scored {result.score} out of {result.total} in {result.topicTitle}</p>
        
        <div className="mt-8 flex justify-center">
          <div className="relative w-40 h-40">
             <svg className="w-full h-full" viewBox="0 0 36 36">
               <path className="text-slate-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               <path className={`${isPass ? 'text-green-500' : 'text-orange-500'}`} strokeWidth="3" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-bold text-slate-800">{percentage}%</span>
               <span className="text-xs font-bold text-slate-400 uppercase">{isPass ? 'Unlocked' : 'Locked'}</span>
             </div>
          </div>
        </div>

        <p className="mt-8 text-slate-500 italic max-w-md mx-auto">"{quote}"</p>

        <div className="mt-10 flex gap-4 justify-center">
          {isPass ? (
            <Link to="/dashboard" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Next Topic →
            </Link>
          ) : (
            <Link to={`/quiz/${result.subject}/${result.topicTitle}`} className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
              Retry Quiz
            </Link>
          )}
          <Link to="/dashboard" className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Quiz Review</h2>
        <div className="space-y-6">
          {result.questions.map((q, i) => {
            const isCorrect = result.userAnswers[i] === q.correctAnswer;
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="font-semibold text-slate-800 text-lg leading-snug">{q.question}</p>
                    
                    <div className="grid md:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => {
                        let style = "bg-slate-50 border-slate-100 text-slate-500";
                        if (idx === q.correctAnswer) style = "bg-green-50 border-green-200 text-green-700 font-semibold ring-1 ring-green-100";
                        if (idx === result.userAnswers[i] && !isCorrect) style = "bg-red-50 border-red-200 text-red-700 font-semibold ring-1 ring-red-100";
                        
                        return (
                          <div key={idx} className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${style}`}>
                            <span className="opacity-50 font-bold">({String.fromCharCode(65 + idx)})</span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>

                    {!isCorrect && (
                      <div className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100">
                        <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Concept Note</h5>
                        <p className="text-sm text-slate-700 leading-relaxed italic">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
