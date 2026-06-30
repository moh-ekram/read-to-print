import React, { useState } from 'react';
import { Article, Writer, PayoutRequest } from '../types';
import { FileText, Save, Send, Eye, Plus, Trash2, Edit3, Sparkles, BookOpen, User, ArrowLeft, Bold, Quote, Heading, Coins, Wallet, History, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WriterPanelProps {
  currentWriter: Writer;
  articles: Article[];
  onUpdateWriter: (writer: Writer) => void;
  onAddArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onUpdateArticle: (id: string, article: Partial<Article>) => void;
  payoutRequests?: PayoutRequest[];
  onSubmitPayoutRequest?: (amount: number, method: 'bkash' | 'nagad' | 'rocket', account: string) => void;
}

export default function WriterPanel({
  currentWriter,
  articles,
  onUpdateWriter,
  onAddArticle,
  onDeleteArticle,
  onUpdateArticle,
  payoutRequests = [],
  onSubmitPayoutRequest
}: WriterPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'editor'>('profile');
  
  // Profile state
  const [authorName, setAuthorName] = useState(currentWriter.name);
  const [authorBio, setAuthorBio] = useState(currentWriter.bio);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Wallet & Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(Math.floor(currentWriter.balance_bdt || 0));
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState<string>('');

  React.useEffect(() => {
    setWithdrawAmount(Math.floor(currentWriter.balance_bdt || 0));
  }, [currentWriter.balance_bdt]);

  // New Article Form State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'সাহিত্য' | 'বিজ্ঞান' | 'রাজনীতি' | 'অর্থনীতি' | 'ধর্ম' | 'দর্শন'>('সাহিত্য');
  const [subCategory, setSubCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [requiredCoins, setRequiredCoins] = useState<number>(0);
  const [viewingArticleForWriter, setViewingArticleForWriter] = useState<Article | null>(null);
  const [showWallet, setShowWallet] = useState(false);

  // Filter writer's own articles
  const writerArticles = articles.filter(art => art.writerId === currentWriter.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWriter({
      ...currentWriter,
      name: authorName,
      bio: authorBio
    });
    setIsEditingProfile(false);
  };

  // Safe editor helper, wraps selected text with basic formatting
  const handleFormat = (tag: 'bold' | 'quote' | 'heading' | 'p') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (tag === 'bold') {
      replacement = `<b>${selected || 'বোল্ড টেক্সট'}</b>`;
    } else if (tag === 'quote') {
      replacement = `<blockquote>${selected || 'উদ্ধৃতি অংশ'}</blockquote>`;
    } else if (tag === 'heading') {
      replacement = `<h3>${selected || 'হেডিং'}</h3>`;
    } else if (tag === 'p') {
      replacement = `\n<p>${selected || 'নতুন প্যারাগ্রাফ'}</p>\n`;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    
    // Focus back and restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 50);
  };

  const handleEditArticleClick = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setSubCategory(art.subCategory);
    setTagInput(art.tags.join(', '));
    setContent(art.content);
    setStatus(art.status);
    setRequiredCoins(art.requiredCoins || 0);
    setActiveTab('editor');
    setIsPreviewMode(false);
  };

  const handleStartNewArticle = () => {
    setEditingArticleId(null);
    setTitle('');
    setCategory('সাহিত্য');
    setSubCategory('');
    setTagInput('');
    setContent('');
    setStatus('published');
    setRequiredCoins(0);
    setActiveTab('editor');
    setIsPreviewMode(false);
  };

  const handlePublishArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('দয়া করে শিরোনাম এবং কন্টেন্ট লিখুন।');
      return;
    }

    const tagsArray = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    if (editingArticleId) {
      onUpdateArticle(editingArticleId, {
        title,
        content,
        category,
        subCategory,
        tags: tagsArray,
        status,
        wordCount,
        requiredCoins,
      });
    } else {
      const newArt: Article = {
        id: 'new-' + Date.now(),
        title,
        content,
        category,
        subCategory,
        tags: tagsArray,
        writerId: currentWriter.id,
        writerName: currentWriter.name,
        writerAvatar: currentWriter.avatar,
        status,
        createdAt: new Date().toISOString().split('T')[0],
        reads: 0,
        wordCount,
        requiredCoins,
      };
      onAddArticle(newArt);
    }

    // Reset Form & switch tab
    setActiveTab('profile');
    setEditingArticleId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="writer-panel">
      {/* Mini navbar inside panel */}
      <div className="flex justify-between items-center bg-[#faf9f6] p-3 border border-neutral-300">
        <div className="flex items-center gap-3">
          <img 
            src={currentWriter.avatar} 
            alt={currentWriter.name} 
            className="w-8 h-8 rounded-full object-cover border border-neutral-400" 
          />
          <div>
            <h2 className="font-bold text-neutral-900 text-sm leading-none">{currentWriter.name}</h2>
            <p className="text-[10px] text-neutral-400 font-mono tracking-tighter mt-1">লেখক পিন • /@{currentWriter.username}</p>
          </div>
        </div>

        <div className="flex gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-1 px-1.5 transition-all ${
              activeTab === 'profile' 
                ? 'text-neutral-950 border-b-2 border-neutral-950 font-bold' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            টিমলাইন ও বায়ো
          </button>
          <button
            onClick={handleStartNewArticle}
            className={`py-1 px-1.5 transition-all ${
              activeTab === 'editor' && !editingArticleId
                ? 'text-neutral-950 border-b-2 border-neutral-950 font-bold' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            + নতুন লেখা লিখুন
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 1. Biography details (বৃত্তান্ত) Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-6 items-center justify-between text-left">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full sm:w-auto">
                <div className="relative">
                  <img 
                    src={currentWriter.avatar} 
                    alt={currentWriter.name} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 p-1 shadow-md"
                  />
                  <span className="absolute bottom-0.5 right-0.5 bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base">{currentWriter.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">@{currentWriter.username}</p>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">
                    নিবন্ধিত কলামিস্ট (Columnist)
                  </span>
                </div>
              </div>

              <div className="w-full md:max-w-md space-y-3">
                {!isEditingProfile ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-550 leading-relaxed italic bg-slate-50/70 p-3 rounded-xl border border-dashed border-slate-200">
                      {currentWriter.bio || 'কোনো বায়ো এখনো যোগ করা হয়নি।'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      প্রোফাইল এডিট
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-2">
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                    <textarea
                      value={authorBio}
                      onChange={(e) => setAuthorBio(e.target.value)}
                      rows={2}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                      placeholder="আপনার বায়ো বলুন..."
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        সংরক্ষণ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* 2. Colorful, Minimalistic Buttons Box (রয়্যালটি ও কন্ট্রিবিউশন সামারি) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-wide">
                  রাইটার কন্ট্রিবিউশন ও রয়্যালটি ড্যাশবোর্ড
                </h4>
                <p className="text-[10px] text-slate-400 font-bold font-mono">লাইভ রয়্যালটি ডাটা</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 1. Total Articles (নীল/Blue-Indigo) */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('writer-articles-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-4 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 text-indigo-700 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group shadow-3xs"
                >
                  <FileText className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <p className="text-lg font-black font-mono mt-1">{writerArticles.length}</p>
                  <p className="text-[10px] font-bold text-indigo-600">মোট রচনা 👁️</p>
                </button>

                {/* 2. Followers (বেগুনি/Purple-Violet) */}
                <div
                  className="p-4 bg-violet-50/70 border border-violet-200 text-violet-700 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-3xs"
                >
                  <User className="w-5 h-5 text-violet-500" />
                  <p className="text-lg font-black font-mono mt-1">{currentWriter.followers}</p>
                  <p className="text-[10px] font-bold text-violet-600">অনুগামী (Followers)</p>
                </div>

                {/* 3. This Month's Coins (হলুদ/Amber) */}
                <button
                  type="button"
                  onClick={() => setShowWallet(prev => !prev)}
                  className="p-4 bg-amber-50/70 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 text-amber-800 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group shadow-3xs"
                  title="ওয়ালেট দেখতে ক্লিক করুন"
                >
                  <Coins className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform" />
                  <p className="text-lg font-black font-mono mt-1">
                    🪙 {currentWriter.monthly_coins !== undefined ? currentWriter.monthly_coins : (currentWriter.coinBalance || 0)}
                  </p>
                  <p className="text-[10px] font-bold text-amber-700">চলতি মাসের কয়েন ⚙️</p>
                </button>

                {/* 4. Lifetime Royalty (কমলা/Orange) */}
                <button
                  type="button"
                  onClick={() => setShowWallet(prev => !prev)}
                  className="p-4 bg-orange-50/70 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 text-orange-800 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group shadow-3xs"
                  title="ওয়ালেট দেখতে ক্লিক করুন"
                >
                  <Sparkles className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <p className="text-lg font-black font-mono mt-1">
                    🪙 {currentWriter.lifetime_coins !== undefined ? currentWriter.lifetime_coins : (currentWriter.coinBalance || 0)}
                  </p>
                  <p className="text-[10px] font-bold text-orange-700">লাইফটাইম কয়েন ⚙️</p>
                </button>

                {/* 5. Wallet Balance BDT (সবুজ/Emerald) */}
                <button
                  type="button"
                  onClick={() => setShowWallet(prev => !prev)}
                  className={`p-4 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group shadow-3xs col-span-2 sm:col-span-1 border ${
                    showWallet 
                      ? 'bg-emerald-600 border-emerald-700 text-white' 
                      : 'bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                  }`}
                  title="ক্যাশআউট প্যানেল খুলুন/বন্ধ করুন"
                >
                  <Wallet className={`w-5 h-5 group-hover:translate-y-[-2px] transition-transform ${showWallet ? 'text-white' : 'text-emerald-500'}`} />
                  <p className="text-lg font-black font-mono mt-1">
                    ৳{(currentWriter.balance_bdt || 0).toFixed(0)}
                  </p>
                  <p className={`text-[10px] font-bold ${showWallet ? 'text-emerald-100' : 'text-emerald-700'}`}>
                    {showWallet ? 'ওয়ালেট খোলা আছে' : 'টাকা ব্যালেন্স ⚙️'}
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Wallet and Withdrawal Panel (Conditionally displayed / animated) */}
            <AnimatePresence>
              {showWallet && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-indigo-650" />
                        <h4 className="font-bold text-slate-800 text-sm">রয়্যালটি ওয়ালেট ও ক্যাশআউট উইন্ডো</h4>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowWallet(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
                      >
                        বন্ধ করুন ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Wallet Info */}
                      <div className="space-y-3 p-4 bg-slate-50/60 rounded-xl border border-slate-150">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">লাইফটাইম রয়্যালটি কয়েন</p>
                          <p className="text-base font-black text-slate-800 font-mono flex items-center gap-1">
                            🪙 {currentWriter.lifetime_coins !== undefined ? currentWriter.lifetime_coins : (currentWriter.coinBalance || 0)}
                          </p>
                          <p className="text-[9px] text-slate-455 leading-tight">কখনোই শূন্য হবে না, রেটিং ও কলামিস্ট পদবির জন্য ট্র্যাকড</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 space-y-0.5">
                            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider font-mono">চলতি মাসের কয়েন</p>
                            <p className="text-xs font-black text-amber-600 font-mono flex items-center gap-0.5">
                              🪙 {currentWriter.monthly_coins !== undefined ? currentWriter.monthly_coins : (currentWriter.coinBalance || 0)}
                            </p>
                          </div>

                          <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider font-mono">ব্যালেন্স (টাকা)</p>
                            <p className="text-xs font-black text-emerald-600 font-mono">
                              ৳{(currentWriter.balance_bdt || 0).toFixed(1)}
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 italic leading-snug">
                          মাসিক ক্লোজিংয়ের পর প্রতি ১ কয়েন = ১ টাকা রেশিওতে BDT ব্যালেন্স যোগ হয়। সর্বনিম্ন ৳৫০ টাকা BDT ব্যালেন্স থাকলে আপনি উত্তোলন করতে পারবেন।
                        </p>
                      </div>

                      {/* Right: Cashout form */}
                      <div className="space-y-3">
                        {onSubmitPayoutRequest && currentWriter.balance_bdt && currentWriter.balance_bdt >= 50 ? (
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 font-mono">উত্তোলনযোগ্য পরিমাণ (টাকা)</label>
                              <input
                                type="number"
                                min={50}
                                max={currentWriter.balance_bdt}
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 font-mono">উত্তোলন মাধ্যম</label>
                                <select
                                  value={withdrawMethod}
                                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="bkash">বিকাশ (bKash)</option>
                                  <option value="nagad">নগদ (Nagad)</option>
                                  <option value="rocket">রকেট (Rocket)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 font-mono">একাউন্ট নাম্বার</label>
                                <input
                                  type="tel"
                                  placeholder="017xxxxxxxx"
                                  value={withdrawAccount}
                                  onChange={(e) => setWithdrawAccount(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (!withdrawAccount.trim()) {
                                  alert('দয়া করে সঠিক একাউন্ট নাম্বারটি লিখুন।');
                                  return;
                                }
                                onSubmitPayoutRequest(withdrawAmount, withdrawMethod, withdrawAccount);
                                setWithdrawAccount('');
                              }}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-[1.01]"
                            >
                              পেমেন্ট রিকোয়েস্ট পাঠান
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-center h-full">
                            <p className="text-[11px] text-slate-550 italic text-center leading-relaxed">
                              ব্যালেন্স উত্তোলন করতে কমপক্ষে ৳৫০ টাকা BDT প্রয়োজন। আপনার বর্তমান ব্যালেন্স ৳{(currentWriter.balance_bdt || 0).toFixed(1)}।
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cashout History list */}
                    {payoutRequests.filter(r => r.writerId === currentWriter.id).length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                          <History className="w-3.5 h-3.5 text-slate-400" />
                          আপনার ক্যাশআউট হিস্ট্রি
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                          {payoutRequests
                            .filter(r => r.writerId === currentWriter.id)
                            .map((r) => (
                              <div key={r.id} className="p-2 bg-slate-50 rounded-lg border border-slate-150 flex justify-between items-center text-[10px] font-sans">
                                <div>
                                  <p className="font-extrabold text-slate-800 font-mono">৳{r.amount} - {r.paymentMethod.toUpperCase()}</p>
                                  <p className="text-[9px] text-slate-400 font-mono">{r.requestDate} • {r.accountNumber}</p>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded-sm font-bold uppercase text-[9px] ${
                                  r.status === 'paid' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {r.status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Writer's Published Articles Timeline / Minimalist List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4 text-left" id="writer-articles-section">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 animate-pulse" />
                  প্রকাশিত রচনার টাইমলাইন
                </h3>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold border border-indigo-100 px-2.5 py-1 rounded-full font-mono">
                  {writerArticles.length} টি লেখা মোট
                </span>
              </div>

              {writerArticles.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <BookOpen className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
                  <p className="text-sm">আপনার কোনো লেখা এখনো খুঁজে পাওয়া যায়নি।</p>
                  <button
                    type="button"
                    onClick={handleStartNewArticle}
                    className="px-4 py-2 bg-indigo-50 text-indigo-750 rounded-full text-xs font-semibold hover:bg-indigo-100/70 cursor-pointer"
                  >
                    প্রথম লেখা লিখুন
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Excel Sheet Style Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-3xs bg-white">
                    <table className="w-full text-left text-xs text-slate-650 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 text-[11px] font-black uppercase tracking-wider">
                          <th className="p-3 border-r border-slate-200 font-extrabold text-left min-w-[150px]">শিরোনাম (Title)</th>
                          <th className="p-3 border-r border-slate-200 font-extrabold text-center">ক্যাটাগরি</th>
                          <th className="p-3 border-r border-slate-200 font-extrabold text-center">পঠিত সংখ্যা (Reads)</th>
                          <th className="p-3 border-r border-slate-200 font-extrabold text-center">অ্যাড টু প্রিন্ট</th>
                          <th className="p-3 border-r border-slate-200 font-extrabold text-center text-amber-600 bg-amber-50/20">কয়েন আর্নিং</th>
                          <th className="p-3 border-r border-slate-200 font-extrabold text-center text-emerald-600 bg-emerald-50/20">টাকা আর্নিং</th>
                          <th className="p-3 font-extrabold text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {writerArticles.map((art) => {
                          const printCount = art.printCount ?? (Math.floor(art.reads / 8) + 2);
                          const earnedCoins = art.earnedCoins ?? ((art.requiredCoins || 0) * Math.floor(art.reads * 0.4));
                          const earnedBdt = earnedCoins; // 1 coin = 1 taka

                          return (
                            <tr 
                              key={art.id} 
                              className="hover:bg-indigo-50/40 transition-all group duration-150 cursor-pointer"
                            >
                              <td 
                                onClick={() => setViewingArticleForWriter(art)}
                                className="p-3 border-r border-slate-150 text-slate-900 font-bold text-xs max-w-[200px] truncate group-hover:text-indigo-650"
                              >
                                {art.title}
                              </td>
                              <td 
                                onClick={() => setViewingArticleForWriter(art)}
                                className="p-3 border-r border-slate-150 text-center text-[10px]"
                              >
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-750 font-bold rounded-md">
                                  {art.category}
                                </span>
                              </td>
                              <td 
                                onClick={() => setViewingArticleForWriter(art)}
                                className="p-3 border-r border-slate-150 text-center font-mono font-bold text-slate-600"
                              >
                                👁️ {art.reads}
                              </td>
                              <td 
                                onClick={() => setViewingArticleForWriter(art)}
                                className="p-3 border-r border-slate-150 text-center font-mono font-bold text-slate-600"
                              >
                                🖨️ {printCount}
                              </td>
                              <td 
                                onClick={() => setViewingArticleForWriter(art)}
                                className="p-3 border-r border-slate-150 text-center font-mono font-black text-amber-600 bg-amber-50/10"
                              >
                                🪙 {earnedCoins}
                              </td>
                              <td 
                                onClick={() => setViewingArticleForWriter(art)}
                                className="p-3 border-r border-slate-150 text-center font-mono font-black text-emerald-600 bg-emerald-50/10"
                              >
                                ৳{earnedBdt}
                              </td>
                              <td className="p-3 text-center flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditArticleClick(art);
                                  }}
                                  className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-650 hover:text-indigo-650 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title="সম্পাদনা"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  এডিট
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteArticle(art.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Writer Article Detail Modal Overlay */}
                  <AnimatePresence>
                    {viewingArticleForWriter && (
                      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto text-left animate-fade-in"
                        >
                          <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                            <div>
                              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-750 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {viewingArticleForWriter.category} {viewingArticleForWriter.subCategory ? `/ ${viewingArticleForWriter.subCategory}` : ''}
                              </span>
                              <h3 className="font-extrabold text-slate-900 text-base mt-2 leading-tight">
                                {viewingArticleForWriter.title}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setViewingArticleForWriter(null)}
                              className="text-slate-400 hover:text-slate-600 font-bold text-base p-1 cursor-pointer transition-colors"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Excel Stats Sheet style preview inside card */}
                          <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-center">
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">পঠিত সংখ্যা</p>
                              <p className="text-sm font-black text-slate-800 font-mono">👁️ {viewingArticleForWriter.reads || 0} বার</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">অ্যাড টু প্রিন্ট</p>
                              <p className="text-sm font-black text-slate-800 font-mono">🖨️ {viewingArticleForWriter.printCount ?? (Math.floor((viewingArticleForWriter.reads || 0) / 8) + 2)} বার</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 text-amber-600">কয়েন আর্নিং</p>
                              <p className="text-sm font-black text-amber-600 font-mono">🪙 {viewingArticleForWriter.earnedCoins ?? ((viewingArticleForWriter.requiredCoins || 0) * Math.floor((viewingArticleForWriter.reads || 0) * 0.4))}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 text-emerald-600">টাকা আর্নিং</p>
                              <p className="text-sm font-black text-emerald-600 font-mono">৳{viewingArticleForWriter.earnedCoins ?? ((viewingArticleForWriter.requiredCoins || 0) * Math.floor((viewingArticleForWriter.reads || 0) * 0.4))}</p>
                            </div>
                          </div>

                          {/* Scrollable full text */}
                          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap p-4 bg-slate-50 border border-slate-150 rounded-xl max-h-[300px] overflow-y-auto text-justify">
                            {viewingArticleForWriter.content}
                          </div>

                          {/* Detail Footer controls */}
                          <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                const art = viewingArticleForWriter;
                                setViewingArticleForWriter(null);
                                handleEditArticleClick(art);
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                লেখাটি এডিট করুন
                              </button>
                              <button
                                onClick={() => setViewingArticleForWriter(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                বন্ধ করুন
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-all text-gray-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-gray-800 text-lg">
                  {editingArticleId ? 'লেখা সম্পাদনা করুন' : 'নতুন কন্টেন্ট রচনা'}
                </h3>
              </div>

              {/* Preview Toggle */}
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="px-3.5 py-1.5 border border-indigo-500/30 hover:border-indigo-650 text-indigo-750 hover:bg-indigo-50/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                {isPreviewMode ? 'এডিট করুন' : 'প্রিভিউ দেখুন'}
              </button>
            </div>

            {!isPreviewMode ? (
              <form onSubmit={handlePublishArticle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">মূল ক্যাটাগরি *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 bg-white"
                    >
                      <option value="সাহিত্য">সাহিত্য</option>
                      <option value="বিজ্ঞান">বিজ্ঞান</option>
                      <option value="রাজনীতি">রাজনীতি</option>
                      <option value="অর্থনীতি">অর্থনীতি</option>
                      <option value="ধর্ম">ধর্ম</option>
                      <option value="দর্শন">দর্শন</option>
                    </select>
                  </div>

                  {/* Sub-category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">সাব-ক্যাটাগরি বা বিষয়</label>
                    <input
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="যেমন: অনুগল্প, রোবোটিক্স, সামষ্টিক অর্থনীতি"
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="যেমন: কবিতা, প্রবন্ধ, হকিং, বাজেট"
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  {/* Required Coins */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      কয়েনের মূল্য (০-ফ্রি)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={requiredCoins}
                      onChange={(e) => setRequiredCoins(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="যেমন: ২০০"
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono font-bold text-amber-600"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">রচনার আকর্ষণীয় শিরোনাম *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="যেমন: বাঙালির কদম উৎসব ও কিছু বৃষ্টির স্মৃতি"
                    className="w-full p-3 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder-slate-400"
                  />
                </div>

                {/* Rich Editor Controls */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-600">মূল প্রবন্ধ/লেখা লিখুন *</label>
                    <span className="text-[10px] text-gray-400 font-mono">
                      শব্দ সংখ্যা: {content.split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200/60 text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleFormat('bold')}
                        className="p-1 px-2 rounded-sm hover:bg-gray-200 hover:text-gray-800 transition-all text-xs font-bold flex items-center gap-1"
                        title="রচনার অংশটি বোল্ড করুন"
                      >
                        <Bold className="w-3.5 h-3.5" />
                        বোল্ড
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat('heading')}
                        className="p-1 px-2 rounded-sm hover:bg-gray-200 hover:text-gray-800 transition-all text-xs font-bold flex items-center gap-1"
                        title="রচনার অংশটিকে হেডিং করুন"
                      >
                        <Heading className="w-3.5 h-3.5" />
                        হেডিং
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat('quote')}
                        className="p-1 px-2 rounded-sm hover:bg-gray-200 hover:text-gray-800 transition-all text-xs font-bold flex items-center gap-1"
                        title="ব্লক কোটেশন"
                      >
                        <Quote className="w-3.5 h-3.5" />
                        কোটেশন
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat('p')}
                        className="p-1 px-2 rounded-sm hover:bg-gray-200 hover:text-gray-800 transition-all text-xs font-bold"
                        title="নতুন প্যারাগ্রাফ"
                      >
                        প্যারাগ্রাফ
                      </button>
                    </div>

                    <textarea
                      id="editor-textarea"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={14}
                      placeholder="এখানে আপনার সম্পূর্ণ লেখাটি গুছিয়ে লিখুন। এডিটর হেডার টুলবার দিয়ে চমৎকার ফরম্যাটিং করতে পারবেন। লেখার সুরক্ষায় সিস্টেমটি বাংলা ভাষা চমৎকারভাবে প্রসেস করে।"
                      className="w-full p-4 text-xs md:text-sm text-gray-700 focus:outline-hidden leading-relaxed resize-y min-h-[250px]"
                    />
                  </div>
                </div>

                {/* Publish status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-600">পাবলিশিং স্ট্যাটাস:</span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-705 cursor-pointer">
                      <input
                        type="radio"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      সরাসরি পাবলিশ (সবাই পড়ার সুযোগ পাবেন)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-705 cursor-pointer">
                      <input
                        type="radio"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      ড্রাফট (নিজের কাছে পরে রাখার জন্য)
                    </label>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                    >
                      ড্যাশবোর্ডে ফিরে যান
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      {status === 'published' ? <Send className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      {editingArticleId ? 'সংরক্ষণ ও পরিবর্তন' : status === 'published' ? 'পাবলিশ করুন' : 'ড্রাফট সেভ করুন'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Visual Preview */}
                <div className="bg-amber-50/20 border border-amber-500/10 p-4 rounded-xl">
                  <p className="text-[11px] text-amber-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    ব্যবহারকারীদের কাছে যেভাবে আপনার প্রবন্ধটি প্রদর্শিত হবে, তার একটি সুন্দর লাইভ মকআপ:
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6 max-w-2xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-750 text-[10px] font-bold rounded-full">
                        {category}
                      </span>
                      {subCategory && (
                        <span className="text-[10px] text-slate-500 font-medium">/{subCategory}</span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {title || 'শিরোনাম নেই'}
                    </h1>

                    <div className="flex items-center gap-2.5 py-2">
                      <img src={currentWriter.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{currentWriter.name}</p>
                        <p className="text-[10px] text-slate-500">তারিখ: আজ  •  {content.split(/\s+/).filter(Boolean).length} শব্দ</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="text-sm md:text-base text-slate-700 space-y-4 leading-relaxed text-justify border-t border-slate-100 pt-5 pr-1 font-sans"
                    dangerouslySetInnerHTML={{ 
                      __html: content 
                        ? content.replace(/\n/g, '<br />')
                        : '<p class="text-slate-400 italic">লেখাটি ফাঁকা রয়েছে...</p>'
                    }}
                  />

                  {tagInput && (
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
                      {tagInput.split(',').map((t, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm text-xs font-mono">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(false)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    প্রিভিউ থেকে ড্রাফট এডিটরে ফিরে যান
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
