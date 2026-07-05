"use client";

import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useTranslation } from "../../hooks/useTranslation";
import { Mail, CheckCircle2, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Simulate sending message
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <div className="flex-1 w-full max-w-2xl mx-auto py-12 px-margin-mobile md:px-margin-desktop flex flex-col gap-8">
        
        {/* Title */}
        <div className="text-center md:text-left border-b border-outline-variant/10 pb-6">
          <h1 className="text-3xl font-black text-on-surface tracking-tight">{t("contact")}</h1>
          <p className="text-sm md:text-base text-secondary mt-2">{t("contactSubtitle")}</p>
        </div>

        {/* Form panel */}
        {submitted ? (
          <div className="p-8 bg-emerald-500/10 border border-emerald-500/25 rounded-3xl text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-emerald-500">{t("contactSuccess")}</h3>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-2 border border-emerald-500/20 text-emerald-500 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-emerald-500/5 transition-all"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-xl text-left border border-outline-variant/10"
          >
            {/* Form Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">Submit Feedback</h3>
                <p className="text-xs text-secondary">All reports are reviewed by Giza Campus administration.</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-secondary uppercase tracking-wider pl-1">
                {t("contactFormName")}
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-container border border-outline-variant/10 rounded-xl p-3 px-4 text-sm text-on-surface outline-none focus:border-primary/50 transition-colors"
                placeholder="Student full name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-secondary uppercase tracking-wider pl-1">
                {t("contactFormEmail")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface-container border border-outline-variant/10 rounded-xl p-3 px-4 text-sm text-on-surface outline-none focus:border-primary/50 transition-colors"
                placeholder="username@cu.edu.eg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-xs font-bold text-secondary uppercase tracking-wider pl-1">
                {t("contactFormMsg")}
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-surface-container border border-outline-variant/10 rounded-xl p-3 px-4 text-sm text-on-surface outline-none focus:border-primary/50 transition-colors resize-none"
                placeholder="Please describe the correction (e.g. 'Science Hall 3 is located on the second floor of the chemistry building, not first.')"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="mt-2 bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t("contactFormSubmit")}</span>
            </button>
          </form>
        )}

      </div>
    </Layout>
  );
}
