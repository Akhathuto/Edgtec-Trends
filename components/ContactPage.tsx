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
      <div className="bg-dark-card border border-gray-700 rounded-xl p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3">
          <Mail className="w-8 h-8 text-purple-400" />
          Contact Us
        </h2>
        <p className="text-center text-gray-400 mb-8">Have a question or feedback? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" id="contact-name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"/>
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input type="email" id="contact-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"/>
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number (Optional)</label>
              <input type="tel" id="contact-phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"/>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
              <textarea id="contact-message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all resize-none"></textarea>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {loading ? <Spinner /> : 'Send Message'}
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-2">Our Information</h3>
              <p className="text-gray-400">You can reach us via email, phone, or visit us at our registered address.</p>
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-200">Support Email</h4>
                    <a href="mailto:r.lepheane@outlook.com" className="text-blue-400 hover:underline">r.lepheane@outlook.com</a>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200">Support Phone</h4>
                    <a href="tel:+27711846709" className="text-blue-400 hover:underline">+27 71 184 6709</a>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200">Business Inquiries</h4>
                    <a href="mailto:siphosakhemsimanngo@gmail.com" className="text-blue-400 hover:underline">siphosakhemsimanngo@gmail.com</a>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-200">Business Phone</h4>
                    <a href="tel:+27694237030" className="text-blue-400 hover:underline">+27 69 423 7030</a>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-200">Address</h4>
                    <p className="text-gray-300">
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
