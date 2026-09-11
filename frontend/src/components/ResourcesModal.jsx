import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  ExternalLink,
  Phone,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';
import { useChat } from '../context/ChatContext';

export default function ResourcesModal() {
  const { resourcesModalOpen, setResourcesModalOpen, sendMessage } = useChat();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resourcesModalOpen) {
      loadData();
    }
  }, [resourcesModalOpen, selectedCategory, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resList, catList] = await Promise.all([
        api.getResources({ category: selectedCategory, search }),
        api.getCategories(),
      ]);
      setResources(resList);
      setCategories(['All', ...catList]);
    } catch (err) {
      console.error('Failed to load public resources:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!resourcesModalOpen) return null;

  const askAboutResource = (resource) => {
    setResourcesModalOpen(false);
    sendMessage(
      `Please explain the benefits, eligibility rules, and application process for "${resource.title}".`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#161b22] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Verified Public Schemes & Helplines
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Verified Data
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Official Indian financial inclusion welfare schemes, micro-credit programs, and consumer protection helplines.
              </p>
            </div>
          </div>

          <button
            onClick={() => setResourcesModalOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scheme name, eligibility, or keywords (e.g. Jan Dhan, 1930, Mudra, Insurance)..."
              className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors
                  ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 dark:bg-[#090d16]/50">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 italic">
              No matching verified resources found for "{search}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 bg-white dark:bg-[#161b22] border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/30">
                        {res.category}
                      </span>
                      {res.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {res.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                      {res.description}
                    </p>

                    {res.eligibility && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase">
                          Eligibility / Criteria:
                        </span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                          {res.eligibility}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {res.official_url && (
                        <a
                          href={res.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {res.helpline && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{res.helpline}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => askAboutResource(res)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
