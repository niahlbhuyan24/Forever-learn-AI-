
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackScreen: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Thank You!</h2>
        <p className="text-slate-500 mt-2 max-w-sm">Your feedback helps us make Forever Learn AI better for every student.</p>
        <p className="text-blue-600 font-semibold mt-8 animate-pulse">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">How's your experience?</h2>
          <p className="opacity-80 mt-2">We'd love to hear your thoughts on how we can improve.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-4 text-center">
            <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider">Overall Rating</label>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all hover:scale-125 ${star <= rating ? 'text-yellow-400 grayscale-0' : 'text-slate-200 grayscale'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 uppercase">Tell us more</label>
            <textarea
              required
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What do you like? What can we do better?"
              rows={5}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0 || !comment.trim()}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackScreen;
