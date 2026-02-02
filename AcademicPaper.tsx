
import React from 'react';

interface AcademicPaperProps {
  title: string;
  subtitle?: string;
  content: string;
  tag?: string;
}

const AcademicPaper: React.FC<AcademicPaperProps> = ({ title, subtitle, content, tag }) => {
  const lines = content.split('\n');

  const parseLine = (line: string) => {
    // Replace markdown bold **text** with <strong> tags
    return line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-extrabold">$1</strong>');
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden max-w-4xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Paper Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-10 md:px-12 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          {tag && (
            <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-1">
              {tag}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-slate-500 font-bold text-sm uppercase tracking-tight">{subtitle}</p>}
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
            Forever Learn AI<br />Academic Document<br />Ref: #{Math.random().toString(36).substr(2, 6).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative p-8 md:p-16 bg-white min-h-[400px]">
        {/* Subtle Paper Texture/Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Margin Line */}
        <div className="absolute left-10 md:left-14 top-0 bottom-0 w-[2px] bg-red-100 hidden sm:block opacity-50"></div>

        <div className="relative z-10 sm:pl-10 space-y-6">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-4"></div>;

            // Headings
            if (trimmed.startsWith('# ')) {
              return (
                <h3 key={idx} className="text-2xl md:text-3xl font-black text-slate-900 border-b-2 border-slate-100 pb-3 mb-6 pt-4">
                  {trimmed.replace('# ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h4 key={idx} className="text-xl md:text-2xl font-black text-indigo-700 pt-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full inline-block"></span>
                  {trimmed.replace('## ', '')}
                </h4>
              );
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h5 key={idx} className="text-lg md:text-xl font-bold text-slate-800 pt-4 underline decoration-indigo-200 decoration-4 underline-offset-4">
                  {trimmed.replace('### ', '')}
                </h5>
              );
            }

            // Lists
            const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
            const isNumbered = /^\d+\.\s/.test(trimmed);

            if (isBullet || isNumbered) {
              const content = trimmed.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '');
              return (
                <div key={idx} className={`flex items-start gap-4 ${isBullet ? 'pl-4' : 'pl-0'}`}>
                  {isBullet ? (
                    <div className="mt-2.5 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  ) : (
                    <span className="font-black text-indigo-600 min-w-[1.5rem]">{trimmed.match(/^\d+/)?.[0]}.</span>
                  )}
                  <p className="text-slate-700 text-lg leading-relaxed font-medium font-serif" 
                     dangerouslySetInnerHTML={{ __html: parseLine(content) }} />
                </div>
              );
            }

            // Solved Example Block
            if (trimmed.toLowerCase().startsWith('example:')) {
              return (
                <div key={idx} className="my-6 p-6 bg-slate-50 rounded-2xl border-l-8 border-indigo-600 italic">
                  <p className="text-slate-800 text-lg leading-relaxed font-serif" 
                     dangerouslySetInnerHTML={{ __html: parseLine(trimmed) }} />
                </div>
              );
            }

            // Standard Paragraph
            return (
              <p key={idx} 
                 className="text-slate-700 text-lg leading-relaxed font-medium font-serif"
                 dangerouslySetInnerHTML={{ __html: parseLine(trimmed) }} />
            );
          })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Verified Science Content</span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page 01 • Forever Learn Lab</p>
      </div>
    </div>
  );
};

export default AcademicPaper;
