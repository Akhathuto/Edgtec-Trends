

import React from 'react';
import { Info, Users } from './Icons';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-slate-400">{label}</p>
    <p className="font-semibold text-slate-200">{value}</p>
  </div>
);

const About: React.FC = () => {
  return (
    <div className="animate-slide-in-up">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
          <Info className="w-6 h-6 text-violet-400" /> About utrend
        </h2>
        
        <section className="mb-8">
          <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Legal Name" value="utrend" />
            <DetailItem label="Supplier Number" value="MAAA1626554" />
            <DetailItem label="Registration Number" value="2025/534716/07" />
            <DetailItem label="Country of Origin" value="South Africa" />
            <DetailItem label="Business Status" value="In Business" />
            <DetailItem 
              label="B-BBEE Status" 
              value={<span className="bg-green-500/20 text-green-300 font-bold text-sm px-3 py-1 rounded-full">100% Black Owned</span>} 
            />
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Users className="w-5 h-5" /> Ownership Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-slate-100">Ranthutu Lepheane</h4>
                <span className="text-xs bg-violet-500/30 text-violet-200 font-semibold px-2 py-1 rounded-md">Director</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Email: r.lepheane@outlook.com</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-slate-100">Siphosakhe Mathews Msimango</h4>
                <span className="text-xs bg-violet-500/30 text-violet-200 font-semibold px-2 py-1 rounded-md">Director</span>
              </div>
               <p className="text-sm text-slate-400 mt-2">Email: siphosakhemsimango@gmail.com</p>
            </div>
          </div>
        </section>

        <section>
            <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2">Registered Address</h3>
            <p className="text-slate-300">
                106312 Ngwabe Street, Kwa-Thema Mini Selecourt, <br />
                Springs, Springs Central, Gauteng, 1575 <br />
                South Africa
            </p>
        </section>

      </div>
    </div>
  );
};

export default About;