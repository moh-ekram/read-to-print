import React, { useState, useEffect } from 'react';
import { Article, Order, Writer, WriterApplication, ReaderUser, PayoutRequest } from '../types';
import { 
  BarChart, Package, Users, AlertTriangle, Check, BookOpen, Clock, 
  MapPin, Phone, Download, Printer, ShieldAlert, Trash2, Eye, FileText, 
  Trophy, TrendingUp, CheckCircle, RefreshCcw, Shield, CheckCircle2, XCircle, Search, Sparkles, Coins, User as UserIcon, Wallet, ArrowRight, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  orders: Order[];
  articles: Article[];
  writers: Writer[];
  onDeleteArticle: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  writerApplications: WriterApplication[];
  onApproveApplication: (appId: string) => void;
  onRejectApplication: (appId: string) => void;
  platformRevenue: number;
  readers?: ReaderUser[];
  setReaders?: React.Dispatch<React.SetStateAction<ReaderUser[]>>;
  onUpdateArticle?: (id: string, updatedFields: Partial<Article>) => void;
  payoutRequests?: PayoutRequest[];
  onApprovePayout?: (requestId: string) => void;
  onMonthlySettlement?: (poolAmount: number) => void;
}

export default function AdminPanel({
  orders,
  articles,
  writers,
  onDeleteArticle,
  onUpdateOrderStatus,
  writerApplications = [],
  onApproveApplication,
  onRejectApplication,
  platformRevenue,
  readers = [],
  setReaders,
  onUpdateArticle,
  payoutRequests = [],
  onApprovePayout,
  onMonthlySettlement
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'content-moderation' | 'writer-list' | 'writer-requests'>('orders');
  
  // States
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [isPreviewingPrintReadyBook, setIsPreviewingPrintReadyBook] = useState<Order | null>(null);
  const [adminUserListTab, setAdminUserListTab] = useState<'writers' | 'readers'>('writers');
  const [adminUserSearchQuery, setAdminUserSearchQuery] = useState('');
  const [selectedUserDetailInAdmin, setSelectedUserDetailInAdmin] = useState<{type: 'writer' | 'reader', data: any} | null>(null);
  const [settlementPoolAmount, setSettlementPoolAmount] = useState<number>(() => {
    return writers.reduce((sum, w) => sum + (w.monthly_coins || 0), 0) || 5000;
  });

  const [closingReports, setClosingReports] = useState<any[]>([]);
  const [selectedReportDetail, setSelectedReportDetail] = useState<any | null>(null);

  const fetchClosingReports = async () => {
    try {
      const res = await fetch('/api/admin/closing-reports');
      if (res.ok) {
        const data = await res.json();
        setClosingReports(data);
      }
    } catch (err) {
      console.error("Error fetching closing reports:", err);
    }
  };

  useEffect(() => {
    fetchClosingReports();
  }, []);

  const MOCK_READERS = [
    { id: 'usr-1', name: 'মোঃ হাসিবুর রহমান', username: 'hasib_99', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', currentCoins: 120, spentAmount: 150, totalCoinsPurchased: 300, printCartCount: 2, bio: 'বই পড়তে ভালোবাসি, বিশেষ করে বিজ্ঞান ও প্রযুক্তি বিষয়ক কলাম।', savedArticlesCount: 5 },
    { id: 'usr-2', name: 'সাফিয়া পারভীন', username: 'safia_p', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', currentCoins: 45, spentAmount: 50, totalCoinsPurchased: 100, printCartCount: 0, bio: 'কলামিস্টদের নিয়মিত সামাজিক প্রবন্ধগুলো পড়তে ভালো লাগে।', savedArticlesCount: 8 },
    { id: 'usr-3', name: 'আরিফ রায়হান', username: 'raihan_arif', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', currentCoins: 350, spentAmount: 300, totalCoinsPurchased: 600, printCartCount: 5, bio: 'সাহিত্য ও অর্থনীতির মেলবন্ধন আমার লেখার প্রতি আকর্ষণ সৃষ্টি করেছে।', savedArticlesCount: 12 },
    { id: 'usr-4', name: 'তানজিনা আক্তার লিমা', username: 'tanjina_lima', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', currentCoins: 15, spentAmount: 20, totalCoinsPurchased: 50, printCartCount: 1, bio: 'ইতিহাস ও রাজনীতি বিশ্লেষণী কলামের একনিষ্ঠ পাঠক।', savedArticlesCount: 3 },
    { id: 'usr-5', name: 'শাফায়েত হোসেন জিসান', username: 'shafayet_jisan', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', currentCoins: 90, spentAmount: 100, totalCoinsPurchased: 200, printCartCount: 0, bio: 'সৃজনশীল লেখার মাধ্যমে সমাজ পরিবর্তনের প্রতি বিশ্বস্ত কলাম পাঠক।', savedArticlesCount: 7 }
  ];

  // Stats Counters
  const totalCompletedOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalEarnings = orders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalPrintedA4Pages = orders.reduce((sum, o) => sum + o.totalPages, 0);

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-105 text-blue-800 border-blue-200';
      case 'Printing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delivered':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const handleDownloadSimulation = (order: Order) => {
    alert(`নথি কম্পাইলেশন সফল!\nকাস্টম বই "${order.cartItems[0]?.articleTitle || 'সংকলন'}..." এর "প্রিন্ট-রেডি" হাই-রেজোলিউশন পিডিএফ ফাইল ডাউনলোড শুরু হচ্ছে।`);
  };

  return (
    <div className="space-y-6" id="admin-panel">
      
      {/* read2print commission revenue overview */}
      <div className="bg-transparent text-neutral-900 py-4 border-b border-neutral-300 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
            <span>[রেভিনিউ মডারেশন]</span>
            <span>-</span>
            <span>প্ল্যাটফর্ম রাজস্ব অ্যাকাউন্ট</span>
          </div>
          <h3 className="text-base font-bold text-neutral-950">মডারেশন ও রাজস্ব রিপোর্টিং</h3>
          <p className="text-xs text-neutral-500 leading-normal max-w-2xl">
            নীতিমালা অনুযায়ী প্রতিটি কয়েন উপার্জনের (আনলক ও উপহার) ২৫% কমিশন প্ল্যাটফর্ম ফান্ডে জমা হয়।
          </p>
        </div>
        <div className="bg-[#faf9f6]/80 rounded-md px-4 py-2 border border-neutral-300 text-center shrink-0 min-w-[200px]">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">রিসার্ভ কমিশন ব্যালেন্স</p>
          <span className="text-2xl font-black text-neutral-950 font-serif flex items-center justify-center gap-1 mt-1">
            🪙 {platformRevenue} কয়েন
          </span>
          <p className="text-[10px] text-neutral-450 mt-0.5 font-mono">৳{(platformRevenue * 1.0).toFixed(1)} টাকা সমপরিমাণ</p>
        </div>
      </div>

      {/* Top Admin Status Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#faf9f6]/50 p-4 border border-neutral-300">
          <p className="text-[10px] text-neutral-455 font-bold uppercase font-mono tracking-widest">কাস্টম অর্ডার</p>
          <h3 className="text-xl font-black text-neutral-950 font-mono mt-1">{orders.length}</h3>
          <span className="text-[9px] text-neutral-400 font-mono block border-t border-neutral-200 mt-1.5 pt-0.5">মোট রিসিভড</span>
        </div>

        <div className="bg-[#faf9f6]/50 p-4 border border-neutral-300">
          <p className="text-[10px] text-neutral-455 font-bold uppercase font-mono tracking-widest">রেভিনিউ</p>
          <h3 className="text-xl font-black text-neutral-950 font-mono mt-1">{totalEarnings.toFixed(1)} ৳</h3>
          <span className="text-[9px] text-neutral-400 font-mono block border-t border-neutral-200 mt-1.5 pt-0.5 font-sans">সব পেমেন্ট</span>
        </div>

        <div className="bg-[#faf9f6]/50 p-4 border border-neutral-300">
          <p className="text-[10px] text-neutral-455 font-bold uppercase font-mono tracking-widest">মুদ্রিত A4 পৃষ্ঠা</p>
          <h3 className="text-xl font-black text-neutral-950 font-mono mt-1">{totalPrintedA4Pages}</h3>
          <span className="text-[9px] text-neutral-400 font-mono block border-t border-neutral-200 mt-1.5 pt-0.5">সংকলনে প্রিন্ট</span>
        </div>

        <div className="bg-[#faf9f6]/50 p-4 border border-neutral-300">
          <p className="text-[10px] text-neutral-455 font-bold uppercase font-mono tracking-widest">প্রবন্ধ প্রকাশ</p>
          <h3 className="text-xl font-black text-neutral-950 font-mono mt-1">
            {articles.filter(a => a.status === 'published').length} টি
          </h3>
          <span className="text-[9px] text-neutral-400 font-mono block border-t border-neutral-200 mt-1.5 pt-0.5">লাইভ কলাম</span>
        </div>
      </div>

      {/* Admin Panel Nav tabs */}
      <div className="flex flex-wrap border-b border-neutral-300 items-center gap-x-4 gap-y-1.5 py-1 text-xs">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`py-2 px-1 transition-all ${
            activeSubTab === 'orders' 
              ? 'text-neutral-950 border-b-2 border-neutral-950 font-black' 
              : 'text-neutral-450 hover:text-neutral-950'
          }`}
        >
          [ অর্ডারসমূহ ({orders.length}) ]
        </button>
        <span className="text-neutral-300">/</span>
        <button
          onClick={() => setActiveSubTab('content-moderation')}
          className={`py-2 px-1 transition-all ${
            activeSubTab === 'content-moderation' 
              ? 'text-neutral-950 border-b-2 border-neutral-950 font-black' 
              : 'text-neutral-455 hover:text-neutral-950'
          }`}
        >
          কন্টেন্ট মডারেশন
        </button>
        <span className="text-neutral-300">/</span>
        <button
          onClick={() => setActiveSubTab('writer-list')}
          className={`py-2 px-1 transition-all ${
            activeSubTab === 'writer-list' 
              ? 'text-neutral-950 border-b-2 border-neutral-950 font-black' 
              : 'text-neutral-455 hover:text-neutral-950'
          }`}
        >
          লেখক ও ইউজার
        </button>
        <span className="text-neutral-300">/</span>
        <button
          onClick={() => setActiveSubTab('writer-requests')}
          className={`py-2 px-1 transition-all ${
            activeSubTab === 'writer-requests' 
              ? 'text-neutral-950 border-b-2 border-neutral-950 font-black' 
              : 'text-neutral-455 hover:text-neutral-950'
          }`}
        >
          আবেদনপত্র ({writerApplications.filter(a => a.status === 'pending').length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Orders block */}
        {activeSubTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-500">
                <Clock className="w-12 h-12 stroke-1 mx-auto text-gray-350" />
                <p className="text-sm mt-3">এখনো কোনো কাস্টম প্রিন্ট অর্ডারের তথ্য নেই।</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs font-bold border-b border-gray-100">
                        <th className="p-4">অর্ডার আইডি</th>
                        <th className="p-4">গ্রাহক ও যোগাযোগ</th>
                        <th className="p-4">বইয়ের বিবরণ</th>
                        <th className="p-4">মূল্য হিসাব</th>
                        <th className="p-4">প্রিন্টিং স্ট্যাটাস</th>
                        <th className="p-4 text-center">ইনভয়েস ও মক পিডিএফ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-gray-950">{ord.id}</td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-bold text-gray-800">{ord.customerName}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3" /> {ord.phone}
                            </p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 max-w-[180px] truncate" title={ord.address}>
                              <MapPin className="w-3 h-3 shrink-0" /> {ord.address} ({ord.city === 'Dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'})
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-gray-800">কাস্টম বুকলেট</p>
                            <span className="text-[10px] bg-indigo-50 text-indigo-800 px-1.5 py-0.2 rounded-full font-mono">
                              {ord.totalPages} পৃষ্ঠা (A4)
                            </span>
                            <div className="text-[10px] text-gray-400 mt-1 lines-clamp-1 max-w-[180px]">
                              আর্টিকেল: {ord.cartItems.map(c => c.articleTitle).join(', ')}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-indigo-700 font-mono">{ord.totalCost.toFixed(1)} ৳</p>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              ord.paymentStatus === 'paid' ? 'bg-indigo-50 text-indigo-800' : 'bg-red-50 text-red-800'
                            }`}>
                              {ord.paymentStatus === 'paid' ? 'Paid (পরিশোধিত)' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={ord.status}
                              onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                              className={`p-1 px-2 border rounded-full text-[11px] font-bold ${getOrderStatusBadge(ord.status)}`}
                            >
                              <option value="Received">Received (অর্ডার প্রাপ্ত)</option>
                              <option value="Printing">Printing (মুদ্রণাধীন)</option>
                              <option value="Shipped">Shipped (ডেলিভারিতে পাঠানো হয়েছে)</option>
                              <option value="Delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setIsPreviewingPrintReadyBook(ord)}
                                className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm shadow-indigo-100"
                                title="প্রিন্ট প্রিভিউ দেখুন"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                প্রিন্ট রেডি কভার ও বই প্রিভিউ
                              </button>
                              
                              <button
                                onClick={() => handleDownloadSimulation(ord)}
                                className="p-1.5 rounded-md hover:bg-gray-150 text-gray-500 hover:text-gray-800"
                                title="প্রিন্ট-রেডি পিডিএফ ডাউনলোড করুন"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Content Moderation / Spam filter block */}
        {activeSubTab === 'content-moderation' && (
          <motion.div
            key="moderation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-white p-5 rounded-xl border border-slate-150 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm">সমগ্র প্রকাশিত রচনা নিয়ন্ত্রণ প্যানেল (মডারেশন)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                এখানে প্ল্যাটফর্মের সমস্ত কলাম ও প্রবন্ধ ক্যাটালগ তালিকাভুক্ত রয়েছে। আপনি যেকোনো বাল্ক কন্টেন্ট হাইড বা স্থায়ীভাবে রিমুভ করতে পারবেন।
              </p>
            </div>

            {/* Quick search inside Content Moderation */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-205">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="রচনা খুঁজুন (টাইটেল বা লেখকের নাম)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none placeholder-slate-400 font-sans"
                  onChange={(e) => {
                    const term = e.target.value.toLowerCase();
                    const trs = document.querySelectorAll('#admin-moderation-table tbody tr');
                    trs.forEach((tr: any) => {
                      const text = tr.innerText.toLowerCase();
                      tr.style.display = text.includes(term) ? '' : 'none';
                    });
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-bold font-mono">মোট রচনা: {articles.length} টি</span>
            </div>

            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-4xs">
              <table id="admin-moderation-table" className="min-w-full divide-y divide-slate-150 text-left text-xs font-sans">
                <thead className="bg-slate-50 font-black text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">#</th>
                    <th className="px-4 py-3">টাইটেল ও ক্যাটাগরি</th>
                    <th className="px-4 py-3">লেখক</th>
                    <th className="px-4 py-3 text-center">শব্দ</th>
                    <th className="px-4 py-3 text-center">পঠিত</th>
                    <th className="px-4 py-3 text-center">কয়েন</th>
                    <th className="px-4 py-3 text-center">অবস্থা</th>
                    <th className="px-4 py-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400 italic">
                        কোনো প্রবন্ধ পোস্ট পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    articles.map((art, idx) => (
                      <tr key={art.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 line-clamp-1">{art.title}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{art.category} • {art.subCategory}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">{art.writerName}</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-500">{art.wordCount}</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-650">{art.reads || 0}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-amber-600">{art.requiredCoins || 0}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            art.hidden 
                              ? 'bg-rose-50 text-rose-650 border border-rose-100' 
                              : 'bg-emerald-50 text-emerald-650 border border-emerald-100'
                          }`}>
                            {art.hidden ? 'লুকায়িত' : 'প্রকাশিত'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center space-x-2 whitespace-nowrap">
                          {onUpdateArticle && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateArticle(art.id, { hidden: !art.hidden });
                                alert(art.hidden ? 'আর্টিকেলটি সফলভাবে সাধারণ পাঠকদের জন্য দৃশ্যমান করা হয়েছে।' : 'আর্টিকেলটি সাধারণ ফিড ও অনুসন্ধান থেকে সফলভাবে হাইড বা লুকানো হয়েছে।');
                              }}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                                art.hidden 
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' 
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                              }`}
                            >
                              {art.hidden ? 'আনহাইড' : 'হাইড করুন'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('আপনি কি নিশ্চিতভাবে এই রচনাটি ডিলিট করতে চান? এটি চিরতরে মুছে যাবে।')) {
                                onDeleteArticle(art.id);
                              }
                            }}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-md text-[10px] transition-all"
                          >
                            ডিলিট
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Writer List / User accounts block */}
        {activeSubTab === 'writer-list' && (
          <motion.div
            key="writers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 w-full"
          >
            {/* Search and Secondary Switch Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-205">
              <div className="flex bg-slate-200 p-0.5 rounded-lg gap-1 border border-slate-250">
                <button
                  type="button"
                  onClick={() => {
                    setAdminUserListTab('writers');
                    setAdminUserSearchQuery('');
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    adminUserListTab === 'writers'
                      ? 'bg-white text-slate-800 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  কলামিস্ট লেখকবৃন্দ ({writers.length} জন)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUserListTab('readers');
                    setAdminUserSearchQuery('');
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    adminUserListTab === 'readers'
                      ? 'bg-white text-slate-800 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  নিবন্ধিত পাঠক/ইউজার তালিকা ({readers.length || MOCK_READERS.length} জন)
                </button>
              </div>

              {/* Minimal Search Input */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={adminUserListTab === 'writers' ? 'লেখক খুঁজুন (নাম বা ইউজারনেম)...' : 'ইউজার খুঁজুন (নাম বা ইউজারনেম)...'}
                  value={adminUserSearchQuery}
                  onChange={(e) => setAdminUserSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 font-sans"
                />
              </div>
            </div>

            {adminUserListTab === 'writers' ? (
              <div className="space-y-4">
                {/* Monthly Closing & Writer Cashout Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Monthly Closing Panel */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Wallet className="w-5 h-5 text-indigo-650" />
                      <h4 className="font-extrabold text-slate-800 text-sm">মাসিক সেটেলমেন্ট ও ক্লোজিং (Settlement)</h4>
                    </div>

                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider font-sans">চলতি মাসের সর্বমোট কয়েন</p>
                          <p className="text-xl font-black text-indigo-700 font-mono mt-1">
                            🪙 {writers.reduce((sum, w) => sum + (w.monthly_coins !== undefined ? w.monthly_coins : (w.coinBalance || 0)), 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                          <p className="text-[10px] font-bold text-amber-650 uppercase tracking-wider font-sans">বন্টনযোগ্য বাজেট পুুল</p>
                          <p className="text-xl font-black text-amber-700 font-mono mt-1">
                            ৳{settlementPoolAmount}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500">চলতি মাসের রাইটার্স পুুল বাজেট (টাকা BDT)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={settlementPoolAmount}
                            onChange={(e) => setSettlementPoolAmount(Math.max(0, Number(e.target.value)))}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const totalCoins = writers.reduce((sum, w) => sum + (w.monthly_coins !== undefined ? w.monthly_coins : (w.coinBalance || 0)), 0);
                              setSettlementPoolAmount(totalCoins * 1.0); // Default 1 coin = 1 BDT
                            }}
                            className="px-2.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                          >
                            রিসেট (১:১)
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const totalCoins = writers.reduce((sum, w) => sum + (w.monthly_coins !== undefined ? w.monthly_coins : (w.coinBalance || 0)), 0);
                          if (totalCoins <= 0) {
                            alert('দুঃখিত! চলতি মাসে কোনো লেখকের কোনো নতুন রয়্যালটি কয়েন জমা হয়নি। মাসিক ক্লোজিং সম্ভব নয়।');
                            return;
                          }
                          if (confirm(`আপনি কি নিশ্চিতভাবে মাসিক সেটেলমেন্ট সম্পন্ন করতে চান?\n\nমোট কয়েন: ${totalCoins}\nমোট বাজেট: ৳${settlementPoolAmount}\n\nএটি সম্পন্ন হলে প্রতিটি লেখকের কয়েন অনুযায়ী BDT টাকা বন্টন হবে এবং সবার চলতি মাসের কয়েন ব্যালেন্স রিসেট হয়ে যাবে!`)) {
                            if (onMonthlySettlement) {
                              Promise.resolve(onMonthlySettlement(settlementPoolAmount)).then(() => {
                                setTimeout(fetchClosingReports, 1000);
                              });
                            }
                          }
                        }}
                        className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:scale-[1.01]"
                      >
                        মাসিক ক্লোজিং সম্পন্ন করুন
                      </button>
                    </div>
                  </div>

                  {/* Cashout Requests Panel */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-extrabold text-slate-800 text-sm">লেখকদের ক্যাশআউট রিকোয়েস্টসমূহ</h4>
                      </div>

                      <div className="space-y-1.5 overflow-y-auto max-h-[175px] pr-1">
                        {payoutRequests.length === 0 ? (
                          <div className="text-center py-10 text-slate-455 italic text-xs">
                            কোনো ক্যাশআউট আবেদন পেন্ডিং নেই।
                          </div>
                        ) : (
                          payoutRequests.map((req) => (
                            <div 
                              key={req.id} 
                              className={`p-2.5 rounded-xl border flex justify-between items-center text-xs transition-all ${
                                req.status === 'paid' 
                                  ? 'bg-slate-50/50 border-slate-150 opacity-80' 
                                  : 'bg-emerald-50/20 border-emerald-100 shadow-2xs'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-800">{req.writerName}</span>
                                  <span className="text-[10px] text-slate-455">@{req.writerUsername}</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500">
                                  {req.paymentMethod.toUpperCase()}: <span className="font-mono text-slate-700">{req.accountNumber}</span>
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono">{req.requestDate}</p>
                              </div>

                              <div className="text-right space-y-1.5 shrink-0">
                                <div className="font-extrabold text-emerald-600 font-mono text-sm">৳{req.amount}</div>
                                {req.status === 'pending' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`আপনি কি "${req.writerName}"-কে ${req.paymentMethod.toUpperCase()} (${req.accountNumber}) এর মাধ্যমে ৳${req.amount} টাকা পরিশোধ করেছেন?`)) {
                                        if (onApprovePayout) {
                                          onApprovePayout(req.id);
                                        }
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-md transition-all shadow-2xs"
                                  >
                                    পেমেন্ট সম্পন্ন করুন
                                  </button>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-sm">
                                    Paid
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Closing Reports Archive */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-indigo-650" />
                    <h4 className="font-extrabold text-slate-800 text-sm">মাসিক সেটেলমেন্ট ও ক্লোজিং রিপোর্ট আর্কাইভ (Archives)</h4>
                  </div>

                  {closingReports.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 italic text-xs">
                      এখনো কোনো সেটেলমেন্ট রিপোর্ট আর্কাইভে সংরক্ষিত নেই।
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {closingReports.map((report) => (
                        <div 
                          key={report.id} 
                          className="p-3 bg-slate-50 hover:bg-indigo-50/10 rounded-xl border border-slate-150 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-800 text-xs">{report.reportMonth}</span>
                              <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded-xs">
                                সংরক্ষিত
                              </span>
                            </div>
                            <div className="mt-2 space-y-1 text-[10px] text-slate-500">
                              <p className="flex justify-between">
                                <span>মোট কয়েন স্ন্যাপশট:</span>
                                <span className="font-mono font-bold text-slate-700">🪙 {report.totalCoins}</span>
                              </p>
                              <p className="flex justify-between">
                                <span>বন্টনকৃত বাজেট পুুল:</span>
                                <span className="font-mono font-bold text-emerald-600">৳{report.poolAmount}</span>
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono mt-1 text-right">
                                {new Date(report.createdAt).toLocaleString('bn-BD', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedReportDetail(report)}
                            className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 font-extrabold text-[10px] rounded-lg transition-all"
                          >
                            বিস্তারিত বন্টন দেখুন
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal for report details */}
                {selectedReportDetail && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">বিস্তারিত সেটেলমেন্ট রিপোর্ট</h4>
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{selectedReportDetail.reportMonth}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedReportDetail(null)}
                          className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-4 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 bg-indigo-50/40 rounded-lg border border-indigo-100">
                            <span className="text-[9px] text-slate-455 font-bold uppercase block">মোট স্ন্যাপশট কয়েন</span>
                            <span className="text-sm font-black text-indigo-600 font-mono mt-0.5 block">🪙 {selectedReportDetail.totalCoins}</span>
                          </div>
                          <div className="p-2 bg-emerald-50/40 rounded-lg border border-emerald-100">
                            <span className="text-[9px] text-slate-455 font-bold uppercase block">মোট বন্টনকৃত পুুল</span>
                            <span className="text-sm font-black text-emerald-600 font-mono mt-0.5 block">৳{selectedReportDetail.poolAmount}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-2">লেখক ভিত্তিক রাজস্ব বন্টন</span>
                          <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                            {(() => {
                              const details = typeof selectedReportDetail.distributionDetails === 'string'
                                ? JSON.parse(selectedReportDetail.distributionDetails)
                                : selectedReportDetail.distributionDetails;
                              
                              if (!Array.isArray(details) || details.length === 0) {
                                return <p className="text-[10px] italic text-slate-400">কোনো বন্টন তথ্য পাওয়া যায়নি।</p>;
                              }

                              return details.map((item: any) => (
                                <div key={item.id} className="p-2 bg-slate-50 rounded-lg border border-slate-150 flex justify-between items-center text-[11px]">
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-slate-800">{item.name}</span>
                                    <span className="text-[9px] text-slate-455 block">@{item.username}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono text-slate-600 block">🪙 {item.coins} কয়েন</span>
                                    <span className="font-mono font-black text-emerald-600 block text-xs">৳{item.shareBdt}</span>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedReportDetail(null)}
                          className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          বন্ধ করুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Writers Spreadsheet-like Table */}
                <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-4xs">
                  <table id="admin-writers-table" className="min-w-full divide-y divide-slate-100 text-left text-xs font-sans">
                    <thead className="bg-slate-50 font-black text-slate-700">
                      <tr>
                        <th className="px-4 py-2.5 text-center w-12 border-r border-slate-100">#</th>
                        <th className="px-4 py-2.5 border-r border-slate-100">নাম</th>
                        <th className="px-4 py-2.5 border-r border-slate-100">ইউজারনেম</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100">প্রকাশনা</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100">অনুসারী</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100 text-slate-500">লাইফটাইম কয়েন</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100 text-amber-600">চলতি মাসের কয়েন</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100 text-emerald-600">ব্যালেন্স (BDT)</th>
                        <th className="px-4 py-2.5 text-center">বিশদ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(() => {
                        const writersWithStats = writers.map((w) => {
                          const totalPubs = articles.filter(a => a.writerId === w.id).length;
                          // Sum up all coins of each writer's articles to calculate lifetime_coins dynamically
                          const articleCoins = articles
                            .filter(a => a.writerId === w.id)
                            .reduce((sum, a) => sum + (Number((a as any).coins) || Number(a.requiredCoins) || 0), 0);
                          const coins = articleCoins;
                          const monthlyCoins = w.monthly_coins !== undefined ? w.monthly_coins : (w.coinBalance || 0);
                          const balanceBdt = w.balance_bdt || 0;
                          const followers = w.followers || 0;
                          return {
                            ...w,
                            totalPubs,
                            coins,
                            monthlyCoins,
                            balanceBdt,
                            followers,
                          };
                        });

                        const filteredWritersForAdmin = writersWithStats.filter(w => 
                          w.name.toLowerCase().includes(adminUserSearchQuery.toLowerCase()) || 
                          w.username.toLowerCase().includes(adminUserSearchQuery.toLowerCase())
                        );

                        if (filteredWritersForAdmin.length === 0) {
                          return (
                            <tr>
                              <td colSpan={9} className="px-4 py-12 text-center text-slate-400 italic">
                                কোনো লেখক অ্যাকাউন্ট মিল পাওয়া যায়নি।
                              </td>
                            </tr>
                          );
                        }

                        return filteredWritersForAdmin.map((w, index) => (
                          <tr 
                            key={w.id} 
                            onClick={() => setSelectedUserDetailInAdmin({ type: 'writer', data: w })}
                            className="hover:bg-indigo-50/20 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-2 text-center font-mono text-slate-400 font-bold border-r border-slate-100">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 font-extrabold text-slate-800 border-r border-slate-100">
                              <div className="flex items-center gap-2">
                                <img src={w.avatar} alt="" className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100" />
                                <div className="flex flex-col">
                                  <span>{w.name}</span>
                                  <span className={`inline-block w-fit px-1.5 py-0.5 text-[8px] font-black uppercase rounded-sm border mt-0.5 ${
                                    w.coins >= 150 
                                      ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                      : w.coins >= 50 
                                        ? 'bg-slate-100 text-slate-700 border-slate-300' 
                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                  }`}>
                                    {w.coins >= 150 ? '🥇 গোল্ড লেখক' : w.coins >= 50 ? '🥈 সিলভার লেখক' : '🥉 ব্রোঞ্জ লেখক'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 font-mono text-slate-600 border-r border-slate-100">
                              @{w.username}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-slate-700 border-r border-slate-100">
                              {w.totalPubs}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-slate-700 border-r border-slate-100">
                              {w.followers}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-slate-500 font-bold border-r border-slate-100">
                              {w.coins}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-amber-600 font-bold border-r border-slate-100">
                              {w.monthlyCoins}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-emerald-650 font-bold border-r border-slate-100">
                              ৳{w.balanceBdt.toFixed(1)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserDetailInAdmin({ type: 'writer', data: w });
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                প্রোফাইল
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Readers Spreadsheet-like Table */}
                <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-4xs">
                  <table id="admin-readers-table" className="min-w-full divide-y divide-slate-100 text-left text-xs font-sans">
                    <thead className="bg-slate-50 font-black text-slate-700">
                      <tr>
                        <th className="px-4 py-2.5 text-center w-12 border-r border-slate-100">#</th>
                        <th className="px-4 py-2.5 border-r border-slate-100">নাম</th>
                        <th className="px-4 py-2.5 border-r border-slate-100">ইউজারনেম</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100">বর্তমান ওয়ালেট</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100">মোট রিচার্জ (৳)</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100">কার্ট</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-100">সংরক্ষিত</th>
                        <th className="px-4 py-2.5 text-center">বিশদ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(() => {
                        const currentReaders = readers.length > 0 ? readers : MOCK_READERS;
                        const filteredReadersForAdmin = currentReaders.filter(r => 
                          r.name.toLowerCase().includes(adminUserSearchQuery.toLowerCase()) || 
                          r.username.toLowerCase().includes(adminUserSearchQuery.toLowerCase())
                        );

                        if (filteredReadersForAdmin.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} className="px-4 py-12 text-center text-slate-400 italic">
                                কোনো পাঠক অ্যাকাউন্ট মিল পাওয়া যায়নি।
                              </td>
                            </tr>
                          );
                        }

                        return filteredReadersForAdmin.map((r, index) => (
                          <tr 
                            key={r.id} 
                            onClick={() => setSelectedUserDetailInAdmin({ type: 'reader', data: r })}
                            className="hover:bg-indigo-50/20 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-2 text-center font-mono text-slate-400 font-bold border-r border-slate-100">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 font-extrabold text-slate-800 border-r border-slate-100">
                              <div className="flex items-center gap-2">
                                <img src={r.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} alt="" className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100" />
                                <span>{r.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 font-mono text-slate-605 border-r border-slate-100">
                              @{r.username}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-amber-655 font-bold border-r border-slate-100">
                              {r.currentCoins}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-slate-700 border-r border-slate-100">
                              {(r.spentAmount || 0) + (r.totalCoinsPurchased || 0)}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-slate-700 border-r border-slate-100">
                              {r.printCartCount || 0}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-slate-700 border-r border-slate-100">
                              {r.savedArticlesCount || 0}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserDetailInAdmin({ type: 'reader', data: r });
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                প্রোফাইল
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Display Selected User Minimal Details Modal / Drawer style inside Admin */}
            <AnimatePresence>
              {selectedUserDetailInAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden text-left"
                  >
                    <div className="p-6 space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedUserDetailInAdmin.data.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                            alt="" 
                            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                              {selectedUserDetailInAdmin.data.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono">
                              @{selectedUserDetailInAdmin.data.username} • {selectedUserDetailInAdmin.type === 'writer' ? 'লেখক (Writer)' : 'পাঠক (Reader)'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedUserDetailInAdmin(null)}
                          className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-205 flex items-center justify-center text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">পরিচিতি ও বায়ো</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg italic">
                          {selectedUserDetailInAdmin.data.bio || 'কোনো পরিচিতি তথ্য দেওয়া হয়নি।'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        {selectedUserDetailInAdmin.type === 'writer' ? (
                          <>
                            <div className="bg-slate-50/75 p-2.5 rounded-xl border border-slate-100 text-center">
                              <span className="text-[9px] font-black text-slate-400 block uppercase mb-0.5">মোট লেখা</span>
                              <span className="text-xs font-black text-slate-800 font-mono">
                                {articles.filter(a => a.writerId === selectedUserDetailInAdmin.data.id).length} টি
                              </span>
                            </div>
                            <div className="bg-slate-50/75 p-2.5 rounded-xl border border-slate-100 text-center">
                              <span className="text-[9px] font-black text-slate-400 block uppercase mb-0.5">অনুসারী সংখ্যা</span>
                              <span className="text-xs font-black text-indigo-750 font-mono">
                                {selectedUserDetailInAdmin.data.followers || 0} জন
                              </span>
                            </div>
                            <div className="bg-slate-50/75 p-2.5 rounded-xl border border-slate-100 text-center col-span-2">
                              <span className="text-[9px] font-black text-slate-400 block uppercase mb-0.5">রয়্যালটি ব্যালেন্স</span>
                              <span className="text-sm font-black text-emerald-600 font-mono">
                                🪙 {selectedUserDetailInAdmin.data.coinBalance || 0} কয়েন
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-slate-50/75 p-2.5 rounded-xl border border-slate-100 text-center">
                              <span className="text-[9px] font-black text-slate-400 block uppercase mb-0.5">ওয়ালেট ব্যালেন্স</span>
                              <span className="text-xs font-black text-amber-600 font-mono">
                                🪙 {selectedUserDetailInAdmin.data.currentCoins || 0}
                              </span>
                            </div>
                            <div className="bg-slate-50/75 p-2.5 rounded-xl border border-slate-100 text-center">
                              <span className="text-[9px] font-black text-slate-400 block uppercase mb-0.5">মোট অবদানের রিচার্জ</span>
                              <span className="text-xs font-black text-slate-850 font-mono">
                                ৳{(selectedUserDetailInAdmin.data.spentAmount || 0) + (selectedUserDetailInAdmin.data.totalCoinsPurchased || 0)}
                              </span>
                            </div>
                            <div className="bg-slate-50/75 p-2.5 rounded-xl border border-slate-100 text-center">
                              <span className="text-[9px] font-black text-slate-400 block uppercase mb-0.5">প্রিন্ট কার্ট সংখ্যা</span>
                              <span className="text-xs font-black text-indigo-705 font-mono">
                                {selectedUserDetailInAdmin.data.printCartCount || 0} টি
                              </span>
                            </div>
                            <div className="bg-slate-50/75 p-2.5 rounded-xl border border-slate-100 text-center">
                              <span className="text-[9px] font-black text-slate-400 block uppercase mb-0.5">সংরক্ষিত প্রবন্ধ</span>
                              <span className="text-xs font-black text-slate-705 font-mono">
                                {selectedUserDetailInAdmin.data.savedArticlesCount || 0} টি
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUserDetailInAdmin(null)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-3xs"
                        >
                          বন্ধ করুন
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Writer Applications block */}
        {activeSubTab === 'writer-requests' && (
          <motion.div
            key="writer-requests"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-white p-5 rounded-xl border border-slate-150 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                ✍️ লেখক হতে ইচ্ছুক আবেদনকারীদের তালিকা প্যানেল
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                এখানে পাঠকদের পাঠানো লেখক হওয়ার যাবতীয় আবেদনপত্র সংরক্ষিত আছে। আবেদন যাচাই করার পর যদি অ্যাডমিন অনুমোদন বোতামে ক্লিক করেন, তাহলে ব্যবহারকারীটি স্বয়ংক্রিয়ভাবে প্ল্যাটফর্মে একজন অনুমোদিত <b>কলাম লেখক</b> হিসেবে তালিকাভুক্ত হবেন এবং তার আবেদনে সাবমিট করা ২টি মানসম্মত নমুনা প্রবন্ধ সরাসরি হোমপেজের ফিডে (অন্যান্য পাঠকদের আনলকের জন্য) প্রচারিত হবে।
              </p>
            </div>

            {writerApplications.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-100 text-slate-400 space-y-2">
                <Clock className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
                <p className="text-xs font-bold">বর্তমানে কোনো অমিমাংসিত নতুন আবেদনপত্র নেই।</p>
              </div>
            ) : (
              <div className="space-y-4">
                {writerApplications.map((app) => (
                  <div 
                    key={app.id} 
                    className={`bg-white rounded-2xl border p-5 md:p-6 transition-all duration-200 shadow-4xs space-y-4 ${
                      app.status === 'approved' 
                        ? 'border-emerald-200 bg-emerald-50/5' 
                        : app.status === 'rejected' 
                        ? 'border-rose-150 bg-rose-50/5' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Applicant Profile Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-sm md:text-base">{app.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            app.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' 
                              : app.status === 'rejected' 
                              ? 'bg-rose-100 text-rose-800 border border-rose-250' 
                              : 'bg-amber-100 text-amber-800 border border-amber-250'
                          }`}>
                            {app.status === 'approved' ? 'Approved (অনুমোদিত)' : app.status === 'rejected' ? 'Rejected (নাকচকৃত)' : 'Pending Review'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs font-semibold">আবেদন জমা দেওয়ার তারিখ: {app.submittedAt}</p>
                      </div>

                      {/* Admin Decision Actions */}
                      {app.status === 'pending' && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            onClick={() => onApproveApplication(app.id)}
                            className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            অনুমোদন করুন
                          </button>
                          <button
                            onClick={() => onRejectApplication(app.id)}
                            className="flex-1 md:flex-initial px-4 py-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-rose-200 flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            আবেদন নাকচ করুন
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata summary (Address, bKash, Bio) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">১১ ডিজিটের বিকাশ নম্বর:</span>
                        <p className="text-slate-800 font-bold font-mono tracking-wider mt-0.5">{app.bKashNumber}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">বর্তমান ঠিকানা ও কন্টাক্ট:</span>
                        <p className="text-slate-850 font-bold mt-0.5 truncate" title={app.address}>{app.address}</p>
                      </div>
                      <div className="md:col-span-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">পরিচিতি / বায়ো:</span>
                        <p className="text-slate-750 font-medium mt-0.5 italic">{app.bio}</p>
                      </div>
                    </div>

                    {/* TWO SAMPLE ARTICLES */}
                    <div className="space-y-3 pt-1">
                      <h4 className="text-[11px] text-slate-450 font-extrabold uppercase tracking-widest">যাচাইয়ের জন্য জমাকৃত নমুনা রচনাসমূহ:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sample 1 */}
                        <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-200/60 shadow-4xs space-y-2 text-justify">
                          <div className="flex justify-between items-center">
                            <span className="bg-indigo-50 text-indigo-805 text-[10px] px-2 py-0.5 rounded-md font-bold">
                              নমুনালিপি ১ ({app.sampleCategory1})
                            </span>
                          </div>
                          <h5 className="font-extrabold text-slate-900 text-xs mt-1">শিরোনাম: {app.sampleTitle1}</h5>
                          <p className="text-[11px] text-slate-650 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                            {app.sampleContent1}
                          </p>
                        </div>

                        {/* Sample 2 */}
                        <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-200/60 shadow-4xs space-y-2 text-justify">
                          <div className="flex justify-between items-center">
                            <span className="bg-purple-50 text-purple-805 text-[10px] px-2 py-0.5 rounded-md font-bold">
                              নমুনালিপি ২ ({app.sampleCategory2})
                            </span>
                          </div>
                          <h5 className="font-extrabold text-slate-900 text-xs mt-1">শিরোনাম: {app.sampleTitle2}</h5>
                          <p className="text-[11px] text-slate-650 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                            {app.sampleContent2}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN DIGITAL "PRINT-READY PDF" MODAL PREVIEW FOR PRINTER */}
      <AnimatePresence>
        {isPreviewingPrintReadyBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-55"
          >
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              {/* Modal Control header */}
              <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-xs md:text-sm">প্রিন্টার-ইঞ্জিন প্রিভিউ (Print-Ready Book Layout Builder)</h3>
                    <p className="text-[10px] text-slate-400">অর্ডার আইডি: {isPreviewingPrintReadyBook.id} • এ৪ ডাবল-সাইড প্রিন্ট ফর্মাট</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadSimulation(isPreviewingPrintReadyBook)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ডাউনলোড প্রিন্ট-রেডি পিডিএফ
                  </button>
                  <button
                    onClick={() => setIsPreviewingPrintReadyBook(null)}
                    className="p-1 px-3 bg-white/10 text-white hover:bg-white/20 text-xs rounded-lg transition-all"
                  >
                    ✕ ক্লোজ
                  </button>
                </div>
              </div>

              {/* Book Layout Rendering Container (Simulates real book printing pages) */}
              <div className="p-6 md:p-10 overflow-y-auto bg-slate-50 flex-1 space-y-12">
                
                <div className="bg-indigo-50 text-indigo-905 p-4 rounded-xl text-xs max-w-2xl mx-auto border border-indigo-100 shadow-xs">
                  📌 <b>প্রিন্টার নোট:</b> এটি আপনার কাস্টম সংকলনের রেন্ডার করা লেআউট। প্রথম ২টি পাতা কভার এবং সূচিপত্রের জন্য প্রস্তুত করা হয়েছে। পরবর্তী পাতাগুলোতে প্রবন্ধগুলো ১.৫ ইঞ্চি মার্জিন সহ ২ কলাম বই ফন্ট স্টাইলে সাজানো হয়েছে।
                </div>

                {/* PAGE 1: COVER PAGE */}
                <div className="bg-white max-w-lg mx-auto aspect-[1/1.41] shadow-lg border border-slate-200 p-12 flex flex-col justify-between relative text-center">
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-indigo-700" />
                  
                  <div className="space-y-2">
                    <p className="text-[10px] tracking-widest font-mono text-slate-400">READ2PRINT CUSTOM BOOKLET</p>
                    <div className="h-1 bg-slate-100 w-24 mx-auto my-3"></div>
                  </div>

                  <div className="my-auto space-y-3 py-10">
                    <h1 className="text-3xl font-black text-slate-900 px-6 uppercase tracking-tight leading-snug">
                      {isPreviewingPrintReadyBook.cartItems[0]?.articleTitle || 'আমার কাস্টম বুক'} এবং অন্যান্য রচনা
                    </h1>
                    <div className="w-8 h-1.5 bg-indigo-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 italic mt-2 font-serif">
                      সংকলক গ্রাহক: {isPreviewingPrintReadyBook.customerName}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-0.5 bg-gray-100 w-24 mx-auto my-2"></div>
                    <p className="text-[10px] font-mono text-gray-400 font-bold">READ2PRINT PRESS • DHAKA, BANGLADESH</p>
                    <p className="text-[8px] text-gray-350">প্রিন্টিং অর্ডার আইডি: {isPreviewingPrintReadyBook.id}</p>
                  </div>
                </div>

                {/* PAGE 2: TABLE OF CONTENTS */}
                <div className="bg-white max-w-lg mx-auto aspect-[1/1.41] shadow-lg border border-gray-200 p-12 flex flex-col justify-between relative">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 text-center pb-4 border-b border-gray-100">সূচিপত্র</h2>
                    
                    <div className="mt-8 space-y-4">
                      {isPreviewingPrintReadyBook.cartItems.map((c, i) => (
                        <div key={i} className="flex justify-between items-end gap-2 text-xs text-gray-700">
                          <span className="font-bold flex-1 truncate">
                            {i+1}. {c.articleTitle} <span className="text-[10px] text-gray-400 font-normal">({c.writerName})</span>
                          </span>
                          <span className="border-b border-dashed border-gray-200 flex-1 h-3 min-w-[50px]"></span>
                          <span className="font-mono text-gray-500 font-bold">পৃষ্ঠা {3 + i*2}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-gray-400 font-serif border-t border-gray-100 pt-3">
                    পৃষ্ঠা নম্বর ২ • Read2Print
                  </div>
                </div>

                {/* PAGE 3+: MERGED ARTICLES CONTENT PREVIEW */}
                {isPreviewingPrintReadyBook.cartItems.map((item, idx) => (
                  <div key={idx} className="bg-white max-w-lg mx-auto aspect-[1/1.41] shadow-lg border border-gray-200 p-12 flex flex-col justify-between relative">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider border-b border-dashed border-gray-100 pb-2">
                        <span>অধ্যায় {idx + 1} • {item.writerName}</span>
                        <span>পৃষ্ঠা নম্বর {3 + idx*2}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 leading-snug mt-4">
                        {item.articleTitle}
                      </h3>

                      <div 
                        className="text-[11px] md:text-xs text-stone-850 leading-relaxed text-justify space-y-4 font-serif pt-4"
                        dangerouslySetInnerHTML={{ 
                          __html: item.content.replace(/\n/g, '<br />')
                        }}
                      />
                    </div>

                    <div className="text-center text-[9px] text-gray-300 font-serif border-t border-gray-50 pt-2 font-mono">
                      {isPreviewingPrintReadyBook.cartItems[0]?.articleTitle.substring(0, 20)}... সংকলন • পৃষ্ঠা {3 + idx * 2}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
