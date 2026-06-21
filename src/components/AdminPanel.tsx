import React, { useState } from 'react';
import { Article, Order, Writer, WriterApplication } from '../types';
import { 
  BarChart, Package, Users, AlertTriangle, Check, BookOpen, Clock, 
  MapPin, Phone, Download, Printer, ShieldAlert, Trash2, Eye, FileText, 
  Trophy, TrendingUp, CheckCircle, RefreshCcw, Shield, CheckCircle2, XCircle
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
  platformRevenue
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'content-moderation' | 'writer-list' | 'writer-requests'>('orders');
  
  // States
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [isPreviewingPrintReadyBook, setIsPreviewingPrintReadyBook] = useState<Order | null>(null);
  const [adminUserListTab, setAdminUserListTab] = useState<'writers' | 'readers'>('writers');

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
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
        <div className="space-y-1 text-center md:text-left">
          <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest leading-none">
            🛡️ read2print platform commission pool
          </span>
          <h3 className="text-base font-black text-white mt-1">কো-অর্ডিনেশন ও ২৫% কমিশন প্যানেল রিপোর্টিং</h3>
          <p className="text-[11px] text-slate-350 leading-normal max-w-2xl">
            নীতিমালা অনুযায়ী প্রতিটি কয়েন উপার্জনের (আনলক ও গিফটস) <b>২৫% কমিশন</b> প্ল্যাটফর্ম ফান্ডে জমা হয়। অনুমোদন পাওয়া লেখকদের নমুনা লেখাগুলো সরাসরি হোমপেজে প্রচারিত হয়।
          </p>
        </div>
        <div className="bg-white/5 rounded-xl px-6 py-3 border border-white/10 text-center shrink-0 min-w-[200px]">
          <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">রিসার্ভ কমিশন ব্যালেন্স</p>
          <span className="text-3xl font-black text-amber-400 font-mono flex items-center justify-center gap-1 mt-1">
            🪙 {platformRevenue}
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">৳{(platformRevenue * 1.0).toFixed(1)} টাকা সমপরিমাণ (১ কয়েন = ১ টাকা)</p>
        </div>
      </div>

      {/* Top Admin Status Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">মোট কাস্টম অর্ডার</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 font-mono">{orders.length}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">আয়কৃত রেভিনিউ</p>
            <h3 className="text-xl md:text-2xl font-black text-indigo-600 font-mono">{totalEarnings.toFixed(1)} ৳</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">মোট মুদ্রিত A4 পৃষ্ঠা</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 font-mono">{totalPrintedA4Pages}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Printer className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium font-bold text-slate-705">মোট প্রবন্ধ প্রকাশ</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">
              {articles.filter(a => a.status === 'published').length} টি
            </h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Panel Nav tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'orders' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          আগত কাস্টম অর্ডারসমূহ ({orders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('content-moderation')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'content-moderation' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          কন্টেন্ট মডারেশন (Spam Filter)
        </button>
        <button
          onClick={() => setActiveSubTab('writer-list')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'writer-list' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          লেখক ও ইউজার তালিকা
        </button>
        <button
          onClick={() => setActiveSubTab('writer-requests')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'writer-requests' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          লেখক হওয়ার আবেদনপত্র ({writerApplications.filter(a => a.status === 'pending').length})
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
            <div className="bg-white p-5 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">সমগ্র প্রকাশিত রচনা নিয়ন্ত্রণ প্যানেল (মডারেশন)</h3>
              <p className="text-xs text-gray-500 mt-1">যেকোনো স্প্যাম, অনুপযুক্ত মন্তব্য বা কপিরাইট লঙ্ঘিত রচনা এখান থেকে অবিলম্বে ডিলেট করতে পারবেন।</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {articles.map((art) => (
                <div key={art.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.2 bg-gray-100 text-gray-700 text-[9px] font-bold rounded-sm">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">আইডি: {art.id}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{art.createdAt}</span>
                    </div>
                    <h4 className="font-bold text-gray-805 text-sm">{art.title}</h4>
                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                      <img src={art.writerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>লেখক: <b>{art.writerName}</b> (আইডি: {art.writerId})</span>
                    </p>
                    <div className="bg-gray-50 p-2.5 rounded-lg text-xs text-gray-500 max-h-[70px] overflow-hidden truncate">
                      {art.content.replace(/<[^>]*>/g, '')}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি নিশ্চিত যে "${art.title}" রচনাটি সম্পূর্ণ ডিলেট করতে চান? এটি রিভার্স করা যাবে না।`)) {
                        onDeleteArticle(art.id);
                      }
                    }}
                    className="p-2 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    ডিলেট করুন
                  </button>
                </div>
              ))}
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
            className="space-y-6 w-full"
          >
            {/* Dual List secondary tabs switch */}
            <div className="flex bg-slate-100 p-1 rounded-xl max-w-md gap-1">
              <button
                type="button"
                onClick={() => setAdminUserListTab('writers')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  adminUserListTab === 'writers'
                    ? 'bg-white text-slate-800 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                অনুমোদিত কলামিস্ট লেখকবৃন্দ ({writers.length} জন)
              </button>
              <button
                type="button"
                onClick={() => setAdminUserListTab('readers')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  adminUserListTab === 'readers'
                    ? 'bg-white text-slate-800 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                নিবন্ধিত পাঠক/ইউজার তালিকা ({MOCK_READERS.length} জন)
              </button>
            </div>

            {adminUserListTab === 'writers' ? (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-900 leading-normal">
                  💡 <b>র‍্যাঙ্কিং ও রেটিং লজিক:</b> লেখকদের মোট জেনারেটকৃত প্রকাশনা লিপি, অনুসারী দল ও অর্জিত রয়্যালটি কয়েন ব্যালেন্সের ওপর ভিত্তি করে এই গ্লোবাল লেখক স্কোরবোর্ড র‍্যাঙ্ক ও তারকা রেটিং অবিরত হিসাব করা হয়। (১০ম র‍্যাঙ্কের পরের লেখকদেরও সম্পূর্ণ তালিকা অনুযায়ী র‍্যাঙ্ক ক্রমানুসারে পাওয়া যাবে)।
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const writersWithStats = writers.map((w) => {
                      const totalPubs = articles.filter(a => a.writerId === w.id).length;
                      const coins = w.coinBalance || 0;
                      const followers = w.followers || 0;
                      const score = (totalPubs * 20) + (coins * 5) + (followers * 2);
                      const ratingDec = 3.8 + Math.min(1.2, (score / 250) * 1.2);
                      return {
                        ...w,
                        totalPubs,
                        coins,
                        followers,
                        score,
                        ratingDec: parseFloat(ratingDec.toFixed(1))
                      };
                    });

                    // Sort by score to get global rank positions
                    const sortedWriters = [...writersWithStats].sort((a, b) => b.score - a.score);

                    return sortedWriters.map((w, index) => {
                      const globalRank = index + 1;
                      return (
                        <div key={w.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-4xs hover:shadow-3xs transition-shadow flex items-start gap-4 relative overflow-hidden">
                          {/* Rank Ribbon / Badge */}
                          <div className={`absolute top-0 right-0 px-3.5 py-1 text-[10px] font-black rounded-bl-xl uppercase tracking-wider ${
                            globalRank === 1
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                              : globalRank === 2
                              ? 'bg-slate-200 text-slate-800 border-l border-b border-slate-300'
                              : globalRank === 3
                              ? 'bg-amber-705 text-white'
                              : 'bg-slate-50 text-slate-500 border-l border-b border-slate-200'
                          }`}>
                            #র‍্যাঙ্ক {globalRank}
                          </div>

                          <img src={w.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-3xs p-0.5 shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 leading-tight">
                                {w.name}
                              </h4>
                              <p className="text-[10px] text-indigo-600 font-bold font-mono">@{w.username} • প্রফেশনাল লেখক</p>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic pr-6">"{w.bio || 'সৃজনশীল লেখার মাধ্যমে সমাজ বদলে নিরন্তর বিশ্বাসী কলাম লেখক।'}"</p>
                            
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">মোট প্রকাশনা</span>
                                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1 font-mono">
                                  📖 {w.totalPubs} টি নিবন্ধ
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">লেখক রেটিং</span>
                                <span className="text-xs font-black text-amber-500 flex items-center gap-0.5 font-mono">
                                  ⭐ {w.ratingDec} / 5.0
                                </span>
                              </div>
                              <div className="space-y-0.5 pt-1">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">অর্জিত কয়েন রয়্যালটি</span>
                                <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5 font-mono">
                                  🪙 {w.coins} কয়েন
                                </span>
                              </div>
                              <div className="space-y-0.5 pt-1">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">অনুসারী (Followers)</span>
                                <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-0.5 font-mono">
                                  👥 {w.followers} জন
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-150/10 p-4 rounded-xl text-xs text-indigo-900 leading-normal">
                  💻 <b>পাঠক ডিরেক্টরি পরিচিতি:</b> প্ল্যাটফর্মে নিবন্ধিত সক্রিয় পাঠক সদস্যবৃন্দের তালিকা নিচে প্রদর্শিত হলো। তাদের ওয়ালেট রিচার্জ ও রিডার কয়েন ব্যবহার হিস্ট্রি এখান থেকে ট্র্যাক করতে পারবেন।
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_READERS.map((r) => (
                    <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-205 shadow-4xs flex items-start gap-4">
                      <img src={r.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{r.name}</h4>
                          <p className="text-[10px] text-indigo-650 font-semibold font-mono">@{r.username} • প্রিমিয়াম পাঠক</p>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-1">{r.bio}</p>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">বর্তমান ওয়ালেট ব্যালেন্স</span>
                            <span className="text-xs font-black text-amber-500 flex items-center gap-0.5 font-mono">
                              🪙 {r.currentCoins} কয়েন
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">জীবনকালীন রিচার্জ</span>
                            <span className="text-xs font-bold text-slate-800 font-mono">
                              ৳{r.spentAmount} টাকা
                            </span>
                          </div>
                          <div className="space-y-0.5 pt-1">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">প্রিন্ট কার্ট রানিং</span>
                            <span className="text-xs font-bold text-indigo-700 font-mono">
                              📦 {r.printCartCount} টি অর্ডার
                            </span>
                          </div>
                          <div className="space-y-0.5 pt-1">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">সংরক্ষিত প্রবন্ধ</span>
                            <span className="text-xs font-bold text-slate-805 font-mono">
                              🔖 {r.savedArticlesCount} টি রচনা
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
