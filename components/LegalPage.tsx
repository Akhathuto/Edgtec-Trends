import React from 'react';
import { Shield, FileText } from './Icons';

interface LegalPageProps {
  type: 'terms' | 'license';
}

const termsContent = (
    <>
        <p className="mb-4">By using `utrend`, you agree to the following terms and conditions:</p>
        <ol className="list-decimal list-inside space-y-4">
            <li>
                <strong>Acceptance of Terms:</strong> Your use of the application constitutes your acceptance of these terms. If you do not agree, you must not use the application.
            </li>
            <li>
                <strong>User Accounts:</strong> You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </li>
            <li>
                <strong>Acceptable Use:</strong> You agree not to use the application for any unlawful purpose or to violate any regulations. You may not reverse-engineer or otherwise attempt to discover the source code.
            </li>
             <li>
                <strong>User-Generated Content:</strong> You retain all rights to the content you generate using the application ("User Content"). However, you are solely responsible for your User Content and ensuring it is lawful and appropriate.
            </li>
            <li>
                <strong>Subscription Plans:</strong> The application offers free and paid plans with features limited by tier. Payments for paid plans are processed through secure third-party payment gateways.
            </li>
             <li>
                <strong>Termination:</strong> We may terminate or suspend your access to our service immediately, without prior notice, for any reason, including a breach of these Terms.
            </li>
            <li>
                <strong>Third-Party Services:</strong> This application utilizes third-party services, including the Google Gemini API. Your use is also subject to their terms.
            </li>
            <li>
                <strong>"As Is" Basis:</strong> This software is provided "as is", without warranty of any kind, express or implied.
            </li>
            <li>
                <strong>Limitation of Liability:</strong> In no event shall EDGTEC be liable for any claim, damages, or other liability arising from the use of the software.
            </li>
            <li>
                <strong>Governing Law:</strong> These Terms shall be governed in accordance with the laws of South Africa.
            </li>
            <li>
                <strong>Changes to Terms:</strong> We reserve the right to modify or replace these Terms at any time.
            </li>
        </ol>
    </>
);

const licenseContent = (
    <>
        <p className="mb-4">
            <strong>Proprietary Property:</strong> This software, including its source code, visual design, features, and the "utrend" name and logo, are the proprietary property and trademarks of EDGTEC. All rights are reserved.
        </p>
        <p className="mb-4">
             <strong>Limited License:</strong> EDGTEC grants you a limited, non-exclusive, non-transferable, revocable license to use the `utrend` application for your personal or internal business purposes, strictly in accordance with these Terms of Use.
        </p>
         <p className="mb-4">
            <strong>Restrictions:</strong> Unauthorized copying, distribution, modification, or use of this software, or any portion of it, is strictly prohibited without the express written permission of EDGTEC.
        </p>
        <p className="font-bold">Copyright (c) 2024 EDGTEC. All Rights Reserved.</p>
    </>
);


const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Use' : 'License and Intellectual Property';
  const content = isTerms ? termsContent : licenseContent;
  const icon = isTerms ? <FileText className="w-8 h-8 text-violet-400" /> : <Shield className="w-8 h-8 text-violet-400" />;

  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl">
        <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
          {icon}
          {title}
        </h2>
        <div className="text-slate-300 leading-relaxed space-y-4">
            {content}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;