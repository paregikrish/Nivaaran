import React from 'react';
import {
  PiggyBank,
  ShieldAlert,
  Landmark,
  CreditCard,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function WelcomeHero() {
  const { sendMessage } = useChat();

  const starterCards = [
    {
      icon: PiggyBank,
      title: 'Smart Budgeting & Saving',
      prompt: 'I earn ₹20,000 per month. How can I start saving with the 50/30/20 rule?',
      color: 'emerald',
      tag: 'Budgeting',
    },
    {
      icon: ShieldAlert,
      title: 'Scam & UPI Safety',
      prompt: 'Someone called asking for an OTP to unlock my bank account. What should I do?',
      color: 'amber',
      tag: 'Scam Protection',
    },
    {
      icon: Landmark,
      title: 'Govt Welfare Schemes',
      prompt: 'What are the benefits and eligibility for PM Jan Dhan Yojana & PMSBY ₹20/year insurance?',
      color: 'blue',
      tag: 'Public Schemes',
    },
    {
      icon: CreditCard,
      title: 'Debt & Loan Management',
      prompt: 'How can I systematically pay off my high-interest loans using the debt avalanche method?',
      color: 'purple',
      tag: 'Debt Awareness',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold text-3xl shadow-lg shadow-emerald-500/25 mb-4 animate-bounce-subtle">
          नि
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Welcome to <span className="text-emerald-600 dark:text-emerald-400">Nivaaran</span>
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300 font-medium mt-1">
          “Understand Money. Build a Better Future.”
        </p>

        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mt-2 leading-relaxed">
          Your personal AI assistant dedicated to financial inclusion, simple budgeting, fraud prevention, and verified public welfare schemes (<span className="text-emerald-600 dark:text-emerald-400 font-medium">SDG 1: No Poverty</span>).
        </p>
      </div>

      {/* 4 Interactive Starter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
        {starterCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={idx}
              onClick={() => sendMessage(card.prompt)}
              className="group p-4 bg-white dark:bg-[#161b22] hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 border border-gray-200/80 dark:border-gray-800 rounded-2xl cursor-pointer shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {card.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-xs md:text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  "{card.prompt}"
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Ask Nivaaran</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Assurance Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <strong className="text-gray-800 dark:text-gray-100">Security Guarantee:</strong> Nivaaran provides safe financial education and will <strong className="text-emerald-600 dark:text-emerald-400">never ask</strong> for your bank passwords, OTPs, PINs, or card CVVs.
        </p>
      </div>
    </div>
  );
}
