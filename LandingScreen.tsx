
import React from 'react';
import { Link } from 'react-router-dom';

const LandingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl py-20 px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Master CBSE Science with <span className="text-blue-600 underline decoration-blue-200">Forever Learn AI</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl">
            The personalized study assistant for Class 9-12 students. Get daily plans, instant doubt clearing, and smart adaptive quizzes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link to="/auth" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-center">
              Start Learning Free
            </Link>
            <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-center">
              Watch Demo
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 justify-center md:justify-start">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Adaptive Learning
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Expert AI Tutoring
            </span>
          </div>
        </div>
        <div className="flex-1 w-full max-w-lg">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
            <img 
              src="https://picsum.photos/seed/learn/600/500" 
              alt="Student studying" 
              className="rounded-3xl shadow-2xl relative z-10 border-8 border-white"
            />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-white w-full py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Designed for the Indian Student</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Personalized Plans" 
              desc="Daily study schedules tailored to your CBSE board exams and target score." 
              icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
            <FeatureCard 
              title="AI Doubt Solver" 
              desc="Stuck on a Physics problem? Get step-by-step explanations in seconds." 
              icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
            <FeatureCard 
              title="Smart Quizzes" 
              desc="Topic-wise MCQs with instant feedback to help you master weak areas." 
              icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string, desc: string, icon: string }> = ({ title, desc, icon }) => (
  <div className="p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all bg-slate-50">
    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default LandingScreen;
