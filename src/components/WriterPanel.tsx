import React, { useState } from 'react';
import { Article, Writer } from '../types';
import { FileText, Save, Send, Eye, Plus, Trash2, Edit3, Sparkles, BookOpen, User, ArrowLeft, Bold, Quote, Heading, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WriterPanelProps {
  currentWriter: Writer;
  articles: Article[];
  onUpdateWriter: (writer: Writer) => void;
  onAddArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onUpdateArticle: (id: string, article: Partial<Article>) => void;
}

export default function WriterPanel({
  currentWriter,
  articles,
  onUpdateWriter,
  onAddArticle,
  onDeleteArticle,
  onUpdateArticle
}: WriterPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'editor'>('profile');
  
  // Profile state
  const [authorName, setAuthorName] = useState(currentWriter.name);
  const [authorBio, setAuthorBio] = useState(currentWriter.bio);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Writer Stats & Bio Editing */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
                <div className="text-center">
                  <div className="relative inline-block">
                    <img 
                      src={currentWriter.avatar} 
                      alt={currentWriter.name} 
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-indigo-500 p-1 shadow-md"
                    />
                    <span className="absolute bottom-1 right-1 bg-indigo-600 text-white rounded-full p-1.5 shadow-md">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-slate-800 text-lg">{currentWriter.name}</h3>
                  <p className="text-xs text-slate-400">@{currentWriter.username}</p>
                </div>

                <div className="grid grid-cols-3 gap-1 text-center py-2 border-y border-slate-100">
                  <div className="border-r border-slate-100">
                    <p className="text-base font-bold text-indigo-600 font-mono">{writerArticles.length}</p>
                    <p className="text-[10px] text-slate-500">মোট রচনা</p>
                  </div>
                  <div className="border-r border-slate-100">
                    <p className="text-base font-bold text-indigo-600 font-mono">{currentWriter.followers}</p>
                    <p className="text-[10px] text-gray-500">অনুগামী</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-amber-600 font-mono">{currentWriter.coinBalance || 0}</p>
                    <p className="text-[10px] text-amber-500 font-semibold flex items-center justify-center gap-0.5">
                      <Coins className="w-2.5 h-2.5" />
                      কয়েন আয়
                    </p>
                  </div>
                </div>

                {!isEditingProfile ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ছোট বায়ো</h4>
                      <p className="text-[13px] text-gray-600 leading-relaxed text-justify bg-gray-50/50 p-3 rounded-lg border border-dashed border-gray-200">
                        {currentWriter.bio || 'কোনো বায়ো এখনো যোগ করা হয়নি। নিচে এডিট করতে পারেন।'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      প্রোফাইল এডিট করুন
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">নাম</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        required
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">বায়ো</label>
                      <textarea
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                        rows={4}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                        placeholder="আপনার বায়ো বলুন..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        সংরক্ষণ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Writer's Published Articles Timeline */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    প্রকাশিত রচনার টাইমলাইন
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-sm font-mono">
                    {writerArticles.length} টি লেখা
                  </span>
                </div>

                {writerArticles.length === 0 ? (
                  <div className="text-center py-12 text-slate-405 space-y-3">
                    <BookOpen className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
                    <p className="text-sm">আপনার কোনো লেখা এখনো খুঁজে পাওয়া যায়নি।</p>
                    <button
                      onClick={handleStartNewArticle}
                      className="px-4 py-2 bg-indigo-50 text-indigo-750 rounded-full text-xs font-semibold hover:bg-indigo-100/70"
                    >
                      প্রথম লেখা লিখুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 divide-y divide-gray-50">
                    {writerArticles.map((art) => (
                      <div key={art.id} className="pt-4 first:pt-0 group">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-750 text-[10px] font-bold rounded-full">
                                {art.category}
                              </span>
                              {art.subCategory && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  / {art.subCategory}
                                </span>
                              )}
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                                art.status === 'published' 
                                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                                  : 'bg-amber-50 text-amber-700 font-semibold'
                              }`}>
                                {art.status === 'published' ? 'পাবলিশড' : 'ড্রাফট'}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-650 transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                              <span>তারিখ: {art.createdAt}</span>
                              <span>•</span>
                              <span className="font-mono">{art.wordCount} শব্দ</span>
                              <span>•</span>
                              <span>পঠিত: {art.reads} বার</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditArticleClick(art)}
                              className="p-1 px-2.5 rounded-md hover:bg-slate-50 text-slate-600 hover:text-indigo-600 text-xs font-semibold transition-all flex items-center gap-1"
                              title="সম্পাদনা"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              এডিট
                            </button>
                            <button
                              onClick={() => onDeleteArticle(art.id)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-all"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 line-clamp-2 bg-gray-50/40 p-2.5 rounded-lg border border-gray-100/50">
                          {art.content.replace(/<[^>]*>/g, '')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
