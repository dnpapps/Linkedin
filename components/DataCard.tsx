
import React from 'react';
import { ExtractedData } from '../types';

interface DataCardProps {
  data: ExtractedData;
}

interface DataRowProps {
  label: string;
  value: string | null;
  icon: string;
  isCopyable?: boolean;
  isPrimary?: boolean;
}

const DataCard: React.FC<DataCardProps> = ({ data }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-emerald-500';
    if (score >= 0.7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const DataRow: React.FC<DataRowProps> = ({ label, value, icon, isCopyable, isPrimary }) => (
    <div className="group flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between ml-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
        {isPrimary && value && (
          <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Primary Contact</span>
        )}
      </div>
      <div className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${value ? (isPrimary ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-white border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md') : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <span className={`text-slate-800 font-bold truncate ${!value ? 'italic font-normal' : ''}`}>
            {value || 'Not found'}
          </span>
        </div>
        {isCopyable && value && (
          <button 
            onClick={() => copyToClipboard(value)}
            className="flex-shrink-0 p-2 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-slate-400 active:scale-90"
            title="Copy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        )}
      </div>
    </div>
  );

  const primaryPhone = data.phoneNumbers && data.phoneNumbers.length > 0 ? data.phoneNumbers[0] : null;

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 blur-[80px] -ml-24 -mb-24"></div>
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Extraction</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(data.confidenceScore)} shadow-[0_0_8px] shadow-current`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {Math.round(data.confidenceScore * 100)}% Accuracy
                </span>
              </div>
            </div>
            <h3 className="text-4xl font-black tracking-tight">
              Dipak's Model <span className="text-blue-500">Insights</span>
            </h3>
          </div>
          {data.linkedinUrl && (
            <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all flex items-center gap-2 text-sm font-bold group">
              Public Profile
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          )}
        </div>
      </div>
      
      <div className="p-10 flex flex-col gap-10">
        <section>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
            Primary Identity & Direct Line
            <div className="h-px bg-slate-100 flex-grow"></div>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataRow label="Full Name" value={data.fullName} icon="👤" isCopyable />
            <DataRow 
              label={`${data.fullName?.split(' ')[0] || 'Person'}'s Direct Number`} 
              value={primaryPhone} 
              icon="📱" 
              isCopyable 
              isPrimary 
            />
            <DataRow label="Current Role" value={data.jobTitle} icon="💼" />
            <DataRow label="Organization" value={data.company} icon="🏢" />
            <DataRow label="Geography" value={data.location} icon="📍" />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-3">
              Email Channels
              <div className="h-px bg-blue-50 flex-grow"></div>
            </h4>
            <div className="flex flex-col gap-4">
              {data.emails && data.emails.length > 0 ? (
                data.emails.map((email, idx) => (
                  <DataRow 
                    key={`email-${idx}`} 
                    label={data.emails.length > 1 ? `Email Address ${idx + 1}` : "Email Address"} 
                    value={email} 
                    icon="📧" 
                    isCopyable 
                    isPrimary={idx === 0}
                  />
                ))
              ) : (
                <DataRow label="Email Address" value={null} icon="📧" />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-3">
              Other Contacts
              <div className="h-px bg-blue-50 flex-grow"></div>
            </h4>
            <div className="flex flex-col gap-4">
              {data.phoneNumbers && data.phoneNumbers.length > 1 ? (
                data.phoneNumbers.slice(1).map((phone, idx) => (
                  <DataRow 
                    key={`phone-other-${idx}`} 
                    label={`Alternative Number ${idx + 1}`} 
                    value={phone} 
                    icon="📱" 
                    isCopyable 
                  />
                ))
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs text-center italic">
                  No secondary numbers found
                </div>
              )}
            </div>
          </div>
        </section>

        {data.summary && (
          <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Professional Background</h4>
            <p className="text-slate-600 text-base leading-relaxed font-medium italic">
              "{data.summary}"
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default DataCard;
