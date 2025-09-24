import React from 'react';
import { Shield, FileText } from './Icons.tsx';
import { format } from 'date-fns';

interface LegalPageProps {
  type: 'terms' | 'license';
}

const termsContent = (
    <>
        <p className="mb-4"><strong>Last Updated: {format(new Date(), 'MMMM d, yyyy')}</strong></p>
        <p className="mb-4">By using `utrend`, you agree to the following terms and conditions:</p>
        <ol className="list-decimal list-inside space-y-4">
            <li>
                <strong>Acceptance of Terms:</strong> Your access to and use of the application constitutes your binding agreement to these Terms of Use. If you do not agree to these terms, you must not use the application.
            </li>
            <li>
                <strong>Eligibility:</strong> You must be at least 18 years of age to use this application. By using `utrend`, you represent and warrant that you meet this age requirement.
            </li>
            <li>
                <strong>User Accounts & Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </li>
             <li>
                <strong>Acceptable Use Policy:</strong> You agree not to use the application to:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Conduct any illegal, fraudulent, or malicious activities.</li>
                    <li>Infringe on the intellectual property rights of others.</li>
                    <li>Generate content that is hateful, defamatory, obscene, or otherwise objectionable.</li>
                    <li>Attempt to reverse-engineer, decompile, or otherwise discover the source code of the application.</li>
                    <li>Use automated systems (bots, scrapers) to access the application in a manner that sends more request messages to our servers than a human can reasonably produce in the same period.</li>
                </ul>
            </li>
            <li>
                <strong>AI-Generated Content & User Responsibility:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><strong>Ownership:</strong> You retain all ownership rights to the content you generate using the application's AI tools ("User Content").</li>
                    <li><strong>Responsibility:</strong> You are solely responsible for the User Content you generate, publish, and use. You must review all AI-generated content for accuracy and appropriateness before use.</li>
                    <li><strong>Disclaimer:</strong> AI-generated content may contain inaccuracies, errors, or reflect biases from its training data. utrend makes no warranties regarding the accuracy, reliability, or suitability of AI-generated content. It is your responsibility to ensure your final content complies with all applicable platform policies (e.g., YouTube's Terms of Service).</li>
                </ul>
            </li>
            <li>
                <strong>Subscription & Payments:</strong> The application offers free and paid plans. By subscribing to a paid plan, you agree to pay the specified fees. All payments are processed through secure third-party gateways.
            </li>
             <li>
                <strong>Data Privacy:</strong> We are committed to protecting your privacy. We collect and use personal information, such as your name and email address, to provide and improve our services. Your payment information is handled by secure third-party processors. We do not sell your personal data.
            </li>
            <li>
                <strong>Termination:</strong> We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Use or is harmful to other users of the application, us, or third parties.
            </li>
            <li>
                <strong>Third-Party Services:</strong> This application utilizes third-party services, including the Google Gemini API. Your use of these features is also subject to their respective terms and conditions.
            </li>
            <li>
                <strong>Indemnification:</strong> You agree to indemnify and hold harmless utrend, its directors, and employees from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of the application or your violation of these Terms.
            </li>
            <li>
                <strong>Disclaimer of Warranties & Limitation of Liability:</strong> The application is provided on an "as is" and "as available" basis, without any warranties of any kind. In no event shall utrend be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the application.
            </li>
            <li>
                <strong>Governing Law & Dispute Resolution:</strong> These Terms shall be governed and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions. Any disputes will be resolved in the courts of Gauteng, South Africa.
            </li>
             <li>
                <strong>Changes to Terms:</strong> We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes.
            </li>
        </ol>
    </>
);

const licenseContent = (
    <>
        <p className="mb-4">
            <strong>Proprietary Property:</strong> This software, including its source code, visual design, features, and the "utrend" name and logo, are the proprietary property and trademarks of utrend. All rights are reserved.
        </p>
        <p className="mb-4">
             <strong>Limited License:</strong> utrend grants you a limited, non-exclusive, non-transferable, revocable license to use the `utrend` application for your personal or internal business purposes, strictly in accordance with these Terms of Use.
        </p>
         <p className="mb-4">
            <strong>Restrictions:</strong> Unauthorized copying, distribution, modification, or use of this software, or any portion of it, is strictly prohibited without the express written permission of utrend.
        </p>
        <p className="font-bold">Copyright (c) 2024 utrend. All Rights Reserved.</p>
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