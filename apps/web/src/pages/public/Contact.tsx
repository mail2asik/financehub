import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { api, parseApiError } from '../../services/api';

interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Execute POST request to the contact endpoint
      await api.post('/contact', formData);
      setSubmitted(true);
      // Reset form values on success
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err: unknown) {
      const messages = parseApiError(err);
      setError(messages.join(', '));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="bg-indigo-50 text-slate-900 py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <h1 className="text-4xl font-extrabold">Get in Touch</h1>
          <p className="text-slate-600">Have questions about FinanceHub? Our dedicated team is here to assist you.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
          <p className="text-slate-600 text-sm">Fill out the form or reach out directly through our support channels.</p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Email Us</h4>
                <p className="text-xs text-slate-500">support@financehub.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Call Us</h4>
                <p className="text-xs text-slate-500">+1 (800) 555-0199</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Headquarters</h4>
                <p className="text-xs text-slate-500">100 Financial Plaza, Suite 400, New York, NY 10005</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
              <p className="text-slate-600 text-sm">Thank you for reaching out. A representative will contact you within 24 hours.</p>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    disabled={loading}
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  disabled={loading}
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                  placeholder="Account Inquiry"
                />
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  disabled={loading}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none disabled:bg-slate-50"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;