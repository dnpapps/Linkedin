
import React, { useState, useRef } from 'react';
import { extractProfileDataFromImage, extractProfileDataFromUrl } from './services/geminiService';
import { ExtractedData, ExtractionStatus } from './types';
import DataCard from './components/DataCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<ExtractionStatus>(ExtractionStatus.IDLE);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setData(null);
    setError(null);
    setPreviewUrl(null);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl.trim()) return;
    
    resetState();
    setStatus(ExtractionStatus.ANALYZING);

    try {
      const result = await extractProfileDataFromUrl(linkedinUrl);
      setData(result);
      setStatus(ExtractionStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Dipak's Model could not retrieve accurate details from this specific URL.");
      setStatus(ExtractionStatus.ERROR);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resetState();
    setStatus(ExtractionStatus.UPLOADING);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewUrl(base64);
      
      try {
        setStatus(ExtractionStatus.ANALYZING);
        const result = await extractProfileDataFromImage(base64);
        setData(result);
        setStatus(ExtractionStatus.SUCCESS);
      } catch (err) {
        console.error(err);
        setError("Analysis failed. Dipak's Model encountered an error analyzing the screenshot.");
        setStatus(ExtractionStatus.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-16 px-4 sm:px-10 font-sans transition-all duration-500">
      <header className="max-w-4xl w-full text-center mb-16">
        <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-3xl mb-6 text-white shadow-xl shadow-blue-200">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h1 className="text-5xl font-black text-slate-950 tracking-tight sm:text-6xl mb-6">
          LinkedIn <span className="text-blue-600">Intelligence</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Automated extraction with high-fidelity accuracy powered by <strong>Dipak's Model</strong>.
        </p>
      </header>

      <main className="max-w-7xl w-full space-y-12">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10 max-w-4xl mx-auto">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Direct Profile Link
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-blue-500">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
                </div>
                <input 
                  type="url" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/..."
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-bold placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
              <button 
                type="submit"
                disabled={status === ExtractionStatus.ANALYZING || !linkedinUrl}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black rounded-[1.5rem] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 min-w-[200px] active:scale-95"
              >
                {status === ExtractionStatus.ANALYZING && !previewUrl ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Extract Data'}
              </button>
            </div>
          </form>

          <div className="relative py-2 flex items-center">
            <div className="flex-grow border-t-2 border-slate-50"></div>
            <span className="flex-shrink mx-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Alternative</span>
            <div className="flex-grow border-t-2 border-slate-50"></div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer border-2 border-dashed border-slate-200 rounded-[2rem] p-10 hover:bg-blue-50 hover:border-blue-400 transition-all flex flex-col items-center text-center gap-4"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 shadow-lg shadow-blue-200 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">Upload Screenshot</p>
              <p className="text-sm text-slate-400 font-medium mt-1 italic">Vision scan by Dipak's Model</p>
            </div>
          </div>
        </div>

        {status === ExtractionStatus.ANALYZING && (
          <div className="flex flex-col items-center gap-6 py-16 animate-pulse">
            <div className="w-20 h-20 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-blue-600 font-black text-2xl">Dipak's Model Analyzing</p>
              <p className="text-slate-400 font-bold mt-2">Deep searching public records for contact data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[2rem] flex items-start gap-5 animate-in slide-in-from-top-4 max-w-4xl mx-auto shadow-sm">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <p className="text-rose-950 font-black text-lg">Extraction Failed</p>
              <p className="text-rose-700 mt-1 font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 ${previewUrl ? 'lg:grid-cols-12' : 'max-w-5xl mx-auto'} gap-12 items-start`}>
          {previewUrl && (
            <div className="lg:col-span-5 space-y-6 animate-in fade-in duration-1000 sticky top-10">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Source Input</h3>
                 <button onClick={() => setPreviewUrl(null)} className="text-xs font-bold text-rose-500 hover:underline">Remove</button>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain bg-slate-100" />
              </div>
            </div>
          )}

          <div className={`${previewUrl ? 'lg:col-span-7' : 'w-full'} transition-all duration-700`}>
            {data && <DataCard data={data} />}
          </div>
        </div>
      </main>

      <footer className="mt-24 text-slate-400 text-sm pb-16 flex flex-col items-center gap-6">
        <div className="h-px w-32 bg-slate-200"></div>
        <div className="text-center space-y-2">
          <p className="font-bold text-slate-600 tracking-wide">&copy; {new Date().getFullYear()} LinkedIn Intelligence Suite</p>
          <p className="text-xs uppercase tracking-[0.2em] font-black">Dipak's Model Infrastructure</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
