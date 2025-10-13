import React, { useState, useEffect } from 'react';
import { Mail } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Spinner from './Spinner';

const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast('Your message has been sent successfully!');
      setMessage('');
      setPhone('');
    }, 1000);
  };

  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl">
        <h2 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3">
          <Mail className="w-8 h-8 text-violet-400" />
          Contact Us
        </h2>
        <p className="text-center text-slate-400 mb-8">Have a question or feedback? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" id="contact-name" value={name} onChange={e => setName(e.target.value)} required title="Your full name" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"/>
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input type="email" id="contact-email" value={email} onChange={e => setEmail(e.target.value)} required title="Your email address" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"/>
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
              <input type="tel" id="contact-phone" value={phone} onChange={e => setPhone(e.target.value)} title="Your phone number (optional)" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"/>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-slate-300 mb-1">Message</label>
              <textarea id="contact-message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} title="Your message" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none shadow-inner"></textarea>
            </div>
            <button
                type="submit"
                disabled={loading}
                title="Send your message to the support team"
                className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-violet/30"
            >
                {loading ? <Spinner /> : 'Send Message'}
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-violet-300 mb-2">Our Information</h3>
              <p className="text-slate-400">You can reach us via email, phone, or visit us at our registered address.</p>
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-slate-200">Support Email</h4>
                    <a href="mailto:r.lepheane@outlook.com" className="text-blue-400 hover:underline">r.lepheane@outlook.com</a>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-200">Support Phone</h4>
                    <a href="tel:+27711846709" className="text-blue-400 hover:underline">+27 71 184 6709</a>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-200">Business Inquiries</h4>
                    <a href="mailto:siphosakhemsimanngo@gmail.com" className="text-blue-400 hover:underline">siphosakhemsimanngo@gmail.com</a>
                </div>
                 <div>
                    <h4 className="font-semibold text-slate-200">Business Phone</h4>
                    <a href="tel:+27694237030" className="text-blue-400 hover:underline">+27 69 423 7030</a>
                </div>
                 <div>
                    <h4 className="font-semibold text-slate-200">Address</h4>
                    <p className="text-slate-300">
                        106312 Ngwabe Street, Kwa-Thema Mini Selecourt,<br/>
                        Springs, Gauteng, 1575, South Africa
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;