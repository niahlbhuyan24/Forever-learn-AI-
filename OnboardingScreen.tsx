
import React, { useState, useEffect } from 'react';
import { UserProfile, CBSEClass, Subject, Chapter } from '../types.ts';
import { CLASS_SUBJECTS_MAP, RAW_SYLLABUS } from '../constants.ts';

interface OnboardingScreenProps {
  user: UserProfile;
  onComplete: (profile: UserProfile, syllabus: Chapter[]) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [classLevel, setClassLevel] = useState<CBSEClass>(user.classLevel || CBSEClass.TENTH);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examDate, setExamDate] = useState('2025-03-01');
  const [studyHours, setStudyHours] = useState(3);

  const availableSubjects = CLASS_SUBJECTS_MAP[classLevel] || [];

  const handleToggleSubject = (sub: Subject) => {
    setSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const handleFinish = () => {
    const chapters: Chapter[] = subjects.map(sub => ({
      id: `ch-${classLevel}-${sub}`,
      subject: sub,
      title: `${sub} Foundation`,
      topics: (RAW_SYLLABUS[classLevel][sub] || []).map((t, i) => ({
        id: `topic-${sub}-${i}`,
        title: t,
        isCompleted: false,
        isUnlocked: i === 0
      }))
    }));

    onComplete({
      ...user,
      classLevel,
      subjects,
      examDate,
      dailyStudyHours: studyHours,
      onboarded: true
    }, chapters);
  };

  return (
    <div className="max-w-3xl mx-auto pt-10 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transition-all">
        <div className="bg-blue-600 p-10 text-white">
          <h2 className="text-4xl font-black tracking-tight">Setup Your Lab</h2>
          <p className="opacity-80 mt-2 font-medium">We'll build your custom study engine in minutes.</p>
          <div className="flex gap-3 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-white shadow-sm' : 'bg-blue-400 opacity-40'}`}></div>
            ))}
          </div>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold text-slate-800">Select Grade & Subjects</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.values(CBSEClass).map((c) => (
                  <button
                    key={c}
                    onClick={() => { setClassLevel(c); setSubjects([]); }}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                      classLevel === c ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    Class {c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {availableSubjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleToggleSubject(s)}
                    className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      subjects.includes(s) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold">{s}</span>
                    {subjects.includes(s) && (
                      <div className="bg-blue-600 rounded-full p-1"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <h3 className="text-2xl font-bold text-slate-800">Study Preferences</h3>
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-600 uppercase">Exam Target Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full p-5 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-600 uppercase">Daily Study Availability (Hours)</label>
                <div className="flex items-center gap-6">
                  <input
                    type="range" min="1" max="12" step="1"
                    value={studyHours}
                    onChange={e => setStudyHours(parseInt(e.target.value))}
                    className="flex-1 accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <span className="text-4xl font-black text-blue-600 w-12 text-center">{studyHours}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 animate-in zoom-in duration-500 py-6">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800">Ready to Launch!</h3>
                <p className="text-slate-500 font-medium">We've mapped {subjects.length} subjects to your timeline.</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-left">
                <p className="text-blue-800 font-bold mb-2">Summary:</p>
                <ul className="text-blue-700 text-sm space-y-1 font-medium">
                  <li>• Target: Class {classLevel} CBSE Exams</li>
                  <li>• Subjects: {subjects.join(', ')}</li>
                  <li>• Exam Date: {new Date(examDate).toDateString()}</li>
                  <li>• Effort: {studyHours} Hours/Day</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between gap-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-8 py-4 font-bold text-slate-500 hover:text-slate-800 transition-all">Back</button>
            )}
            <button
              onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
              disabled={step === 1 && subjects.length === 0}
              className="ml-auto px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-30 shadow-xl shadow-blue-200"
            >
              {step === 3 ? 'Generate My Plan' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
