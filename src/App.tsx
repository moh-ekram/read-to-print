/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Writer, Article, CartItem, Order } from './types';
import { INITIAL_WRITERS, INITIAL_ARTICLES } from './data';
import WriterPanel from './components/WriterPanel';
import ReaderPanel from './components/ReaderPanel';
import AdminPanel from './components/AdminPanel';
import { BookOpen, User, Shield, Printer, Info, HelpCircle, FileText, ChevronRight, Lock, Unlock, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Roles switcher state: 'reader' | 'writer' | 'admin'
  const [userRole, setUserRole] = useState<'reader' | 'writer' | 'admin'>('reader');

  // Admin authentication and modal states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('r2p_admin_authenticated') === 'true';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');

  const handleAdminTabClick = () => {
    if (isAdminAuthenticated) {
      setUserRole('admin');
    } else {
      setAdminPasswordInput('');
      setAdminLoginError('');
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin2026';
    if (adminPasswordInput === correctPassword) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('r2p_admin_authenticated', 'true');
      setShowAdminLoginModal(false);
      setUserRole('admin');
      setAdminPasswordInput('');
      setAdminLoginError('');
    } else {
      setAdminLoginError('ভুল পাসকোড! দয়া করে সঠিক অ্যাডমিন পাসকোডটি প্রদান করুন।');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('r2p_admin_authenticated');
    setUserRole('reader');
  };

  // Load state from localStorage or fallback
  const [writers, setWriters] = useState<Writer[]>(() => {
    const saved = localStorage.getItem('r2p_writers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length < INITIAL_WRITERS.length) {
        return INITIAL_WRITERS;
      }
      return parsed;
    }
    return INITIAL_WRITERS;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('r2p_articles');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length < INITIAL_ARTICLES.length) {
        return INITIAL_ARTICLES;
      }
      return parsed;
    }
    return INITIAL_ARTICLES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('r2p_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedArticles, setSavedArticles] = useState<string[]>(() => {
    const saved = localStorage.getItem('r2p_saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [customFolders, setCustomFolders] = useState<{ [key: string]: string[] }>(() => {
    const saved = localStorage.getItem('r2p_folders');
    return saved ? JSON.parse(saved) : {};
  });

  // Prepopulate an initial historic completed order so stats & Admin dashboard are filled out on first load!
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('r2p_orders');
    if (saved) return JSON.parse(saved);

    const initialOrder: Order = {
      id: 'R2P-843212',
      customerName: 'মাসুদ রানা',
      phone: '01819234567',
      address: '১৬/এ, মিরপুর রোড, ধানমন্ডি, ঢাকা',
      city: 'Dhaka',
      cartItems: [
        {
          articleId: 'a1',
          articleTitle: 'মেঘে ঢাকা তারার অন্তরালে: কৃষ্ণগহ্বরের রহস্য',
          writerName: 'ড. ফারহানা ইয়াসমিন',
          wordCount: 165,
          content: ''
        },
        {
          articleId: 'a2',
          articleTitle: 'বাঙালির বর্ষাবরণ ও আমাদের মনস্তাত্ত্বিক রূপান্তর',
          writerName: 'রবীন্দ্রনাথ দত্ত',
          wordCount: 154,
          content: ''
        }
      ],
      totalPages: 4, // 2 content + 2 cover/toc
      pageCost: 6.0,
      bindingCost: 20.0,
      deliveryCost: 60.0,
      totalCost: 86.0,
      paymentMethod: 'bkash',
      paymentStatus: 'paid',
      orderDate: '2026-06-19',
      status: 'Delivered'
    };

    return [initialOrder];
  });

  const [readerCoins, setReaderCoins] = useState<number>(() => {
    const saved = localStorage.getItem('r2p_reader_coins');
    return saved ? Number(saved) : 50; // Give readers 50 coins initially to try out unlocking!
  });

  const [unlockedArticles, setUnlockedArticles] = useState<string[]>(() => {
    const saved = localStorage.getItem('r2p_unlocked_articles');
    return saved ? JSON.parse(saved) : [];
  });

  const [platformRevenue, setPlatformRevenue] = useState<number>(() => {
    const saved = localStorage.getItem('r2p_platform_revenue');
    if (saved) return Number(saved);
    // Rabindranath Dutta initial 450 + Farhana Yasmin initial 1200 = 1650.
    // 25% of that is 412 coins initially.
    return 412;
  });

  const [writerApplications, setWriterApplications] = useState<any[]>(() => {
    const saved = localStorage.getItem('r2p_writer_applications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'app-1',
        name: 'কাজী নজরুল ইসলাম',
        bKashNumber: '01712000222',
        bio: 'সৃজনশীল লেখনি ও অন্যায় শোষণের বিরুদ্ধে কলাম লিখতে আগ্রহী একজন উদ্যমী কলামিস্ট।',
        address: 'বাড়ি ২২, মিরপুর, ঢাকা',
        sampleTitle1: 'বিদ্রোহী মনস্তত্ত্ব ও মুক্তিসংগ্রাম',
        sampleContent1: 'সমাজ সর্বদা একটি পরিবর্তনের সন্ধিক্ষণে অবস্থান করে। আমাদের কলমকে শক্তিশালী আস্ত্র করতে হবে যাতে দরিদ্র ও সাধারণ মানুষ তাদের অধিকার ফিরে পায় এবং সত্যের মুখোমুখি হতে পারে।',
        sampleCategory1: 'রাজনীতি',
        sampleTitle2: 'নতুন যৌবনের গান',
        sampleContent2: 'তরুণদের উদ্দাম গতিশীলতাই যেকোনো স্থবির জাতিকে জাগিয়ে তুলতে পারে। তাই আমাদের প্রতিটি চিন্তাশীল লেখায় তরুণ উদ্দীপনাকে একাত্ন করে দিতে হবে।',
        sampleCategory2: 'সাহিত্য',
        status: 'pending',
        submittedAt: '2026-06-21'
      }
    ];
  });

  // Simple hardcoded active writer context for simulation
  const currentWriter = writers[0]; // রবীন্দ্রনাথ দত্ত

  const handleAwardCoinsToWriter = (writerId: string, amount: number) => {
    const commission = Math.round(amount * 0.25);
    const netAmount = amount - commission;

    setWriters(prev => prev.map(w => {
      if (w.id === writerId) {
        return {
          ...w,
          coinBalance: (w.coinBalance || 0) + netAmount
        };
      }
      return w;
    }));

    setPlatformRevenue(prev => {
      const updated = prev + commission;
      localStorage.setItem('r2p_platform_revenue', String(updated));
      return updated;
    });
  };

  const handleApproveApplication = (appId: string) => {
    const app = writerApplications.find(a => a.id === appId);
    if (!app) return;

    // 1. Create new Writer profile
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    const newWriterId = 'w-' + Date.now();
    const newWriter = {
      id: newWriterId,
      name: app.name,
      username: `writer_${app.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomSuffix}`,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      bio: app.bio,
      followers: 0,
      coinBalance: 0
    };

    // 2. Create the two sample papers as active published articles
    const art1 = {
      id: 'art-' + Date.now() + '-1',
      title: app.sampleTitle1,
      content: app.sampleContent1,
      category: app.sampleCategory1,
      subCategory: 'নতুন কলাম',
      tags: ['নবাগত', app.sampleCategory1],
      writerId: newWriterId,
      writerName: app.name,
      writerAvatar: newWriter.avatar,
      status: 'published' as const,
      createdAt: '2026-06-21',
      reads: 2,
      wordCount: app.sampleContent1.length
    };

    const art2 = {
      id: 'art-' + Date.now() + '-2',
      title: app.sampleTitle2,
      content: app.sampleContent2,
      category: app.sampleCategory2,
      subCategory: 'নতুন কলাম',
      tags: ['নবাগত', app.sampleCategory2],
      writerId: newWriterId,
      writerName: app.name,
      writerAvatar: newWriter.avatar,
      status: 'published' as const,
      createdAt: '2026-06-21',
      reads: 1,
      wordCount: app.sampleContent2.length
    };

    // 3. Update active states
    setWriters(prev => [...prev, newWriter]);
    setArticles(prev => [art1, art2, ...prev]);
    setWriterApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));

    alert(`সাফল্য! আবেদনকারী "${app.name}"-কে লেখক হিসেবে অনুমোদন দেওয়া হয়েছে এবং তার ২টি নমুনা লেখা সরাসরি হোমপেজে প্রকাশিত হয়েছে।`);
  };

  const handleRejectApplication = (appId: string) => {
    setWriterApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a));
    alert('আবেদনটি বাতিল করা হয়েছে।');
  };

  const handleAddWriterApplication = (newApp: any) => {
    setWriterApplications(prev => [newApp, ...prev]);
  };


  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('r2p_writers', JSON.stringify(writers));
  }, [writers]);

  useEffect(() => {
    localStorage.setItem('r2p_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('r2p_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('r2p_saved', JSON.stringify(savedArticles));
  }, [savedArticles]);

  useEffect(() => {
    localStorage.setItem('r2p_folders', JSON.stringify(customFolders));
  }, [customFolders]);

  useEffect(() => {
    localStorage.setItem('r2p_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('r2p_writer_applications', JSON.stringify(writerApplications));
  }, [writerApplications]);

  useEffect(() => {
    localStorage.setItem('r2p_platform_revenue', String(platformRevenue));
  }, [platformRevenue]);


  // Handlers
  const handleUpdateWriter = (updatedWriter: Writer) => {
    setWriters(prev => prev.map(w => w.id === updatedWriter.id ? updatedWriter : w));
    // update author info on related articles
    setArticles(prev => prev.map(art => {
      if (art.writerId === updatedWriter.id) {
        return {
          ...art,
          writerName: updatedWriter.name,
          writerAvatar: updatedWriter.avatar
        };
      }
      return art;
    }));
  };

  const handleAddArticle = (newArticle: Article) => {
    setArticles(prev => [newArticle, ...prev]);
  };

  const handleUpdateArticle = (id: string, updatedFields: Partial<Article>) => {
    setArticles(prev => prev.map(art => art.id === id ? { ...art, ...updatedFields } as Article : art));
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(prev => prev.filter(art => art.id !== id));
    // Also remove from saved list and cart
    setSavedArticles(prev => prev.filter(artId => artId !== id));
    setCart(prev => prev.filter(item => item.articleId !== id));
  };

  const handleToggleSaveArticle = (artId: string, folderName?: string) => {
    if (!folderName || folderName === 'Read Later') {
      setSavedArticles(prev => {
        if (prev.includes(artId)) {
          return prev.filter(id => id !== artId);
        } else {
          return [...prev, artId];
        }
      });
    } else {
      setCustomFolders(prev => {
        const currentFolder = prev[folderName] || [];
        let updatedFolder;
        if (currentFolder.includes(artId)) {
          updatedFolder = currentFolder.filter(id => id !== artId);
        } else {
          updatedFolder = [...currentFolder, artId];
        }

        const newFolders = { ...prev, [folderName]: updatedFolder };
        // Clean empty folders
        if (updatedFolder.length === 0) {
          delete newFolders[folderName];
        }
        return newFolders;
      });
    }
  };

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      if (prev.some(i => i.articleId === item.articleId)) return prev;
      return [...prev, item];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.articleId !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status } : ord));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Professional Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 backdrop-blur-md shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Printer className="w-5 h-5 stroke-2" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">read2print</h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide block">প্রকাশ করুন • সাজান • নিজের বই প্রিন্ট করুন</span>
            </div>
          </div>

          {/* User Role Switcher Controls */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setUserRole('reader')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'reader'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              হোম পেজ
            </button>
            <button
              onClick={handleAdminTabClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'admin'
                  ? 'bg-white text-indigo-750 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isAdminAuthenticated ? (
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
              )}
              অ্যাডমিন প্যানেল
            </button>
            
            {isAdminAuthenticated && (
              <button
                onClick={handleAdminLogout}
                className="p-1 px-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200/50 transition-colors flex items-center gap-1"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Hero Guidelines Informer Card */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse shrink-0" />
            <p>
              <b>লাইভ সিমুলেশন মোড:</b> আপনি যেকোনো প্যানেল নির্বাচন করে সম্পূর্ণ লাইভ ইন্টারেকশন টেস্ট করতে পারবেন।
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs">
              চলতি ভূমিকা: {userRole === 'reader' ? 'পাঠক (Reader)' : 'ম্যানেজমেন্ট (Admin)'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-400">বিকাশ/নগদ/কার্ড গেটওয়ে লাইভ টেস্টেড</span>
          </div>
        </div>
      </div>

      {/* Main Dynamic Workspace Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={userRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {userRole === 'reader' && (
              <ReaderPanel
                articles={articles}
                writers={writers}
                cart={cart}
                savedArticles={savedArticles}
                customFolders={customFolders}
                onToggleSaveArticle={handleToggleSaveArticle}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onPlaceOrder={handlePlaceOrder}
                readerCoins={readerCoins}
                setReaderCoins={setReaderCoins}
                unlockedArticles={unlockedArticles}
                setUnlockedArticles={setUnlockedArticles}
                onAwardCoinsToWriter={handleAwardCoinsToWriter}
                onAddWriterApplication={handleAddWriterApplication}
                writerApplications={writerApplications}
                currentWriter={currentWriter}
                onUpdateWriter={handleUpdateWriter}
                onAddArticle={handleAddArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateArticle={handleUpdateArticle}
              />
            )}

            {userRole === 'admin' && (
              <AdminPanel
                orders={orders}
                articles={articles}
                writers={writers}
                onDeleteArticle={handleDeleteArticle}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                writerApplications={writerApplications}
                onApproveApplication={handleApproveApplication}
                onRejectApplication={handleRejectApplication}
                platformRevenue={platformRevenue}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer bar */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-2">
          <p className="font-bold text-gray-500">© 2026 read2print. অল রাইটস সংরক্ষিত।</p>
          <p className="max-w-xl mx-auto leading-relaxed scale-95 opacity-85">
            একটি সৃজনশীল প্ল্যাটফর্ম যেখানে লেখকেরা পান সাহিত্য প্রকাশের মুক্ত আকাশ এবং পাঠকেরা তাদের কাস্টম সিলেকশনকে সাজিয়ে পান সরাসরি সুদৃশ্য বাইন্ডিংযুক্ত বইয়ের চিরন্তন ছোঁয়া।
          </p>
        </div>
      </footer>

      {/* Admin Passcode Authentication Modal Overlay */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-sm w-full overflow-hidden"
            >
              {/* Header block */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-6 text-white text-center relative">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
                  <Lock className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold">অ্যাডমিন প্যানেল প্রবেশাধিকার</h3>
                <p className="text-xs text-indigo-200/85 mt-1">
                  এই প্যানেলটি প্ল্যাটফর্মের কর্মকর্তা ও কাস্টমার কো-অর্ডিনেটরদের জন্য সুরক্ষিত।
                </p>
              </div>

              {/* Input details inside a form */}
              <form onSubmit={handleAdminLoginSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="admin-passcode" className="text-xs font-bold text-slate-700 block">
                    সিকিউরিটি পাসকোড
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="admin-passcode"
                      type="password"
                      autoFocus
                      placeholder="অ্যাডমিন পাসকোড লিখুন"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans tracking-wide text-slate-800 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {adminLoginError && (
                  <p className="text-[11px] text-red-650 bg-red-50 p-2.5 rounded-lg font-medium leading-relaxed">
                    ⚠️ {adminLoginError}
                  </p>
                )}

                <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg space-y-1">
                  <p className="font-semibold text-slate-500">সহায়তা নোট:</p>
                  <p>• লোকাল পাসকোড: <code className="font-mono bg-slate-200 px-1 py-0.2 rounded text-slate-700">admin2026</code></p>
                  <p>• পরিবেশ ভ্যারিয়েবল দ্বারা Vercel এ <code className="font-mono bg-slate-200 px-1 py-0.2 rounded text-slate-700">VITE_ADMIN_PASSWORD</code> দিয়ে কাস্টম পাসকোড সেট করতে পারেন।</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginModal(false)}
                    className="flex-1 px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/60 rounded-xl text-xs font-bold transition-all"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    যাচাই করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
