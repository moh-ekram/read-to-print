import React, { useState, useEffect } from 'react';
import { Article, CartItem, Order, Writer, ReaderUser } from '../types';
import { 
  BookOpen, Search, Filter, Bookmark, ShoppingBag, ArrowRight, BookMarked, 
  Trash2, HelpCircle, MapPin, Phone, CreditCard, ChevronRight, CheckCircle2, 
  Layers, Settings, Sparkles, User, Printer, Eye, Share2, Info, Newspaper, Download, FileText, Coins, Clock, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WriterPanel from './WriterPanel';

const NEWSPAPER_ARTICLES = [
  {
    id: 'news-pa-1',
    paperName: 'দৈনিক প্রথম আলো',
    category: 'সম্পাদকীয়',
    title: 'শিক্ষা ব্যবস্থার আধুনিকায়ন ও সৃজনশীল বাংলাদেশ',
    writer: 'ড. জামিলুর রেজা চৌধুরী',
    date: 'আজকের সম্পাদকীয়',
    wordCount: 420,
    content: 'আমাদের বর্তমান শিক্ষা ব্যবস্থার আধুনিকায়ন সময়ের বড় দাবি। যদি আমরা উন্নত ও বুদ্ধিবৃত্তিক বাংলাদেশ গড়তে চাই, তবে মুখস্থ বিদ্যার খোলস ভেঙে শিক্ষার্থীদের সৃজনশীল চিন্তা করতে শেখাতে হবে। জ্ঞান কেবল বইয়ের পাতায় সীমাবদ্ধ নয়, একে সমাজ ও জীবনের বাস্তবতায় প্রয়োগ করার যোগ্যতা বাড়াতে হবে।\n\nপ্রযুক্তি ও মানবিক জ্ঞান এই দুই ধারার উপযুক্ত সংমিশ্রণে একটি যুগোপযোগী শিক্ষানীতি প্রণয়ন ও তার সঠিক বাস্তবায়ন আবশ্যক। দেশের প্রতিটি প্রান্তের প্রতিটি শিক্ষার্থীর কাছে মানসম্মত শিক্ষার সুযোগ পৌঁছে দেওয়া গেলেই আমাদের ভবিষ্যৎ প্রজন্ম বিশ্বমঞ্চে বুক ফুলিয়ে নেতৃত্ব দিতে পারবে।'
  },
  {
    id: 'news-it-1',
    paperName: 'দৈনিক ইত্তেফাক',
    category: 'সাহিত্য পাতা',
    title: 'বাঙালির মনস্তত্ত্ব ও রবীন্দ্র ভাবনার প্রাসঙ্গিকতা',
    writer: 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ',
    date: 'সাহিত্য বিশেষ',
    wordCount: 380,
    content: 'রবীন্দ্রনাথ ঠাকুর কেবল বাঙালির কবি নন, তিনি আমাদের অন্তরের পথপ্রদর্শক। যেকোনো সুখে, দুঃখে, সংকটে বা প্রাপ্তিতে রবীন্দ্র ভাবনার প্রাসঙ্গিকতা কখনও ম্লান হয় না। আজ যখন বিশ্বজুড়ে বস্তুবাদের প্রাধান্য, তখন মানুষের মনের ভেতরকার সৌন্দর্য ও শুভবোধকে টিকিয়ে রাখতে রবীন্দ্র দর্শনে ফেরা বড় বেশি প্রয়োজন।\n\nআমাদের চারুশিল্প, সংগীত এবং সাহিত্যের গভীরে যে উদারতা ছড়িয়ে আছে, তার মূল সুরটি আমাদের চিনিয়ে দেয় নিজের শেকড়কে ভালোবাসতে। একটি নতুন দিনের সূর্যোদয়ে রবিবাবুর কবিতা ও গান আমাদের নতুন করে বাঁচার প্রেরণা যোগায়।'
  },
  {
    id: 'news-ds-1',
    paperName: 'দ্য ডেইলি স্টার (বাংলা)',
    category: 'বিজ্ঞান ও প্রযুক্তি',
    title: 'কৃত্রিম বুদ্ধিমত্তা ও বাংলা ভাষার ডিজিটাল রূপান্তর',
    writer: 'ড. মুহম্মদ জাফর ইকবাল',
    date: 'বিজ্ঞান ফিচার',
    wordCount: 350,
    content: 'কৃত্রিম বুদ্ধিমত্তা বা আর্টিফিশিয়াল ইন্টেলিজেন্স আমাদের দৈনন্দিন জীবনের অবিচ্ছেদ্য অংশ হয়ে দাঁড়িয়েছে। বাংলা ভাষাকে বিশ্বদরবারে সমান মর্যাদায় প্রতিষ্ঠিত করতে হলে আইটি সেক্টরে বাংলা রিসোর্স নিয়ে কাজের কোনো বিকল্প নেই। উন্নত ভয়েস রিকগনিশন, সঠিক ট্রান্সলেশন এবং হাই-কোয়ালিটি টেক্সট সামারাইজেশন টুলস আমাদের তৈরি করতে হবে।\n\nতরুণ ডেলভলপার ও গবেষকদের এই কাজে এগিয়ে আসতে হবে। বাংলা ব্যাকরণ ও লেখার সঠিক ডেটাসেট ও অভিধান উন্মুক্ত করার মাধ্যমে আরএআই-এর সাহায্যে কোটি মানুষের ডিজিটাল ব্যবহারে বৈপ্লবিক পরিবর্তন সম্ভব।'
  },
  {
    id: 'news-bp-1',
    paperName: 'বাংলাদেশ প্রতিদিন',
    category: 'অর্থ ও পরিবেশ',
    title: 'আমাদের সবুজ বাজেট এবং স্থায়িত্বশীল ঢাকার ভবিষ্যৎ',
    writer: 'ড. আতিউর রহমান',
    date: 'বিশেষ কলাম',
    wordCount: 310,
    content: 'অর্থনৈতিক প্রবৃদ্ধির সাথে পরিবেশ সুরক্ষার মেলবন্ধন ঘটানো অত্যন্ত জরুরি হয়ে পড়েছে। আগামী বাজেটে সবুজ প্রকল্প এবং পরিবেশবান্ধব যাতায়াত ব্যবস্থার জন্য বিশেষ বরাদ্দ রাখতে হবে। বিশেষ করে আমাদের ঐতিহ্যবাহী ঢাকা শহরকে বসবাসযোগ্য ও দূষণমুক্ত করতে হলে বর্জ্য ব্যবস্থাপনা ও নদী দূষণ রোধে কঠোর পদক্ষেপ নেওয়া প্রয়োজন।\n\nএকই সাথে নাগরিকদের মধ্যে সচেতনতা বৃদ্ধি এবং পরিবেশবান্ধব টেকসই ব্যবসার প্রতি ট্যাক্স ছাড় দেওয়া গেলে আমাদের অর্থনীতি যেমন সমৃদ্ধ হবে, সমাজও হবে নির্মল।'
  },
  {
    id: 'news-sh-1',
    paperName: 'আজকের সাহিত্য পত্রিকা',
    category: 'কবিতা ও বিশ্লেষণ',
    title: 'উত্তর-আধুনিক বাংলা কবিতার গতি প্রকৃতি',
    writer: 'শামসুর রহমান (স্মরণে)',
    date: 'সাময়িকী',
    wordCount: 290,
    content: 'বাংলা কবিতা আজ নতুন ভাষা ও শৈলী ধারণ করছে। প্রথাগত ব্যাকরণ এড়িয়ে প্রাত্যহিক জীবনের ছোট ছোট গল্প ও আবেগ আজ কবিতার রূপকের মাধ্যমে তীব্র ব্যঞ্জনায় প্রকাশিত হচ্ছে। উত্তর-আধুনিক সমাজব্যবস্থার জটিলতা এবং নাগরিক জীবনের নিঃসঙ্গতা আমাদের তরুণ কবিদের কলমে অসাধারণ শব্দচয়নে ফুটে উঠেছে।\n\nকবিতা কেবল ভাবের প্রকাশ নয়, এটি একটি সময় ও সমাজের দর্পণ। তাই কবিতার মাঝে দেশের অস্থিরতা, সংগ্রাম এবং আশা-আকাঙ্ক্ষার বাণী চিরকাল জীবন্ত থাকবে।'
  }
];

interface ReaderPanelProps {
  articles: Article[];
  writers: Writer[];
  cart: CartItem[];
  savedArticles: string[]; // List of article IDs saved for read later or custom folders
  customFolders: { [folderName: string]: string[] }; // custom folder state
  onToggleSaveArticle: (id: string, folderName?: string) => void;
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  readerCoins: number;
  setReaderCoins: React.Dispatch<React.SetStateAction<number>>;
  unlockedArticles: string[];
  setUnlockedArticles: React.Dispatch<React.SetStateAction<string[]>>;
  onAwardCoinsToWriter: (writerId: string, amount: number) => void;
  onAddWriterApplication: (newApp: any) => void;
  writerApplications: any[];
  currentWriter: Writer;
  onUpdateWriter: (writer: Writer) => void;
  onAddArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onUpdateArticle: (id: string, article: Partial<Article>) => void;
  readers?: ReaderUser[];
  setReaders?: React.Dispatch<React.SetStateAction<ReaderUser[]>>;
  loggedInReader?: ReaderUser | null;
  setLoggedInReader?: React.Dispatch<React.SetStateAction<ReaderUser | null>>;
}

export default function ReaderPanel({
  articles,
  writers,
  cart,
  savedArticles,
  customFolders,
  onToggleSaveArticle,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onPlaceOrder,
  readerCoins,
  setReaderCoins,
  unlockedArticles,
  setUnlockedArticles,
  onAwardCoinsToWriter,
  onAddWriterApplication,
  writerApplications = [],
  currentWriter,
  onUpdateWriter,
  onAddArticle,
  onDeleteArticle,
  onUpdateArticle,
  readers = [],
  setReaders,
  loggedInReader,
  setLoggedInReader
}: ReaderPanelProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'my-profile' | 'shelf' | 'print-cart' | 'coin-store' | 'author-profiles' | 'become-writer'>('discover');
  const [selectedAuthorForProfile, setSelectedAuthorForProfile] = useState<Writer | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [readingScrollProgress, setReadingScrollProgress] = useState(0);

  // Profile inner subtabs and shuffled writers states
  const [profileActiveTab, setProfileActiveTab] = useState<'shelf' | 'writer'>('shelf');
  const [shuffledWriters, setShuffledWriters] = useState<Writer[]>([]);

  // Homepage coin filtering states
  const [coinFilterType, setCoinFilterType] = useState<'all' | 'free' | '10' | '30' | 'custom'>('all');
  const [customCoinLimit, setCustomCoinLimit] = useState<string>('');

  useEffect(() => {
    if (writers && writers.length > 0) {
      const arr = [...writers];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffledWriters(arr);
    }
  }, [writers]);

  const lastTrackedReadArticleId = React.useRef<string | null>(null);

  useEffect(() => {
    setReadingScrollProgress(0);
    if (viewingArticle?.id && viewingArticle.id !== lastTrackedReadArticleId.current) {
      lastTrackedReadArticleId.current = viewingArticle.id;
      if (onUpdateArticle) {
        onUpdateArticle(viewingArticle.id, { reads: (viewingArticle.reads || 0) + 1 });
      }
    }
  }, [viewingArticle?.id]);
  
  // Coin purchasing bKash/Nagad checkout process states
  const [payingPackage, setPayingPackage] = useState<{ id: string; price: number; coins: number; tag: string } | null>(null);
  const [coinPaymentStep, setCoinPaymentStep] = useState<'method' | 'phone' | 'otp' | 'pin' | 'success'>('method');
  const [coinSelectedGateway, setCoinSelectedGateway] = useState<'bKash' | 'Nagad'>('bKash');
  const [coinPhoneNumber, setCoinPhoneNumber] = useState('');
  const [coinOTP, setCoinOTP] = useState('');
  const [coinPIN, setCoinPIN] = useState('');
  const [coinIsProcessing, setCoinIsProcessing] = useState(false);
  const [coinPaymentError, setCoinPaymentError] = useState('');

  // Glowing gift state
  const [glowingGiftValue, setGlowingGiftValue] = useState<number | null>(null);

  const handleViewAuthorProfileByWriterName = (writerName: string) => {
    const trimmedInput = writerName.trim().toLowerCase();
    let writer = writers.find(w => w.name.trim().toLowerCase() === trimmedInput);
    if (!writer) {
      writer = writers.find(w => w.name.toLowerCase().includes(trimmedInput) || trimmedInput.includes(w.name.toLowerCase()));
    }
    if (writer) {
      setSelectedAuthorForProfile(writer);
      setActiveTab('author-profiles');
    } else {
      const fallback = writers.filter(w => w.id === viewingArticle?.writerId)[0] || writers[0];
      if (fallback) {
        setSelectedAuthorForProfile(fallback);
        setActiveTab('author-profiles');
      }
    }
    setViewingArticle(null);
  };
  
  // Searching/Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [selectedWriter, setSelectedWriter] = useState<string>('সব');

  // Custom Folder modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [pendingArticleIdToSave, setPendingArticleIdToSave] = useState<string | null>(null);

  // Writer Application states
  const [appFormName, setAppFormName] = useState('');
  const [appFormBKash, setAppFormBKash] = useState('');
  const [appFormBio, setAppFormBio] = useState('');
  const [appFormAddress, setAppFormAddress] = useState('');
  const [appFormSampleTitle1, setAppFormSampleTitle1] = useState('');
  const [appFormSampleContent1, setAppFormSampleContent1] = useState('');
  const [appFormSampleCategory1, setAppFormSampleCategory1] = useState<'সাহিত্য' | 'বিজ্ঞান' | 'রাজনীতি' | 'অর্থনীতি' | 'ধর্ম' | 'দর্শন'>('সাহিত্য');
  const [appFormSampleTitle2, setAppFormSampleTitle2] = useState('');
  const [appFormSampleContent2, setAppFormSampleContent2] = useState('');
  const [appFormSampleCategory2, setAppFormSampleCategory2] = useState<'সাহিত্য' | 'বিজ্ঞান' | 'রাজনীতি' | 'অর্থনীতি' | 'ধর্ম' | 'দর্শন'>('সাহিত্য');
  const [appSubmittedSuccess, setAppSubmittedSuccess] = useState(false);


  // Active Article Reading Detail Modal

  // Custom compiled book metadata state
  const [bookTitle, setBookTitle] = useState('আমার কাস্টম সংকলন');
  const [bookSubtitle, setBookSubtitle] = useState('পছন্দের সেরা রচনাগুচ্ছ');
  const [coverTheme, setCoverTheme] = useState<'elegant-navy' | 'vintage-sepia' | 'emerald-forest' | 'minimalist-white'>('elegant-navy');

  // PDF Preview & Live Newspaper states
  const [isPreviewingReaderPDF, setIsPreviewingReaderPDF] = useState(false);
  const [viewingNewsArticle, setViewingNewsArticle] = useState<any | null>(null);

  // Checkout flows state
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'completed'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryRegion, setDeliveryRegion] = useState<'Dhaka' | 'Outside Dhaka'>('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Payment simulator inputs
  const [paymentStep, setPaymentStep] = useState<'details' | 'otp' | 'pin'>('details');
  const [simPhoneNumber, setSimPhoneNumber] = useState('');
  const [simOTP, setSimOTP] = useState('');
  const [simPIN, setSimPIN] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Calculate dynamic book parameters
  // Average 200 words = 1 A4 content page. Cover & TOC take 2 extra pages minimum.
  const calculateArticlePages = (words: number) => {
    return Math.max(1, Math.ceil(words / 200));
  };

  const totalArticlePages = cart.reduce((total, item) => total + calculateArticlePages(item.wordCount), 0);
  const totalBookPages = totalArticlePages > 0 ? totalArticlePages + 2 : 0; // +2 for Cover and Table of Contents
  
  const pageCost = totalBookPages * 1.5;
  const bindingCost = totalBookPages > 0 ? 20 : 0;
  const deliveryCost = totalBookPages > 0 ? (deliveryRegion === 'Dhaka' ? 60 : 120) : 0;
  const grandTotal = pageCost + bindingCost + deliveryCost;

  // Compile table of contents
  const generateTableofContents = () => {
    let currentPage = 3; // Starts at page 3 because page 1 is Cover, page 2 is Table of Contents
    return cart.map((item) => {
      const startPage = currentPage;
      const pagesNeeded = calculateArticlePages(item.wordCount);
      currentPage += pagesNeeded;
      return {
        title: item.articleTitle,
        writer: item.writerName,
        startPage,
        endPage: currentPage - 1,
        pages: pagesNeeded
      };
    });
  };

  const tableOfContents = generateTableofContents();

  // Filters articles
  const filteredArticles = articles.filter(art => {
    // Hidden articles should not be visible to reader
    if (art.status !== 'published' || art.hidden) return false;

    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.writerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'সব' || art.category === selectedCategory;
    const matchesWriter = selectedWriter === 'সব' || art.writerId === selectedWriter;

    // Coin requirements filter
    let matchesCoin = true;
    const coins = art.requiredCoins || 0;
    if (coinFilterType === 'free') {
      matchesCoin = coins === 0;
    } else if (coinFilterType === '10') {
      matchesCoin = coins > 0 && coins <= 10;
    } else if (coinFilterType === '30') {
      matchesCoin = coins > 0 && coins <= 30;
    } else if (coinFilterType === 'custom') {
      const parsedLimit = parseInt(customCoinLimit, 10);
      if (!isNaN(parsedLimit)) {
        matchesCoin = coins <= parsedLimit;
      }
    }

    return matchesSearch && matchesCategory && matchesWriter && matchesCoin;
  });

  const handleOpenFolderModal = (artId: string) => {
    setPendingArticleIdToSave(artId);
    setIsFolderModalOpen(true);
  };

  const handleAddCustomFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderNameInput.trim() || !pendingArticleIdToSave) return;
    onToggleSaveArticle(pendingArticleIdToSave, folderNameInput.trim());
    setFolderNameInput('');
    setIsFolderModalOpen(false);
    setPendingArticleIdToSave(null);
  };

  const handleToggleReadLater = (artId: string) => {
    onToggleSaveArticle(artId, 'Read Later');
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentStep === 'details') {
      if (!simPhoneNumber || simPhoneNumber.length < 11) {
        alert('সঠিক ১১ অঙ্কের বিকাশ/নগদ মোবাইল নম্বর দিন।');
        return;
      }
      setPaymentStep('otp');
    } else if (paymentStep === 'otp') {
      if (!simOTP || simOTP.length < 4) {
        alert('দয়া করে ৪ ডিজিটের ওটিপি কোড (যেমন ১২৩৪) টাইপ করুন।');
        return;
      }
      setPaymentStep('pin');
    } else if (paymentStep === 'pin') {
      if (!simPIN || simPIN.length < 4) {
        alert('দয়া করে পিন নম্বর টাইপ করুন।');
        return;
      }
      setIsPaying(true);
      
      // Complete transaction after 1.5 seconds
      setTimeout(() => {
        const finalOrder: Order = {
          id: 'R2P-' + Math.floor(100000 + Math.random() * 900000),
          customerName,
          phone: customerPhone,
          address: customerAddress,
          city: deliveryRegion,
          cartItems: [...cart],
          totalPages: totalBookPages,
          pageCost,
          bindingCost,
          deliveryCost,
          totalCost: grandTotal,
          paymentMethod,
          paymentStatus: 'paid',
          orderDate: new Date().toISOString().split('T')[0],
          status: 'Received'
        };

        onPlaceOrder(finalOrder);
        onClearCart();
        setIsPaying(false);
        setCheckoutStep('completed');
        // Reset steps
        setPaymentStep('details');
        setSimPhoneNumber('');
        setSimOTP('');
        setSimPIN('');
      }, 1500);
    }
  };

  const handleInstantCheckoutStart = () => {
    if (!agreedToTerms) {
      alert('দয়া করে কপিরাইট ও শর্তাবলীতে সম্মতি জানান।');
      return;
    }
    if (!customerName || !customerPhone || !customerAddress) {
      alert('দয়া করে শিপিং তথ্য পূরণ করুন।');
      return;
    }
    setCheckoutStep('payment');
  };

  return (
    <div id="reader-panel" className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-slate-100 p-6 md:p-8 rounded-2xl shadow-md border border-indigo-950 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-xl" />
        
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/20">
            বইপ্রেমীদের নতুন ঠিকানায় স্বাগতম
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
            পছন্দের ব্লগগুলো একসঙ্গে সাজিয়ে আপনার নিজস্ব বই বানান!
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed text-justify">
            আপনার পছন্দের বিভিন্ন লেখকের একাধিক কন্টেন্ট বা প্রবন্ধ একসাথে কার্টে যুক্ত করুন। Read2Print আপনার সংকলনটিকে একটি কাস্টম প্রফেশনাল বই আকারে প্রিন্ট করে আপনার ঠিকানায় সরাসরি ডেলিভারি এনে দেবে।
          </p>
        </div>
      </div>

      {/* Primary Inner Segment Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 gap-1 md:gap-2">
        <button
          onClick={() => { setActiveTab('discover'); setCheckoutStep('cart'); }}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'discover' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          হোম পেজ
        </button>
        <button
          onClick={() => { setActiveTab('my-profile'); }}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'my-profile' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4 text-emerald-500" />
          আমার প্রোফাইল
        </button>
        <button
          onClick={() => { setActiveTab('author-profiles'); setSelectedAuthorForProfile(null); }}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'author-profiles' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4 text-indigo-500" />
          লেখক প্রোফাইলসমূহ
        </button>
        <button
          onClick={() => { setActiveTab('print-cart'); }}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 relative ${
            activeTab === 'print-cart' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          কাস্টম প্রিন্ট বাস্কেট
          {cart.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono animate-bounce">
              {cart.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('coin-store'); }}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'coin-store' 
              ? 'border-amber-500 text-amber-600 font-black bg-amber-50/30' 
              : 'border-transparent text-gray-500 hover:text-gray-80s'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-500 animate-pulse" />
          আমার কয়েন: <span className="font-mono text-amber-600 font-bold">{readerCoins}</span>
        </button>
        <button
          onClick={() => { setActiveTab('become-writer'); }}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'become-writer' 
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/10' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-500" />
          লেখক হতে আবেদন
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: Discover & Filters */}
        {activeTab === 'discover' && (
          <motion.div
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters Block */}
            <div className="space-y-4">
              <div className="bg-white p-3 md:p-4 rounded-xl shadow-xs border border-gray-150 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="শিরোনাম, লেখক বা সাব-ক্যাটেগরি দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-505 bg-gray-50/50"
                  />
                </div>
                
                <div className="w-full md:w-48 shrink-0">
                  <select
                    value={selectedWriter}
                    onChange={(e) => setSelectedWriter(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-205 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-505 bg-white font-bold text-gray-700"
                  >
                    <option value="সব">সকল কলাম লেখক</option>
                    {writers.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1. Thin Category Capsule Row */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['সব', 'সাহিত্য', 'বিজ্ঞান', 'রাজনীতি', 'অর্থনীতি', 'ধর্ম', 'दर्शन'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all shrink-0 border uppercase tracking-wide ${
                      (selectedCategory === cat || (cat === 'সব' && selectedCategory === 'সব'))
                        ? 'bg-indigo-600 text-white border-indigo-650 shadow-xs'
                        : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50 hover:text-gray-950'
                    }`}
                  >
                    {cat === 'সব' ? 'সব লেখা' : cat}
                  </button>
                ))}
              </div>

              {/* Coin Filter Minimal Row */}
              <div id="coin-filter-bar" className="flex flex-wrap items-center gap-2 pt-2 pb-1 bg-slate-50/50 px-3 rounded-xl border border-slate-200/60 mt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Coins className="w-3.5 h-3.5 text-amber-500" /> কয়েন ফিল্টার:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: 'সব লেখা', value: 'all' },
                    { label: 'ফ্রি', value: 'free' },
                    { label: '≤১০ কয়েন', value: '10' },
                    { label: '≤৩০ কয়েন', value: '30' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setCoinFilterType(item.value as any);
                      }}
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md border transition-all ${
                        coinFilterType === item.value
                          ? 'bg-amber-500 text-white border-amber-600 shadow-4xs font-bold'
                          : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}

                  {/* Custom Coin Input Option */}
                  <div className={`flex items-center gap-1 bg-white border rounded-md px-2 py-0.5 ${
                    coinFilterType === 'custom' ? 'border-amber-400 ring-1 ring-amber-400/25' : 'border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setCoinFilterType('custom')}
                      className={`text-[10px] font-bold transition-all ${
                        coinFilterType === 'custom' ? 'text-amber-600 font-black' : 'text-slate-500'
                      }`}
                    >
                      কাস্টম (≤):
                    </button>
                    <input
                      type="number"
                      value={customCoinLimit}
                      onChange={(e) => {
                        setCustomCoinLimit(e.target.value);
                        setCoinFilterType('custom');
                      }}
                      placeholder="মান লিখুন"
                      className="w-12 p-0 text-[10px] font-bold bg-transparent text-slate-800 focus:outline-hidden text-center placeholder-slate-400 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Top-rated & Randomized Writers Horizontal Row */}
              <div className="bg-gradient-to-r from-indigo-50/40 via-purple-50/20 to-amber-50/20 p-4 rounded-2xl border border-indigo-200/40 space-y-3 shadow-4xs">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="text-xs font-black text-slate-800 tracking-tight flex items-center gap-1">
                      ⭐ গুণী লেখক ও জনপ্রিয় কলামিস্ট বৃন্দ
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedAuthorForProfile(null);
                      setActiveTab('author-profiles');
                    }}
                    className="text-[10px] md:text-xs font-extrabold text-indigo-600 hover:text-indigo-805 transition-colors"
                  >
                    সকল লেখক অপশন →
                  </button>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                  {(() => {
                    const sortedWriters = [...writers].sort((a, b) => (b.coinBalance || 0) - (a.coinBalance || 0));
                    const top5 = sortedWriters.slice(0, 5);
                    const remaining = sortedWriters.slice(5);
                    const combined = [
                      ...top5.map((w, idx) => ({ ...w, rank: idx + 1, isTop5: true })), 
                      ...remaining.map(w => ({ ...w, rank: null, isTop5: false }))
                    ];

                    return combined.map((writer) => {
                      return (
                        <div
                          key={writer.id}
                          onClick={() => {
                            setSelectedAuthorForProfile(writer);
                            setActiveTab('author-profiles');
                          }}
                          className={`flex items-center gap-2 bg-white border p-2 rounded-xl shrink-0 cursor-pointer hover:shadow-2xs transition-all hover:-translate-y-0.5 group/auth-pill ${
                            writer.isTop5 ? 'border-amber-200 ring-2 ring-amber-500/10' : 'border-slate-200'
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={writer.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                              alt={writer.name}
                              className="w-8.5 h-8.5 rounded-full object-cover border border-slate-100"
                            />
                            {writer.isTop5 && (
                              <span className="absolute -top-1.5 -right-1 bg-amber-500 text-[8px] text-white font-black px-1 rounded-full shadow-xs border border-white flex items-center justify-center">
                                👑 {writer.rank}
                              </span>
                            )}
                          </div>

                          <div className="text-left shrink-0">
                            <h4 className="text-[11px] font-black text-slate-800 group-hover/auth-pill:text-indigo-655 transition-colors">
                              {writer.name}
                            </h4>
                            <p className="text-[9px] text-indigo-600 font-bold flex items-center gap-0.5 mt-0.5">
                              👥 {writer.followers} অনুসারী
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Articles List (প্রবন্ধসমূহের তালিকা) */}
            {filteredArticles.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-200 text-gray-500">
                <Search className="w-12 h-12 stroke-1 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">কোনো লেখা পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((art, index) => {
                  const isInCart = cart.some(item => item.articleId === art.id);
                  const isSaved = savedArticles.includes(art.id);
                  
                  // Deterministic premium varying gray backgrounds for cards
                  const grayShades = [
                    'bg-slate-50 border-slate-200/90 hover:bg-slate-100/70 hover:border-slate-350/60',
                    'bg-zinc-100/40 border-zinc-200 hover:bg-zinc-100/80 hover:border-zinc-300',
                    'bg-stone-50 border-stone-200 hover:bg-stone-100/70 hover:border-stone-300',
                    'bg-gray-100/30 border-gray-200 hover:bg-gray-100/80 hover:border-gray-250',
                    'bg-neutral-50 border-neutral-200/90 hover:bg-neutral-100/70 hover:border-neutral-350/60',
                    'bg-slate-100/30 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                  ];
                  const chosenShade = grayShades[index % grayShades.length];
                  
                  return (
                    <div 
                      key={art.id} 
                      className={`${chosenShade} p-5 rounded-2xl flex flex-col justify-between hover:shadow-2xs transition-all duration-200 group`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-850 text-[10px] font-bold rounded-full">
                              {art.category}
                            </span>
                            {art.subCategory && (
                              <span className="text-[10px] text-gray-500 font-medium">/{art.subCategory}</span>
                            )}
                          </div>
                          
                          {/* Save & Bookmarking */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleToggleReadLater(art.id)}
                              className={`p-1.5 rounded-md transition-all ${
                                isSaved 
                                  ? 'bg-indigo-50 text-indigo-750' 
                                  : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-200/50'
                              }`}
                              title={isSaved ? 'বুকশেলফ থেকে সরান' : 'বুকশেলফে সেভ করুন'}
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => handleOpenFolderModal(art.id)}
                              className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-gray-200/50 transition-all"
                              title="কাস্টম ফোল্ডারে রাখুন"
                            >
                              <Layers className="w-3.5 h-3.5 font-sans" />
                            </button>
                          </div>
                        </div>

                        <h3 
                          onClick={() => setViewingArticle(art)}
                          className="font-bold text-indigo-700 text-lg group-hover:text-indigo-900 transition-colors cursor-pointer leading-snug flex items-center justify-between gap-1.5 flex-wrap"
                        >
                          <span>{art.title}</span>
                          <span className="inline-flex items-center gap-0.5 text-xs bg-amber-50 text-amber-600 font-bold border border-amber-100 px-1.5 py-0.5 rounded-full shrink-0 select-none font-mono" title="প্রয়োজনীয় কয়েন">
                            🪙 {art.requiredCoins || 0}
                          </span>
                        </h3>

                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAuthorProfileByWriterName(art.writerName);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:text-indigo-650 group/author"
                        >
                          <img 
                            src={art.writerAvatar} 
                            alt="" 
                            className="w-5 h-5 rounded-full object-cover group-hover/author:ring-2 group-hover/author:ring-indigo-400 transition-all animate-fade-in" 
                          />
                          <span className="text-xs text-gray-750 font-bold group-hover/author:underline">{art.writerName}</span>
                          <span className="text-gray-350 text-xs">•</span>
                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span>{art.wordCount} শব্দ</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-indigo-600/80 font-semibold flex items-center gap-0.5 bg-indigo-50/50 px-1.5 py-0.2 rounded-sm" title="মোট পঠন সংখ্যা">
                              👁️ {art.reads || 0} বার
                            </span>
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed text-justify line-clamp-3">
                          {art.content.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200/40 mt-4">
                        <button
                          onClick={() => setViewingArticle(art)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                        >
                          পুরো লেখা পড়ুন
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex gap-2 items-center">
                          {/* Read Later Clock icon button */}
                          <button
                            onClick={() => handleToggleReadLater(art.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 md:gap-1.5 transition-all ${
                              isSaved 
                                ? 'bg-indigo-100 text-indigo-805 border border-indigo-200 shadow-3xs' 
                                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-3xs'
                            }`}
                            title={isSaved ? 'পড়ার তালিকা থেকে বাদ দিন' : 'পরে পড়ুন (Read Later)'}
                          >
                            <Clock className={`w-3.5 h-3.5 ${isSaved ? 'text-indigo-600' : 'text-gray-500'}`} />
                            <span>{isSaved ? 'যুক্ত' : 'পরে পড়ুন'}</span>
                          </button>

                          {/* Add to Print */}
                          <button
                            onClick={() => {
                              if (isInCart) {
                                onRemoveFromCart(art.id);
                              } else {
                                const isLocked = (art.requiredCoins || 0) > 0 && !unlockedArticles.includes(art.id);
                                if (isLocked) {
                                  alert(`এই লেখাটি প্রিন্ট বাস্কেটে যুক্ত করতে হলে প্রথমে ${art.requiredCoins} কয়েন দিয়ে লেখাটি আনলক করতে হবে। দয়া করে লেখাটি পড়ে আনলক করে নিন।`);
                                  setViewingArticle(art);
                                  return;
                                }
                                onAddToCart({
                                  articleId: art.id,
                                  articleTitle: art.title,
                                  writerName: art.writerName,
                                  wordCount: art.wordCount,
                                  content: art.content
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isInCart 
                                ? 'bg-amber-100 text-amber-805 border border-amber-200' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            }`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          {isInCart ? 'বই থেকে বাদ দিন' : 'অ্যাড টু প্রিন্ট'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: Shelf & Custom Folders */}
        {activeTab === 'shelf' && (
          <motion.div
            key="shelf"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-5 rounded-xl border border-gray-100">
              <h2 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600" />
                আপনার সংরক্ষিত বুকশেলফ
              </h2>
              <p className="text-xs text-gray-500 mt-1">পড়ার সুবিধার্থে পছন্দের লেখাগুলো এখানে ফোল্ডারওয়াইজ সাজিয়ে রাখতে পারবেন।</p>
            </div>

            {/* Read Later Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm bg-gray-150 px-3 py-1 rounded-sm flex items-center gap-1.5">
                  📁 Read Later (পরে পড়ার তালিকায়) 
                  <span className="font-mono text-xs">({savedArticles.length})</span>
                </h3>
              </div>

              {savedArticles.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 rounded-xl">
                  পরে পড়ার জন্য কোনো কন্টেন্ট বুকমার্ক করা হয়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.filter(a => savedArticles.includes(a.id)).map(art => (
                    <div key={art.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center gap-3">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-1">{art.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">লেখক: {art.writerName}  •  {art.category}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setViewingArticle(art)}
                          className="p-1 px-2 hover:bg-gray-50 text-indigo-600 text-xs font-semibold rounded-md transition-all border border-gray-100"
                        >
                          পড়ুন
                        </button>
                        <button
                          onClick={() => handleToggleReadLater(art.id)}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-md transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Render Custom Folders */}
            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">📁 কাস্টম সংকলন ফোল্ডারসমূহ</h3>
              </div>

              {Object.keys(customFolders).length === 0 ? (
                <div className="bg-gray-50/50 p-10 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  এখনো কোনো কাস্টম ফোল্ডার তৈরি করা হয়নি। লেখা বুকমার্ক করার সময় ফোল্ডার বানাতে পারবেন।
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(customFolders).map(([folderName, ids]) => (
                    <div key={folderName} className="space-y-3 bg-white p-4 rounded-xl border border-gray-50">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <h4 className="font-bold text-sm text-indigo-700 flex items-center gap-1.5">
                          📂 {folderName} 
                          <span className="font-mono text-[11px] bg-indigo-50 text-indigo-805 px-1.5 py-0.2 rounded-full">
                            {ids.length} টি রচনা
                          </span>
                        </h4>
                      </div>

                      {ids.length === 0 ? (
                        <p className="text-[11px] text-gray-400 py-2">ফোল্ডারটি ফাঁকা রয়েছে।</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {articles.filter(a => ids.includes(a.id)).map(art => (
                            <div key={art.id} className="bg-gray-50/50 p-3 rounded-lg flex justify-between items-center gap-2">
                              <div>
                                <h5 className="font-semibold text-gray-800 text-xs line-clamp-1">{art.title}</h5>
                                <p className="text-[10px] text-gray-400">{art.writerName} • {art.category}</p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setViewingArticle(art)}
                                  className="text-[10px] p-1 px-1.5 bg-white text-indigo-600 rounded-sm hover:bg-gray-100"
                                >
                                  পড়ুন
                                </button>
                                <button
                                  onClick={() => onToggleSaveArticle(art.id, folderName)}
                                  className="text-gray-400 hover:text-rose-500 p-1"
                                >
                                  <Trash2 className="w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: Print Cart (E-commerce / Book compilation engine) */}
        {activeTab === 'print-cart' && (
          <motion.div
            key="print-cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {checkoutStep !== 'completed' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Book Configuration & Merger Tool */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Cart Items Selector */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                        ✨ সংকলনের জন্য নির্বাচিত রচনার তালিকা
                      </h3>
                      {cart.length > 0 && (
                        <button
                          onClick={onClearCart}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          সব মুছে দিন
                        </button>
                      )}
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 space-y-3">
                        <Printer className="w-12 h-12 stroke-1 mx-auto text-gray-300" />
                        <p className="text-xs">আপনার কাস্টম বই তৈরির বাস্কেট খালি রয়েছে।</p>
                        <button
                          onClick={() => setActiveTab('discover')}
                          className="px-4 py-2 bg-indigo-50 text-indigo-755 rounded-lg text-xs font-bold"
                        >
                          আর্টিকেল নির্বাচন করুন
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {cart.map((item, index) => (
                          <div 
                            key={item.articleId} 
                            className="flex justify-between items-center p-3.5 bg-gray-50 hover:bg-indigo-50/25 rounded-xl border border-gray-100 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-indigo-105 text-indigo-805 text-[11px] font-bold flex items-center justify-center font-mono">
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-gray-700 text-xs lines-clamp-1">{item.articleTitle}</h4>
                                <p className="text-[10px] text-gray-400">লেখক: {item.writerName}  •  {item.wordCount} শব্দ (~{calculateArticlePages(item.wordCount)} পৃষ্ঠা)</p>
                              </div>
                            </div>
                            <button
                              onClick={() => onRemoveFromCart(item.articleId)}
                              className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50"
                              title="বাদ দিন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manuscript parameters - Customizer (Cover Art and Subtitle) */}
                  {cart.length > 0 && checkoutStep === 'cart' && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Settings className="w-4.5 h-4.5 text-indigo-600" />
                        বইয়ের প্রচ্ছদ ও কনফিগারেশন
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500">বইয়ের মূল নাম (Title)</label>
                          <input
                            type="text"
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold text-gray-700"
                            placeholder="যেমন: আমার পছন্দের সাহিত্যিকা"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500">বইয়ের ছোট টাইটেল/উপনাম (Subtitle)</label>
                          <input
                            type="text"
                            value={bookSubtitle}
                            onChange={(e) => setBookSubtitle(e.target.value)}
                            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="যেমন: সেরা রচনার কাস্টম সংকলন"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 block">কভার আর্ট কালার থিম</label>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => setCoverTheme('elegant-navy')}
                            className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                              coverTheme === 'elegant-navy' 
                                ? 'bg-slate-900 text-white ring-2 ring-indigo-605' 
                                : 'bg-slate-150 text-slate-700'
                            }`}
                          >
                            নেভি ব্লু
                          </button>
                          <button
                            onClick={() => setCoverTheme('vintage-sepia')}
                            className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                              coverTheme === 'vintage-sepia' 
                                ? 'bg-amber-900 text-white ring-2 ring-indigo-605' 
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            সেপিয়া ভিন্টেজ
                          </button>
                          <button
                            onClick={() => setCoverTheme('emerald-forest')}
                            className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                              coverTheme === 'emerald-forest' 
                                ? 'bg-emerald-950 text-white ring-2 ring-indigo-605' 
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            এমারেল্ড ফরেস্ট
                          </button>
                          <button
                            onClick={() => setCoverTheme('minimalist-white')}
                            className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                              coverTheme === 'minimalist-white' 
                                ? 'bg-white text-gray-800 ring-2 ring-indigo-605 border border-gray-200' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            মিনিমাল হোয়াইট
                          </button>
                        </div>
                      </div>

                      {/* Cover & Dynamic TOC Book Preview Box */}
                      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <h4 className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            কাস্টমাইজড ডিজিটাল প্রিভিউ (ডিজিটাল বইয়ের সূচিপত্র ও কভার পেইজ)
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsPreviewingReaderPDF(true)}
                            className="bg-indigo-50 hover:bg-indigo-150 text-indigo-700 font-bold px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1 shrink-0 self-start sm:self-auto transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            সম্পূর্ণ পিডিএফ (PDF View) প্রিভিউ করুন
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Mini Cover Preview */}
                          <div className={`p-6 rounded-lg text-center flex flex-col justify-between aspect-[1/1.4] max-w-[200px] mx-auto shadow-sm ${
                            coverTheme === 'elegant-navy' ? 'bg-slate-900 text-slate-100 border-l-[6px] border-indigo-500' :
                            coverTheme === 'vintage-sepia' ? 'bg-amber-955 text-amber-100 border-l-[6px] border-amber-600' :
                            coverTheme === 'emerald-forest' ? 'bg-emerald-950 text-emerald-100 border-l-[6px] border-indigo-400' :
                            'bg-stone-50 text-stone-805 border border-stone-200 border-l-[6px] border-stone-400'
                          }`}>
                            <div className="space-y-1">
                              <p className="text-[8px] tracking-widest uppercase opacity-75 font-mono">Special Compilation</p>
                              <div className="w-6 h-0.5 bg-current mx-auto my-1.5 opacity-40"></div>
                            </div>
                            
                            <div className="my-auto space-y-1.5 py-4">
                              <h5 className="font-extrabold text-xs tracking-tight line-clamp-2 leading-snug">{bookTitle || 'শিরোনামহীন বই'}</h5>
                              {bookSubtitle && <p className="text-[9px] opacity-75 line-clamp-1">{bookSubtitle}</p>}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="w-6 h-0.5 bg-current mx-auto my-1.5 opacity-40"></div>
                              <p className="text-[8px] tracking-wide font-medium truncate">Read2Print সংকলন</p>
                            </div>
                          </div>

                          {/* Mini Table of Contents Preview */}
                          <div className="bg-white p-5 rounded-lg border border-gray-150 flex flex-col justify-between aspect-[1/1.4] max-w-[200px] mx-auto shadow-sm overflow-hidden text-gray-700">
                            <div className="w-full">
                              <h5 className="font-bold text-[10px] text-center mb-2 pb-1 border-b border-gray-100">সূচিপত্র</h5>
                              <div className="space-y-1.5 text-[9px] max-h-[160px] overflow-y-auto">
                                {tableOfContents.length === 0 ? (
                                  <p className="text-gray-400 text-center py-6">কোনো রচনা যুক্ত করা হয়নি</p>
                                ) : (
                                  tableOfContents.map((toc, i) => (
                                    <div key={i} className="flex justify-between items-end gap-1">
                                      <span className="truncate font-semibold max-w-[110px]">{toc.title}</span>
                                      <div className="flex-1 border-b border-dotted border-gray-200 mx-1 mb-1"></div>
                                      <span className="font-mono text-gray-500 shrink-0">পাতা {toc.startPage}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            <div className="text-[8px] text-center text-gray-400 border-t border-gray-100 pt-1 font-mono">
                              Page 2 • Table of Contents
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Checkout actions inside cart step */}
                      <div className="flex justify-end pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('shipping')}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          পরবর্তী ধাপে যান (শিপিং ঠিকানা)
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SHIPPING ADDRESS PANEL (Step 2) */}
                  {checkoutStep === 'shipping' && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <MapPin className="w-4.5 h-4.5 text-indigo-600" />
                        ডেলিভারি ঠিকানা ও তথ্য প্রদান
                      </h3>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-650">প্রাপকের নাম *</label>
                            <input
                              type="text"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              placeholder="আপনার নাম লিখুন..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-650">মোবাইল নম্বর *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                              <input
                               type="tel"
                               required
                               value={customerPhone}
                               onChange={(e) => setCustomerPhone(e.target.value)}
                               className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                               placeholder="017XXXXXXXX"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-650">ডেলিভারি এলাকা *</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                              <input
                                type="radio"
                                checked={deliveryRegion === 'Dhaka'}
                                onChange={() => setDeliveryRegion('Dhaka')}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              ঢাকার ভিতরে (ডেলিভারি চার্জ: ৬০ টাকা)
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                              <input
                                type="radio"
                                checked={deliveryRegion === 'Outside Dhaka'}
                                onChange={() => setDeliveryRegion('Outside Dhaka')}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              ঢাকার বাইরে সমগ্র বাংলাদেশ (ডেলিভারি চার্জ: ১২০ টাকা)
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-650">পূর্ণাঙ্গ ডেলিভারি ঠিকানা (সড়ক, বাসা, এলাকা, থানা) *</label>
                          <textarea
                            required
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="যেমন: ৩/বি, লেক রোড, ধানমন্ডি, ঢাকা"
                          />
                        </div>

                        {/* Copyright terms checkbox */}
                        <div className="bg-amber-50/20 p-3.5 rounded-xl border border-amber-500/10 space-y-2 mt-4">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id="copyright-terms"
                              checked={agreedToTerms}
                              onChange={(e) => setAgreedToTerms(e.target.checked)}
                              className="mt-0.5 rounded-sm text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="copyright-terms" className="text-xs text-amber-900 leading-relaxed cursor-pointer select-none">
                              আমি স্বীকার করছি যে সংকলিত লেখাগুলোর মেধাস্বত্ব এবং কপিরাইটের পূর্ণ মালিকানা সংশ্লিষ্ট লেখকের। <b>Read2Print</b> প্ল্যাটফর্মটি কেবল কাস্টম প্রিন্টিং সেবা, বাইন্ডিং এবং হোম লজিস্টিক ডেলিভারি সুবিধা প্রদান করছে।
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('cart')}
                          className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold"
                        >
                          কার্টে ফিরে যান
                        </button>
                        <button
                          type="button"
                          onClick={handleInstantCheckoutStart}
                          className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          পেমেন্ট সম্পন্ন করার ধাপে যান
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* GATEWAY PAYMENT SIMULATOR (Step 3) */}
                  {checkoutStep === 'payment' && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <CreditCard className="w-4.5 h-4.5 text-emerald-600" />
                        নিরাপদ লোকাল পেমেন্ট গেটওয়ে (বিকাশ / নগদ / কার্ড)
                      </h3>

                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                        <button
                          onClick={() => { setPaymentMethod('bkash'); setPaymentStep('details'); }}
                          className={`p-3 rounded-xl flex flex-col items-center justify-center border transition-all ${
                            paymentMethod === 'bkash' 
                              ? 'border-pink-500 bg-pink-50/20 text-pink-700 font-bold' 
                              : 'border-gray-100 hover:bg-gray-50 text-gray-500'
                          }`}
                        >
                          <span className="text-[13px] tracking-wide">bkash (বিকাশ)</span>
                        </button>
                        <button
                          onClick={() => { setPaymentMethod('nagad'); setPaymentStep('details'); }}
                          className={`p-3 rounded-xl flex flex-col items-center justify-center border transition-all ${
                            paymentMethod === 'nagad' 
                              ? 'border-orange-500 bg-orange-50/20 text-orange-700 font-bold' 
                              : 'border-gray-100 hover:bg-gray-50 text-gray-500'
                          }`}
                        >
                          <span className="text-[13px] tracking-wide">Nagad (নগদ)</span>
                        </button>
                        <button
                          onClick={() => { setPaymentMethod('card'); setPaymentStep('details'); }}
                          className={`p-3 rounded-xl flex flex-col items-center justify-center border transition-all ${
                            paymentMethod === 'card' 
                              ? 'border-slate-800 bg-slate-50 text-slate-800 font-bold' 
                              : 'border-gray-100 hover:bg-gray-50 text-gray-500'
                          }`}
                        >
                          <span className="text-[13px] tracking-wide">Card (কার্ড)</span>
                        </button>
                      </div>

                      {/* Interactive Simulator Screen */}
                      <div className="max-w-md mx-auto pt-4">
                        {paymentMethod === 'card' ? (
                          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-200/50 pb-2">
                              <h4 className="text-xs font-bold text-stone-700">অনলাইন ক্রেডিট/ডেবিট কার্ড পেমেন্ট</h4>
                              <span className="text-[10px] text-stone-500 tracking-widest font-mono">VISA / MASTER</span>
                            </div>
                            
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              setIsPaying(true);
                              setTimeout(() => {
                                const finalOrder: Order = {
                                  id: 'R2P-' + Math.floor(100000 + Math.random() * 900000),
                                  customerName,
                                  phone: customerPhone,
                                  address: customerAddress,
                                  city: deliveryRegion,
                                  cartItems: [...cart],
                                  totalPages: totalBookPages,
                                  pageCost,
                                  bindingCost,
                                  deliveryCost,
                                  totalCost: grandTotal,
                                  paymentMethod: 'card',
                                  paymentStatus: 'paid',
                                  orderDate: new Date().toISOString().split('T')[0],
                                  status: 'Received'
                                };
                                onPlaceOrder(finalOrder);
                                onClearCart();
                                setIsPaying(false);
                                setCheckoutStep('completed');
                              }, 1500);
                            }} className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-600">কার্ড নম্বর</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="xxxx xxxx xxxx xxxx"
                                  className="w-full p-2 text-xs border border-stone-200 rounded-md bg-white font-mono"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-600">মেয়াদ শেষ (MM/YY)</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="12/28"
                                    className="w-full p-2 text-xs border border-stone-200 rounded-md bg-white font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-600">সিভিভি (CVV)</label>
                                  <input
                                    type="password"
                                    required
                                    maxLength={3}
                                    placeholder="***"
                                    className="w-full p-2 text-xs border border-stone-200 rounded-md bg-white font-mono"
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                disabled={isPaying}
                                className="w-full py-2.5 bg-stone-900 text-stone-100 hover:bg-stone-950 rounded-lg text-xs font-bold transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
                              >
                                {isPaying ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    প্রসেসিং হচ্ছে...
                                  </>
                                ) : (
                                  `টাকা ${grandTotal.toFixed(1)} পেমেন্ট করুন`
                                )}
                              </button>
                            </form>
                          </div>
                        ) : (
                          /* bKash/Nagad Screen Simulator */
                          <div className={`rounded-2xl overflow-hidden shadow-md border ${
                            paymentMethod === 'bkash' ? 'border-pink-600/40' : 'border-orange-600/40'
                          }`}>
                            {/* Simulator Header */}
                            <div className={`p-4 text-center text-white ${
                              paymentMethod === 'bkash' ? 'bg-pink-600' : 'bg-orange-600'
                            }`}>
                              <h4 className="font-extrabold text-sm tracking-wide">
                                {paymentMethod === 'bkash' ? 'বিকাশ পেমেন্ট গেটওয়ে' : 'নগদ পেমেন্ট গেটওয়ে'}
                              </h4>
                              <p className="text-[10px] opacity-90 mt-0.5">মার্চেন্ট: Read2Print Press Ltd.</p>
                              <div className="mt-2 bg-black/15 p-1 px-3 rounded-full inline-block font-mono text-xs font-bold">
                                পরিমাণ: {grandTotal.toFixed(1)} ৳
                              </div>
                            </div>

                            {/* Simulator Form body */}
                            <form onSubmit={handleSimulatePayment} className="p-5 bg-white space-y-4">
                              {paymentStep === 'details' && (
                                <div className="space-y-3">
                                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed text-center">
                                    আপনার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাকাউন্ট নম্বর দিন
                                  </p>
                                  <div className="space-y-1">
                                    <input
                                      type="tel"
                                      required
                                      maxLength={11}
                                      value={simPhoneNumber}
                                      onChange={(e) => setSimPhoneNumber(e.target.value)}
                                      placeholder="مثلاً 017XXXXXXXX"
                                      className="w-full p-2.5 text-sm text-center border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-emerald-550 focus:outline-hidden"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    className={`w-full py-2.5 text-white rounded-lg text-xs font-bold transition-all ${
                                      paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                  >
                                    এগিয়ে যান
                                  </button>
                                </div>
                              )}

                              {paymentStep === 'otp' && (
                                <div className="space-y-3">
                                  <div className="text-center">
                                    <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full inline-block border border-emerald-100">
                                      ওটিপি সিমুলেশন মোড
                                    </span>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5 font-medium">
                                      আপনার মোবাইল নম্বরে পাঠানো ৪ অঙ্কের ভেরিফিকেশন কোড (OTP) লিখুন
                                    </p>
                                    <p className="text-[10px] text-emerald-600 mt-1">টেস্ট করার জন্য <b>১২৩৪</b> লিখুন</p>
                                  </div>
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      required
                                      maxLength={4}
                                      value={simOTP}
                                      onChange={(e) => setSimOTP(e.target.value)}
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    className={`w-full py-2.5 text-white rounded-lg text-xs font-bold transition-all ${
                                      paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                  >
                                    ওটিপি ভেরিফাই করুন
                                  </button>
                                </div>
                              )}

                              {paymentStep === 'pin' && (
                                <div className="space-y-3">
                                  <div className="text-center">
                                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                                      আপনার ${paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাকাউন্টের গোপন পিন নম্বর দিন
                                    </p>
                                    <p className="text-[10px] text-red-500 mt-0.5">গোপনীয়তা নোট: এটি একটি সুরক্ষিত মক পেমেন্ট গেটওয়ে কোড। টেস্ট করতে যেকোনো ৪ সংখ্যা দিতে পারেন।</p>
                                  </div>
                                  <div className="space-y-1">
                                    <input
                                      type="password"
                                      required
                                      maxLength={5}
                                      value={simPIN}
                                      onChange={(e) => setSimPIN(e.target.value)}
                                      placeholder="এখানে আপনার পিন কোড দিন"
                                      className="w-full p-2.5 text-sm text-center border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={isPaying}
                                    className={`w-full py-2.5 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                      paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                  >
                                    {isPaying ? (
                                      <>
                                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        টাকা প্রসেস হচ্ছে...
                                      </>
                                    ) : (
                                      'পেমেন্ট নিশ্চিত করুন'
                                    )}
                                  </button>
                                </div>
                              )}
                            </form>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('shipping')}
                          className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold"
                        >
                          শিপিং তথ্য এডিট করুন
                        </button>
                        <span className="text-[11px] text-gray-400 font-medium">পদক্ষেপ ৩/৩ • পেমেন্ট গেটওয়ে</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-time Order Summary / Pricing Estimator sidebar */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 sticky top-4">
                    <h3 className="font-bold text-gray-800 text-sm pb-2 border-b border-gray-100 flex items-center justify-between">
                      <span>কার্ট রসিদ (Pricing Summary)</span>
                      <span className="text-[10px] text-gray-400 font-mono">লাইভ এস্টিমেটর</span>
                    </h3>

                    {cart.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">এখনো কোনো প্রবন্ধ যোগ করা হয়নি।</p>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span>প্রবন্ধের সংখ্যা:</span>
                          <span className="font-bold text-gray-800">{cart.length} টি</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span>মোট শব্দ সংখ্যা:</span>
                          <span className="font-mono text-gray-500">{cart.reduce((s, c) => s + c.wordCount, 0)} শব্দ</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span>হিসাবকৃত মোট পাতা (A4):</span>
                          <span className="font-bold text-emerald-700 font-mono">{totalBookPages} পৃষ্ঠা</span>
                        </div>

                        <div className="border-t border-dashed border-gray-100 pt-3 space-y-2">
                          <div className="flex justify-between items-center text-xs text-gray-650">
                            <span>পৃষ্ঠা খরচ (মোট পাতা × ১.৫ টাকা):</span>
                            <span className="font-mono text-gray-700">{pageCost.toFixed(1)} ৳</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>বাইন্ডিং চার্জ (ফিক্সড):</span>
                            <span className="font-mono text-gray-700">{bindingCost.toFixed(1)} ৳</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>ডেলিভারি চার্জ ({deliveryRegion === 'Dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'}):</span>
                            <span className="font-mono text-gray-700">{deliveryCost.toFixed(1)} ৳</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-bold text-gray-800 bg-gray-50/50 p-2.5 rounded-lg">
                          <span>সর্বমোট খরচ (Grand Total):</span>
                          <span className="text-emerald-700 font-mono text-base">{grandTotal.toFixed(1)} ৳</span>
                        </div>

                        {checkoutStep === 'cart' && (
                          <button
                            onClick={() => setCheckoutStep('shipping')}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            পরবর্তী ধাপে যান (শিপিং ঠিকানা)
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Completed Screen (Success Message) */}
            {checkoutStep === 'completed' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-emerald-500/20 text-center space-y-5 shadow-lg"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10 stroke-2" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-gray-800 text-xl">অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!</h3>
                  <p className="text-xs text-gray-500">আপনার কাস্টম প্রিন্ট অর্ডারটি আমাদের সিস্টেমে যুক্ত হয়েছে।</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left text-xs text-gray-600 space-y-2">
                  <p className="flex justify-between"><b>প্রাপকের নাম:</b> <span>{customerName}</span></p>
                  <p className="flex justify-between"><b>মোট পৃষ্ঠা সংখ্যা:</b> <span>{totalBookPages} পৃষ্ঠা</span></p>
                  <p className="flex justify-between"><b>মোট পরিশোধিত:</b> <span className="text-emerald-700 font-bold">{grandTotal.toFixed(1)} ৳</span></p>
                  <p className="flex justify-between"><b>পেমেন্ট মাধ্যম:</b> <span className="uppercase font-semibold">{paymentMethod} ({paymentMethod === 'card' ? 'কার্ড' : 'মোবাইল ব্যাংকিং'})</span></p>
                  <p className="flex justify-between"><b>পেমেন্ট স্ট্যাটাস:</b> <span className="text-emerald-700 font-bold">Paid</span></p>
                  <p className="flex justify-between"><b>শিপিং এলাকা:</b> <span>{deliveryRegion === 'Dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}</span></p>
                </div>

                <div className="bg-amber-50/35 border border-amber-500/10 p-3 rounded-lg text-[10px] text-amber-800 leading-relaxed text-justify mt-4">
                   💡 <b>অ্যাডমিন প্যানেল আপডেট:</b> এখন স্ক্রিনের ওপরের নেভিগেশন বার থেকে "অ্যাডমিন প্যানেল (Mngt Panel)" ট্যাব ক্লিক করে অর্ডারটির জন্য জেনারেট হওয়া <b>"প্রিন্ট-অর্ডার"</b> আপডেট করতে পারবেন।
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    setCheckoutStep('cart');
                    setActiveTab('discover');
                  }}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  নতুন লেখা খুঁজুন (Discover Panel)
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TAB 2.5: My Profile Tab */}
        {activeTab === 'my-profile' && (
          <motion.div
            key="my-profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {!currentWriter ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-4 max-w-md mx-auto">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-gray-800">আপনি এখনও লেখক হিসেবে নিবন্ধিত নন!</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  নিজের প্রবন্ধ বা কলাম প্রকাশ করতে এবং রিডার কয়েন থেকে রয়্যালটি আয় করতে আজই লেখক হিসেবে রেজিস্ট্রেশন করুন।
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('become-writer')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  লেখক হতে আবেদন করুন
                </button>
              </div>
            ) : (
              <WriterPanel
                currentWriter={currentWriter}
                articles={articles}
                onUpdateWriter={onUpdateWriter}
                onAddArticle={onAddArticle}
                onDeleteArticle={onDeleteArticle}
                onUpdateArticle={onUpdateArticle}
              />
            )}
          </motion.div>
        )}
        {/* TAB 5: Author Profiles */}
        {activeTab === 'author-profiles' && (
          <motion.div
            key="author-profiles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {selectedAuthorForProfile ? (
              // Detailed Author view
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-6 p-6">
                <button
                  onClick={() => setSelectedAuthorForProfile(null)}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-705 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                >
                  ← লেখক তালিকায় ফিরে যান
                </button>

                <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                  <img
                    src={selectedAuthorForProfile.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                    alt={selectedAuthorForProfile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md p-1"
                  />
                  <div className="space-y-2 text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-gray-950">{selectedAuthorForProfile.name}</h2>
                        <p className="text-xs text-gray-400">@{selectedAuthorForProfile.username}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          selectedAuthorForProfile.followers = (selectedAuthorForProfile.followers || 0) + 1;
                          alert(`আপনি সফলভাবে ${selectedAuthorForProfile.name}-কে ফলো করেছেন!`);
                          // Trigger render
                          setSelectedAuthorForProfile({ ...selectedAuthorForProfile });
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        অনুগমন করুন (Follow)
                      </button>
                    </div>
                    <p className="text-xs text-gray-650 leading-relaxed">
                      {selectedAuthorForProfile.bio || 'সৃজনশীল লেখার মাধ্যমে সমাজ বদলে নিরন্তর বিশ্বাসী কলাম লেখক।'}
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-slate-500 pt-2 justify-center md:justify-start">
                      <div>
                        <span className="font-bold text-slate-900">{articles.filter(a => a.writerId === selectedAuthorForProfile.id && a.status === 'published').length}</span> প্রকাশনা
                      </div>
                      <div>
                        <span className="font-bold text-slate-950">{selectedAuthorForProfile.followers || 0}</span> অনুগামী
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    📖 লেখকের প্রকাশিত রচনাবলি:
                  </h3>
                  
                  {articles.filter(a => a.writerId === selectedAuthorForProfile.id && a.status === 'published').length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 italic">লেখকের কোনো লেখা এখনো প্রকাশিত হয়নি।</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {articles.filter(a => a.writerId === selectedAuthorForProfile.id && a.status === 'published').map((post) => {
                        const isCoinLocked = (post.requiredCoins || 0) > 0;
                        return (
                          <div key={post.id} className="border border-slate-100 p-4 rounded-xl space-y-3 hover:bg-slate-50/50 transition-colors flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full">{post.category}</span>
                                {isCoinLocked && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-200">
                                    🔑 {post.requiredCoins} কয়েন
                                  </span>
                                )}
                              </div>
                              <h4 
                                onClick={() => setViewingArticle(post)}
                                className="font-extrabold text-gray-900 hover:text-indigo-600 cursor-pointer text-sm leading-snug line-clamp-2 flex items-center justify-between gap-1.5 flex-wrap"
                              >
                                <span>{post.title}</span>
                                <span className="inline-flex items-center gap-0.5 text-xs bg-amber-50 text-amber-600 font-bold border border-amber-100 px-1.5 py-0.5 rounded-full shrink-0 select-none font-mono" title="প্রয়োজনীয় কয়েন">
                                  🪙 {post.requiredCoins || 0}
                                </span>
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                                <span>{post.wordCount} শব্দ</span>
                                <span className="text-slate-200">|</span>
                                <span className="text-indigo-600/85 font-semibold flex items-center gap-0.5 bg-indigo-50 px-1 py-0.2 rounded-sm" title="মোট পঠন সংখ্যা">
                                  👁️ {post.reads || 0} বার
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed text-justify">
                                {post.content}
                              </p>
                            </div>
                            <button
                              onClick={() => setViewingArticle(post)}
                              className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors mt-2"
                            >
                              {isCoinLocked && !unlockedArticles.includes(post.id) ? 'প্রিভিউ পড়ুন' : 'বিস্তারিত প্রবন্ধ পড়ুন'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Authors directory list
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/30 p-5 rounded-2xl border border-indigo-200/40">
                  <h3 className="font-extrabold text-gray-900 text-sm md:text-base">নিবন্ধিত প্রথিতযশা কলামিস্ট ও লেখকবৃন্দ</h3>
                  <p className="text-xs text-gray-500 leading-normal">
                    সৃজনশীল লেখকদের যেকোনো প্রোফাইল ঘেটে ঘুরে দেখুন, তাদের বায়োগ্রাফি পড়ুন এবং তাদের তৈরিকৃত সেরা জ্ঞানগর্ভ রচনাবলি অন্বেষণ করুন।
                  </p>
                </div>

                <div className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table id="authors-table" className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50/75">
                        <tr className="divide-x divide-slate-100">
                          <th scope="col" className="px-4 py-3.5 text-xs font-bold text-gray-750 text-center uppercase tracking-wider">🏆 রেটিং (Rating)</th>
                          <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-750 uppercase tracking-wider">✍️ লেখকের নাম ও প্রোফাইল</th>
                          <th scope="col" className="px-4 py-3.5 text-xs font-bold text-gray-750 text-center uppercase tracking-wider">📝 প্রকাশনা</th>
                          <th scope="col" className="px-4 py-3.5 text-xs font-bold text-gray-750 text-center uppercase tracking-wider">👥 ফলোয়ার</th>
                          <th scope="col" className="px-4 py-3.5 text-xs font-bold text-gray-750 text-center uppercase tracking-wider">✨ অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(shuffledWriters.length > 0 ? shuffledWriters : writers).map((writer, index) => {
                          const writerPosts = articles.filter(a => a.writerId === writer.id && a.status === 'published');
                          const rating = index < 10 ? (4.95 - (index * 0.05)).toFixed(1) : null;
                          
                          return (
                            <tr key={writer.id} className="hover:bg-slate-50/40 transition-colors">
                              {/* রেটিং (Rating) */}
                              <td className="whitespace-nowrap px-4 py-4 text-center">
                                {rating ? (
                                  <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-705 text-xs font-extrabold font-mono">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                    <span>{rating}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-300 font-bold font-sans">—</span>
                                )}
                              </td>
                              {/* লেখক (Name) */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={writer.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                                    alt={writer.name}
                                    onClick={() => setSelectedAuthorForProfile(writer)}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                                  />
                                  <div className="text-left">
                                    <div 
                                      onClick={() => setSelectedAuthorForProfile(writer)}
                                      className="font-extrabold text-gray-900 text-xs md:text-sm hover:text-indigo-650 hover:underline cursor-pointer progression-underline transition-colors"
                                    >
                                      {writer.name}
                                    </div>
                                    <div className="text-[10px] text-gray-450 font-mono">@{writer.username}</div>
                                    {writer.bio && (
                                      <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 max-w-xs">{writer.bio}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {/* প্রকাশনা (Publications) */}
                              <td className="whitespace-nowrap px-4 py-4 text-center font-mono text-xs md:text-sm font-bold text-gray-700">
                                {writerPosts.length} টি
                              </td>
                              {/* ফলোয়ার (Followers) */}
                              <td className="whitespace-nowrap px-4 py-4 text-center font-mono text-xs md:text-sm font-bold text-indigo-650">
                                {writer.followers || 0} জন
                              </td>
                              {/* বিস্তারিত (Action) */}
                              <td className="whitespace-nowrap px-4 py-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAuthorForProfile(writer)}
                                  className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-4xs hover:shadow-3xs transition-all"
                                >
                                  প্রোফাইল দেখুন
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 6: Coin Store Tab */}
        {activeTab === 'coin-store' && (
          <motion.div
            key="coin-store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Wallet header */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-2xl shadow-xs border border-orange-600/10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-2 relative z-10 text-center md:text-left">
                <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  রিডার ওয়ালেট জোন
                </span>
                <h2 className="text-xl md:text-2xl font-black">আমার পাঠক ওয়ালেট ও কয়েন ব্যালেন্স</h2>
                <p className="text-xs text-amber-50 font-normal max-w-lg">
                  লক থাকা প্রিমিয়াম প্রবন্ধগুলো পড়তে অথবা লেখককে উপহার দিতে কয়েন ব্যালেন্স ব্যবহার করুন। নিচে দেওয়া যেকোনো একটি প্যাকেজ রিচার্জ করুন।
                </p>
              </div>

              <div className="bg-white/10 px-6 py-4 rounded-2xl flex flex-col items-center shrink-0 border border-white/20 shadow-xs relative z-10">
                <Coins className="w-8 h-8 text-amber-100 animate-bounce" />
                <span className="text-[10px] text-amber-100 font-bold uppercase mt-1">কারেন্ট ওয়ালেট</span>
                <span className="text-2xl md:text-3xl font-black text-white font-mono leading-none mt-1">{readerCoins} <span className="text-sm">কয়েন</span></span>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-900 text-sm md:text-base flex items-center gap-1">
                🪙 অফার সংবলিত কয়েন রিচার্জ প্যাকেজসমূহ:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'pkg-1', price: 10, coins: 100, tag: 'সিলভার কার্ড' },
                  { id: 'pkg-2', price: 20, coins: 300, tag: 'গোল্ড ভ্যালু', hot: true },
                  { id: 'pkg-3', price: 50, coins: 1000, tag: 'প্লাটিনাম বোনাস' }
                ].map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className={`bg-white border-2 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden transition-all hover:shadow-md ${
                      pkg.hot ? 'border-amber-500 shadow-3xs' : 'border-slate-200'
                    }`}
                  >
                    {pkg.hot && (
                      <span className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[9px] font-black px-3.5 py-1 rounded-bl-xl uppercase tracking-wider animate-pulse">
                        Best Value
                      </span>
                    )}

                    <div className="space-y-2">
                      <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{pkg.tag}</span>
                      <h4 className="text-2xl font-black text-gray-950 font-mono flex items-center gap-1.5">
                        {pkg.coins} <span className="text-sm font-semibold text-gray-500">কয়েন</span>
                      </h4>
                      <p className="text-xs text-gray-400">
                        প্রতি কয়েন মাত্র { (pkg.price / pkg.coins).toFixed(2) } টাকা মূল্যে এখনই রিচার্জ করুন।
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500">পরিশোধযোগ্য মূল্য:</span>
                        <span className="text-lg font-mono font-black text-slate-900">৳ {pkg.price} টাকা</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setPayingPackage(pkg);
                          setCoinSelectedGateway('bKash');
                          setCoinPaymentStep('method');
                          setCoinPhoneNumber('');
                          setCoinOTP('');
                          setCoinPIN('');
                          setCoinIsProcessing(false);
                          setCoinPaymentError('');
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                          pkg.hot 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-3xs' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-4xs'
                        }`}
                      >
                        প্যাকেজ ক্রয় করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: Become Writer Form Tab */}
        {activeTab === 'become-writer' && (
          <motion.div
            key="become-writer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Banner details */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xs border border-indigo-950/20 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="space-y-2 relative z-10 text-center md:text-left">
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  লেখক রেজিস্ট্রেশন পোর্টাল
                </span>
                <h2 className="text-xl md:text-2xl font-black">আমাদের সাথে লেখক হিসেবে যুক্ত হোন ✍️</h2>
                <p className="text-xs text-indigo-205 font-normal max-w-xl text-justify leading-relaxed">
                  আপনার কি লিখতে ভালো লাগে? আপনার লেখা কলাম ও ব্লগ ছড়িয়ে দিন হাজারো পাঠকের কাছে। আবেদনপত্রটি সম্পূর্ণ করুন এবং ২টি মানসম্মত লেখা প্রকাশ করুন। অ্যাডমিন আপনার লেখা অনুমোদন করলে আপনি কন্টেন্টে প্রাপ্ত রিডার কয়েন সরাসরি বিকাশ নাম্বারে ক্যাশআউট করতে পারবেন!
                </p>
              </div>
              <div className="bg-white/10 px-5 py-4 rounded-xl flex flex-col items-center shrink-0 border border-white/10 shadow-xs relative z-10 font-sans">
                <span className="text-sm font-bold">⭐️ ৩% প্ল্যাটফর্ম ফি</span>
                <span className="text-xs text-slate-300 font-medium mt-1">৭৫% আপনার রয়্যালটি</span>
              </div>
            </div>

            {appSubmittedSuccess ? (
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-md"
              >
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm font-black animate-bounce pb-1">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-emerald-800">আবেদন সফল হয়েছে!</h3>
                  <p className="text-xs text-emerald-700 leading-relaxed font-semibold">
                    আপনার লেখক হওয়ার আবেদনটি সফলভাবে আমাদের সিস্টেমে সংরক্ষিত হয়েছে। আমাদের সম্পাদক ও অ্যাডমিন প্যানেল আপনার সংযুক্তি দুইটি লেখা অত্যন্ত গুরুত্বসহকারে বিবেচনা করবে। অনুমোদন লাভ করার পর পরই আপনার লেখাগুলো সরাসরি হোমপেজে দেখতে পাবেন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAppSubmittedSuccess(false);
                    setActiveTab('discover');
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-heavy text-xs rounded-xl shadow-xs transition-colors font-sans"
                >
                  হোম পেজে ফিরে যান
                </button>
              </motion.div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!appFormName || !appFormBKash || !appFormBio || !appFormAddress || 
                      !appFormSampleTitle1 || !appFormSampleContent1 || 
                      !appFormSampleTitle2 || !appFormSampleContent2) {
                    alert('দয়া করে ফর্মের প্রতিটি ক্ষেত্র সঠিকভাবে পূরণ করুন।');
                    return;
                  }

                  const newApplication = {
                    id: 'APP-' + Date.now(),
                    name: appFormName,
                    bKashNumber: appFormBKash,
                    bio: appFormBio,
                    address: appFormAddress,
                    sampleTitle1: appFormSampleTitle1,
                    sampleCategory1: appFormSampleCategory1,
                    sampleContent1: appFormSampleContent1,
                    sampleTitle2: appFormSampleTitle2,
                    sampleCategory2: appFormSampleCategory2,
                    sampleContent2: appFormSampleContent2,
                    status: 'pending',
                    appliedDate: new Date().toISOString().split('T')[0]
                  };

                  onAddWriterApplication(newApplication);
                  setAppSubmittedSuccess(true);
                  
                  // Reset form fields
                  setAppFormName('');
                  setAppFormBKash('');
                  setAppFormBio('');
                  setAppFormAddress('');
                  setAppFormSampleTitle1('');
                  setAppFormSampleContent1('');
                  setAppFormSampleTitle2('');
                  setAppFormSampleContent2('');
                }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-gray-150 space-y-6 text-left"
              >
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-1.5">
                    📝 আপনার বিবরণী ও বিকাশ মোবাইল নম্বর
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">সবগুলো ক্ষেত্র সঠিক তথ্য দিয়ে পূরণ করা আবশ্যক</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-655 block">আপনার পূর্ণ নাম: *</label>
                    <input
                      type="text"
                      required
                      value={appFormName}
                      onChange={(e) => setAppFormName(e.target.value)}
                      placeholder="উদা: ড. মইনুল ইসলাম"
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-655 block">বিকাশের ব্যক্তিগত নম্বর (bKash Mobile): *</label>
                    <input
                      type="text"
                      maxLength={11}
                      required
                      value={appFormBKash}
                      onChange={(e) => setAppFormBKash(e.target.value.replace(/\D/g, ''))}
                      placeholder="উদা: ০১৭XXXXXXXX"
                      className="w-full p-2.5 text-xs font-mono border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-655 block">পরিচিতি ও লেখক জীবনবৃত্তান্ত (Bio): *</label>
                  <textarea
                    required
                    value={appFormBio}
                    onChange={(e) => setAppFormBio(e.target.value)}
                    rows={2}
                    placeholder="আপনার কাজের অভিজ্ঞতা, প্রিয় জ্ঞানক্ষেত্র ও পেশাদার পরিচিতি সংক্ষেপে লিখুন..."
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-655 block">পূর্ণ বাসভবন ঠিকানা: *</label>
                  <input
                    type="text"
                    required
                    value={appFormAddress}
                    onChange={(e) => setAppFormAddress(e.target.value)}
                    placeholder="রোড নম্বর, উপজেলা, জেলা ও পোস্ট অফিস কোড"
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>

                {/* Submissions sections */}
                <div className="border-t border-gray-150 pt-5 space-y-6">
                  <div className="border-b border-gray-150 pb-2">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-1.5">
                      📖 আপনার অসাধারণ ২টি সেরা লেখা সংযুক্তি
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-semibold text-amber-600">আবেদনপত্রটি এপ্রুভ হওয়ার সাথে সাথেই আপনার এই লেখাগুলো সরাসরি হোমপেজে প্রকাশিত হবে</p>
                  </div>

                  {/* Article 1 */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-200 space-y-4">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans shadow-xs">১ম সংযুক্তি লেখা</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 block">১ম লেখার শিরোনাম: *</label>
                        <input
                          type="text"
                          required
                          value={appFormSampleTitle1}
                          onChange={(e) => setAppFormSampleTitle1(e.target.value)}
                          placeholder="উদা: আমাদের সংস্কৃতির ভবিষ্যৎ ও বর্তমান সংকট"
                          className="w-full p-2.5 bg-white text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 block">১ম লেখার ক্যাটাগরি: *</label>
                        <select
                          required
                          value={appFormSampleCategory1}
                          onChange={(e) => setAppFormSampleCategory1(e.target.value as any)}
                          className="w-full p-2.5 bg-white text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15 font-bold text-slate-700"
                        >
                          {['সাহিত্য', 'বিজ্ঞান', 'রাজনীতি', 'অর্থনীতি', 'ধর্ম', 'দর্শন'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">১ম লেখার সম্পূর্ণ বিষয়বস্তু: *</label>
                      <textarea
                        required
                        value={appFormSampleContent1}
                        onChange={(e) => setAppFormSampleContent1(e.target.value)}
                        rows={5}
                        placeholder="আপনার ১ম লেখাটির সম্পূর্ণ কথামালা এখানে সুন্দরভাবে কম্পোজ করুন..."
                        className="w-full p-2.5 bg-white text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>

                  {/* Article 2 */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-200 space-y-4">
                    <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans shadow-xs">২য় সংযুক্তি লেখা</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 block">২য় লেখার শিরোনাম: *</label>
                        <input
                          type="text"
                          required
                          value={appFormSampleTitle2}
                          onChange={(e) => setAppFormSampleTitle2(e.target.value)}
                          placeholder="উদা: কৃত্রিম বুদ্ধিমত্তা ও মানুষের বুদ্ধিবৃত্তি"
                          className="w-full p-2.5 bg-white text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 block">২য় লেখার ক্যাটাগরি: *</label>
                        <select
                          required
                          value={appFormSampleCategory2}
                          onChange={(e) => setAppFormSampleCategory2(e.target.value as any)}
                          className="w-full p-2.5 bg-white text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15 font-bold text-slate-700"
                        >
                          {['সাহিত্য', 'বিজ্ঞান', 'রাজনীতি', 'অর্থনীতি', 'ধর্ম', 'দর্শন'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">২য় লেখার সম্পূর্ণ বিষয়বস্তু: *</label>
                      <textarea
                        required
                        value={appFormSampleContent2}
                        onChange={(e) => setAppFormSampleContent2(e.target.value)}
                        rows={5}
                        placeholder="আপনার ২য় লেখাটির সম্পূর্ণ কথামালা এখানে সুন্দরভাবে কম্পোজ করুন..."
                        className="w-full p-2.5 bg-white text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs tracking-wide transition-all hover:shadow-md"
                  >
                    আবেদনপত্র জমা দিন
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARTICLE READER VIEW MODAL */}
      <AnimatePresence>
        {viewingArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-gray-105 flex justify-between items-center bg-gray-50/50 relative">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {viewingArticle.category}
                  </span>
                  {viewingArticle.subCategory && (
                    <span className="text-[10px] text-gray-500 font-medium">/{viewingArticle.subCategory}</span>
                  )}
                  {/* Reading progress badge */}
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1 shadow-2xs">
                    📖 {readingScrollProgress}% পঠিত
                  </span>
                </div>
                <button
                  onClick={() => setViewingArticle(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-250 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all text-sm font-bold"
                >
                  ✕
                </button>

                {/* Progress bar indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-150" 
                    style={{ width: `${readingScrollProgress}%` }}
                  />
                </div>
              </div>

              {/* Scrollable Contents */}
              <div 
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const totalHeight = target.scrollHeight - target.clientHeight;
                  if (totalHeight > 0) {
                    const progress = (target.scrollTop / totalHeight) * 100;
                    setReadingScrollProgress(Math.min(100, Math.round(progress)));
                  } else {
                    setReadingScrollProgress(0);
                  }
                }}
                className="p-6 md:p-8 overflow-y-auto space-y-5 leading-relaxed text-gray-800"
              >
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-extrabold text-indigo-700 leading-snug">
                    {viewingArticle.title}
                  </h1>
                  
                  <div 
                    onClick={() => handleViewAuthorProfileByWriterName(viewingArticle.writerName)}
                    className="flex items-center gap-3 py-1 text-xs text-gray-600 cursor-pointer hover:text-indigo-650 group/modal-author"
                  >
                    <img 
                      src={viewingArticle.writerAvatar} 
                      alt="" 
                      className="w-6 h-6 rounded-full object-cover group-hover/modal-author:ring-2 group-hover/modal-author:ring-indigo-400 transition-all animate-fade-in" 
                    />
                    <div>
                      <span className="font-bold group-hover/modal-author:underline">{viewingArticle.writerName}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-400 hover:text-indigo-505">কারেন্ট প্রোফাইল দেখুন</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-400">প্রকাশিত: {viewingArticle.createdAt}</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const isLocked = (viewingArticle.requiredCoins || 0) > 0 && !unlockedArticles.includes(viewingArticle.id);
                  if (isLocked) {
                    // Show free partial preview (first paragraph or ~150 chars)
                    const fullText = viewingArticle.content;
                    const previewLength = Math.min(fullText.length, 160);
                    const previewText = fullText.substring(0, previewLength) + '...';
                    return (
                      <div className="space-y-6">
                        <div 
                          className="text-xs md:text-sm text-gray-500 italic leading-relaxed text-justify space-y-4 font-sans border-t border-gray-100 pt-5 pr-1"
                          dangerouslySetInnerHTML={{ 
                            __html: previewText.replace(/\n/g, '<br />')
                          }}
                        />
                        
                        {/* Lock Overlay Banner */}
                        <div className="bg-gradient-to-b from-amber-50 to-orange-50/80 border border-amber-200 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-3xs relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />
                          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-md">
                            <Coins className="w-6 h-6 stroke-2" />
                          </div>
                          
                          <div className="space-y-1.5 max-w-md">
                            <h3 className="font-extrabold text-amber-900 text-sm md:text-base">নিবন্ধটি লক করা রয়েছে!</h3>
                            <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                              এই লেখাটির বাকি অংশ পড়তে লেখকের কাস্টম নির্ধারিত <strong>{viewingArticle.requiredCoins} কয়েন</strong> প্রয়োজন।
                            </p>
                          </div>

                          <div className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-xs text-slate-700 font-bold flex items-center gap-1.5 shadow-2xs font-mono">
                            <span>আপনার কয়েন ব্যালেন্স:</span>
                            <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                              {readerCoins} 🪙
                            </span>
                          </div>

                          {readerCoins >= (viewingArticle.requiredCoins || 0) ? (
                            <button
                              onClick={() => {
                                const cost = viewingArticle.requiredCoins || 0;
                                setReaderCoins(prev => {
                                  const nextC = prev - cost;
                                  localStorage.setItem('r2p_reader_coins', String(nextC));
                                  return nextC;
                                });
                                setUnlockedArticles(prev => {
                                  const nextU = [...prev, viewingArticle.id];
                                  localStorage.setItem('r2p_unlocked_articles', JSON.stringify(nextU));
                                  return nextU;
                                });
                                onAwardCoinsToWriter(viewingArticle.writerId, cost);
                              }}
                              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.02]"
                            >
                              <Coins className="w-4 h-4" />
                              {viewingArticle.requiredCoins} কয়েন দিয়ে এখনই আনলক করুন
                            </button>
                          ) : (
                            <div className="space-y-2 w-full max-w-xs">
                              <button
                                disabled
                                className="w-full px-6 py-2.5 bg-gray-300 text-gray-500 font-bold text-xs rounded-xl cursor-not-allowed"
                              >
                                পর্যাপ্ত কয়েন ব্যালেন্স নেই
                              </button>
                              <button
                                onClick={() => {
                                  setViewingArticle(null);
                                  setActiveTab('coin-store');
                                }}
                                className="text-[11px] font-bold text-indigo-650 hover:text-indigo-855 flex items-center justify-center gap-1 mx-auto"
                              >
                                এখানে ক্লিক করে রিচার্জ স্টোরে কয়েন কিনুন
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    // Show full unlocked contents with Author Gifting feature at bottom
                    return (
                      <div className="space-y-6">
                        <div 
                          className="text-xs md:text-sm text-gray-800 leading-relaxed text-justify space-y-4 font-sans border-t border-gray-100 pt-5 pr-1"
                          dangerouslySetInnerHTML={{ 
                            __html: viewingArticle.content.replace(/\n/g, '<br />')
                          }}
                        />

                        {/* Gift Options Box */}
                        <div className="bg-gradient-to-br from-indigo-50/50 to-slate-100 border border-indigo-150 p-5 rounded-2xl space-y-4 mt-8 shadow-4xs">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                লেখাটি ভালো লেগেছে? লেখককে গিফট করুন!
                              </h4>
                              <p className="text-[11px] text-slate-500 leading-normal">
                                লেখকের চমৎকার এই সৃষ্টির জন্য আপনার পাঠক ওয়ালেট কয়েন থেকে বোনাস গিফট প্রমিজ করতে পারেন।
                              </p>
                            </div>
                            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 shrink-0 font-bold">
                              ব্যালেন্স: <span className="text-amber-600">{readerCoins} 🪙</span>
                            </div>
                          </div>

                           <div className="grid grid-cols-3 gap-3">
                            {[10, 50, 100].map((giftVal) => {
                              const isGlowing = glowingGiftValue === giftVal;
                              return (
                                <button
                                  key={giftVal}
                                  onClick={() => {
                                    if (readerCoins < giftVal) {
                                      alert('দুঃখিত, গিফট করার জন্য পর্যাপ্ত কয়েন ব্যালেন্স নেই!');
                                      return;
                                    }
                                    // Start the glow timer
                                    setGlowingGiftValue(giftVal);
                                    
                                    setReaderCoins(prev => {
                                      const nextCoins = prev - giftVal;
                                      localStorage.setItem('r2p_reader_coins', String(nextCoins));
                                      return nextCoins;
                                    });
                                    onAwardCoinsToWriter(viewingArticle.writerId, giftVal);
                                    
                                    // Complete transaction alert and stop glowing after 1 second
                                    setTimeout(() => {
                                      setGlowingGiftValue(null);
                                      alert(`সফল হয়েছে! আপনি লেখক ${viewingArticle.writerName}-কে ${giftVal} কয়েন উপহার প্রদান করেছেন।`);
                                    }, 1000);
                                  }}
                                  className={`p-3 rounded-xl text-center text-xs font-black transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                                    isGlowing
                                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-500 scale-105 shadow-[0_0_25px_rgba(245,158,11,0.9)] ring-4 ring-amber-400/50 animate-bounce'
                                      : 'bg-white border border-indigo-100 hover:border-amber-400 hover:bg-amber-50/20 text-slate-750 hover:text-amber-850 shadow-4xs'
                                  }`}
                                >
                                  <span className="text-xl">🎁</span>
                                  <span>{giftVal} কয়েন</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100">
                  {viewingArticle.tags.map((t, index) => (
                    <span key={index} className="bg-gray-150 text-gray-600 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer bar */}
              <div className="p-4 border-t border-gray-50 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>~{calculateArticlePages(viewingArticle.wordCount)} এ৪ পাতা লাগবে প্রিন্ট করতে।</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      handleToggleReadLater(viewingArticle.id);
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                      savedArticles.includes(viewingArticle.id)
                        ? 'bg-indigo-50 text-indigo-805 border-indigo-200'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    {savedArticles.includes(viewingArticle.id) ? 'বুকশেলফ থেকে সরান' : 'ফোল্ডারে সেভ'}
                  </button>
                  <button
                    onClick={() => {
                      const isLocked = (viewingArticle.requiredCoins || 0) > 0 && !unlockedArticles.includes(viewingArticle.id);
                      if (isLocked) {
                        alert(`এই লেখাটি প্রিন্ট বাস্কেটে যুক্ত করতে হলে প্রথমে ${viewingArticle.requiredCoins} কয়েন দিয়ে লেখাটি আনলক করতে হবে।`);
                        return;
                      }
                      const isInCart = cart.some(item => item.articleId === viewingArticle.id);
                      if (isInCart) {
                        onRemoveFromCart(viewingArticle.id);
                      } else {
                        onAddToCart({
                          articleId: viewingArticle.id,
                          articleTitle: viewingArticle.title,
                          writerName: viewingArticle.writerName,
                          wordCount: viewingArticle.wordCount,
                          content: viewingArticle.content
                        });
                      }
                      setViewingArticle(null);
                    }}
                    className={`flex-1 sm:flex-initial px-4.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      ((viewingArticle.requiredCoins || 0) > 0 && !unlockedArticles.includes(viewingArticle.id))
                        ? 'bg-gray-150 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                        : cart.some(item => item.articleId === viewingArticle.id)
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    {((viewingArticle.requiredCoins || 0) > 0 && !unlockedArticles.includes(viewingArticle.id))
                      ? 'লক করা (প্রিন্ট করতে আনলক করুন)'
                      : cart.some(item => item.articleId === viewingArticle.id) ? 'বুক থেকে বাদ দিন' : 'অ্যাড টু প্রিন্ট'
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAVE CUSTOM FOLDER MODAL */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-5 max-w-sm w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="font-bold text-gray-800 text-sm">নতুন সংকলন ফোল্ডার</h4>
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomFolder} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">ফোল্ডারের নাম লিখুন</label>
                  <input
                    type="text"
                    required
                    value={folderNameInput}
                    onChange={(e) => setFolderNameInput(e.target.value)}
                    placeholder="যেমন: আষাঢ়ের কবিতা সংকলন, বিজ্ঞান রহস্য"
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFolderModalOpen(false)}
                    className="flex-1 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                  >
                    তৈরি ও সেভ করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEWSPAPER LIVE READER MODAL */}
      <AnimatePresence>
        {viewingNewsArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-55"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-stone-50 text-stone-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200 relative font-serif"
            >
              {/* Newspaper Masthead Simulation */}
              <div className="p-5 border-b-4 border-double border-stone-800 bg-white flex flex-col items-center justify-center text-center space-y-1.5 shrink-0">
                <div className="flex justify-between w-full items-center">
                  <span className="text-[10px] text-gray-505 font-sans tracking-widest uppercase">Live Archive</span>
                  <span className="text-[10px] text-gray-505 font-sans tracking-widest uppercase">{viewingNewsArticle.date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-stone-900 font-serif border-b border-stone-300 pb-1 px-4">{viewingNewsArticle.paperName}</h2>
                <p className="text-[10px] text-stone-500 font-sans tracking-widest uppercase">লাইভ ফিড • ঢাকা, বাংলাদেশ • দৈনিক সংখ্যা</p>
              </div>

              {/* Newspaper Article Body */}
              <div className="p-8 overflow-y-auto space-y-5 leading-relaxed text-stone-900 bg-stone-50 flex-1">
                <div className="space-y-3">
                  <span className="bg-stone-200 text-stone-850 text-[10px] font-sans font-bold px-2 py-0.5 rounded-sm">
                    {viewingNewsArticle.category}
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-stone-950 leading-snug">
                    {viewingNewsArticle.title}
                  </h1>
                  
                  <div className="flex items-center gap-3 py-1.5 text-xs text-stone-700 border-y border-stone-300 font-sans">
                    <div>
                      <span>বিশেষ কলাম লেখক: <b>{viewingNewsArticle.writer}</b></span>
                      <span className="mx-2 text-stone-400">•</span>
                      <span>~{viewingNewsArticle.wordCount} শব্দ</span>
                    </div>
                  </div>
                </div>

                {/* Simulated newspaper columns */}
                <div className="text-sm md:text-base text-stone-850 space-y-4 font-serif text-justify leading-relaxed indent-8 whitespace-pre-wrap">
                  {viewingNewsArticle.content}
                </div>
              </div>

              {/* Newspaper Footer actions */}
              <div className="p-4 bg-white border-t border-stone-200 flex justify-between items-center shrink-0 font-sans">
                <button
                  type="button"
                  onClick={() => setViewingNewsArticle(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg text-xs font-semibold"
                >
                  ফিরে যান (বন্ধ করুন)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const isInCart = cart.some(item => item.articleId === viewingNewsArticle.id);
                      if (isInCart) {
                        onRemoveFromCart(viewingNewsArticle.id);
                      } else {
                        onAddToCart({
                          articleId: viewingNewsArticle.id,
                          articleTitle: `[${viewingNewsArticle.paperName}] ${viewingNewsArticle.title}`,
                          writerName: viewingNewsArticle.writer,
                          wordCount: viewingNewsArticle.wordCount,
                          content: viewingNewsArticle.content
                        });
                      }
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      cart.some(item => item.articleId === viewingNewsArticle.id)
                        ? 'bg-amber-100 text-amber-805 border border-amber-200 hover:bg-amber-205'
                        : 'bg-indigo-650 hover:bg-indigo-750 text-white shadow-xs'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {cart.some(item => item.articleId === viewingNewsArticle.id) ? 'বাস্কেট থেকে সরান' : 'প্রিন্ট বাস্কেটে যুক্ত করুন'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* READER "PRINT-READY PDF" MODAL PREVIEW */}
      <AnimatePresence>
        {isPreviewingReaderPDF && (
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
                    <h3 className="font-bold text-xs md:text-sm">ডিজিটাল পিডিএফ প্রিভিউ (Reader Custom Book Preview)</h3>
                    <p className="text-[10px] text-slate-400">এ৪ সাইজ ডাবল-সাইড প্রিন্ট বিন্যাস ও কভার পেজ প্রিভিউ</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert(`ডাউনলোড সফল!\nআপনার তৈরি করা কাস্টম বই "${bookTitle || 'সংকলন'}" এর প্রফেশনাল পিডিএফ প্রুফ কপি ডাউনলোড করা হচ্ছে...`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    পিডিএফ ডাউনলোড
                  </button>
                  <button
                    onClick={() => setIsPreviewingReaderPDF(false)}
                    className="px-3.5 py-1.5 bg-white/10 text-white hover:bg-white/20 text-xs rounded-lg transition-all font-bold animate-pulse-subtle"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>

              {/* Book Layout Rendering Container */}
              <div className="p-6 md:p-10 overflow-y-auto bg-slate-100 flex-1 space-y-12">
                <div className="bg-indigo-50 text-indigo-905 p-4 rounded-xl text-xs max-w-2xl mx-auto border border-indigo-100 shadow-xs">
                  📖 <b>বুকলেট প্রিভিউ নির্দেশিকা:</b> এটি আপনার কাস্টমাইজড ডিজিটাল পান্ডুলিপি। প্রথম ২টি পৃষ্ঠা কভার ও সূচিপত্র হিসেবে প্রস্তুত করা হয়েছে। পরবর্তী পৃষ্ঠাগুলোতে আপনার নির্বাচিত প্রবন্ধসমূহ ১.৫ ইঞ্চি মার্জিন সহ ২ কলামে বই ফন্টে বিন্যস্ত করা হয়েছে।
                </div>

                {cart.length === 0 ? (
                  <div className="bg-white max-w-lg mx-auto p-12 text-center rounded-xl border border-gray-200">
                    <p className="text-gray-500 font-bold">প্রিভিউ দেখানোর জন্য কোনো আর্টিকেল যুক্ত করা হয়নি।</p>
                  </div>
                ) : (
                  <>
                    {/* PAGE 1: COVER PAGE */}
                    <div className="bg-white max-w-lg mx-auto aspect-[1/1.41] shadow-lg border border-slate-200 p-12 flex flex-col justify-between relative text-center">
                      <div className={`absolute left-0 top-0 bottom-0 w-4 ${
                        coverTheme === 'elegant-navy' ? 'bg-slate-900' :
                        coverTheme === 'vintage-sepia' ? 'bg-amber-900' :
                        coverTheme === 'emerald-forest' ? 'bg-emerald-950' :
                        'bg-stone-400'
                      }`} />
                      
                      <div className="space-y-2">
                        <p className="text-[10px] tracking-widest font-mono text-slate-400 font-bold">READ2PRINT CUSTOM BOOKLET</p>
                        <div className="h-1 bg-slate-100 w-24 mx-auto my-3"></div>
                      </div>

                      <div className="my-auto space-y-4 py-12">
                        <h1 className="text-3xl font-black text-slate-900 px-6 uppercase tracking-tight leading-snug">
                          {bookTitle || 'আমার কাস্টম বুক'}
                        </h1>
                        {bookSubtitle && <p className="text-sm text-gray-500 font-medium font-serif">{bookSubtitle}</p>}
                        <div className="w-8 h-1.5 bg-indigo-600 mx-auto mt-4"></div>
                        <p className="text-xs text-gray-550 italic mt-2 font-serif">
                          সংকলক: {customerName || 'সম্মানিত পাঠক'}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="h-0.5 bg-gray-100 w-24 mx-auto my-2"></div>
                        <p className="text-[10px] font-mono text-gray-400 font-bold">READ2PRINT PRESS • DHAKA, BANGLADESH</p>
                        <p className="text-[8px] text-gray-350">প্রিন্ট কপিরাইট ও লাইসেন্স সংরক্ষিত</p>
                      </div>
                    </div>

                    {/* PAGE 2: TABLE OF CONTENTS */}
                    <div className="bg-white max-w-lg mx-auto aspect-[1/1.41] shadow-lg border border-gray-200 p-12 flex flex-col justify-between relative">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 text-center pb-4 border-b border-gray-100">সূচিপত্র</h2>
                        
                        <div className="mt-8 space-y-4">
                          {tableOfContents.map((c, i) => (
                            <div key={i} className="flex justify-between items-end gap-2 text-xs text-gray-700">
                              <span className="font-bold flex-1 truncate">
                                {i+1}. {c.title} <span className="text-[10px] text-gray-400 font-normal">({c.writer})</span>
                              </span>
                              <span className="border-b border-dashed border-gray-200 flex-1 h-3 min-w-[50px]"></span>
                              <span className="font-mono text-gray-500 font-bold">পৃষ্ঠা {c.startPage}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-gray-400 font-serif border-t border-gray-100 pt-3">
                        পৃষ্ঠা ২ • Read2Print
                      </div>
                    </div>

                    {/* PAGE 3+: MERGED ARTICLES CONTENT PREVIEW */}
                    {cart.map((item, idx) => {
                      const startPage = tableOfContents[idx]?.startPage || (3 + idx * 2);
                      
                      // Check if this article is locked in real-time
                      const origArticle = articles.find(a => a.id === item.articleId);
                      const isLocked = origArticle && (origArticle.requiredCoins || 0) > 0 && !unlockedArticles.includes(origArticle.id);
                      
                      // Truncate or hide content if it is coin-locked
                      const contentToShow = isLocked
                        ? `<div class="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-900 font-sans space-y-2">
                             <span class="text-xl inline-block">🔒</span>
                             <h4 class="font-bold text-[11px] uppercase tracking-wide">নিবন্ধটি লক করা রয়েছে!</h4>
                             <p class="text-[10px] leading-relaxed text-amber-700 font-light">এটি আপনার কাস্টম সংকলনে সম্পূর্ণ পড়তে বা প্রিন্ট করতে লেখক কর্তৃক নির্ধারিত <b>${origArticle?.requiredCoins} কয়েন</b> দিয়ে প্রথমে হোম পেজ থেকে আনলক করে নিন।</p>
                           </div>`
                        : item.content;

                      return (
                        <div key={idx} className="bg-white max-w-lg mx-auto aspect-[1/1.41] shadow-lg border border-gray-200 p-12 flex flex-col justify-between relative">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider border-b border-dashed border-gray-100 pb-2">
                              <span>অধ্যায় {idx + 1} • {item.writerName}</span>
                              <span>পৃষ্ঠা নম্বর {startPage}</span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 leading-snug mt-4">
                              {item.articleTitle}
                            </h3>

                            <div 
                              className="text-xs text-stone-850 leading-relaxed text-justify space-y-4 font-serif pt-4"
                              dangerouslySetInnerHTML={{ 
                                __html: contentToShow.replace(/\n/g, '<br />')
                              }}
                            />
                          </div>

                          <div className="text-center text-[9px] text-gray-300 font-serif border-t border-gray-100 pt-2 font-mono">
                            {bookTitle ? bookTitle.substring(0, 20) : 'Custom Book'}... সংকলন • পৃষ্ঠা {startPage}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COIN PURCHASE CHANNELS MODAL (bKash / Nagad) */}
      <AnimatePresence>
        {payingPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-55"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col relative transition-all duration-300 border ${
                coinSelectedGateway === 'bKash' 
                  ? 'bg-[#e2136e] border-[#b50f58] text-white' 
                  : 'bg-[#f04f23] border-[#be3a15] text-white'
              }`}
            >
              {/* Checkout Close Button */}
              <button
                onClick={() => setPayingPackage(null)}
                className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              >
                ✕
              </button>

              {/* Gateway Banner / Header */}
              <div className="p-5 text-center border-b border-white/10 space-y-2">
                <div className="flex justify-center items-center gap-1.5 grayscale-0 brightness-110">
                  {coinSelectedGateway === 'bKash' ? (
                    <span className="font-extrabold text-xl tracking-wider">bKash <span className="font-light">Wallet</span></span>
                  ) : (
                    <span className="font-extrabold text-xl tracking-wider">Nagad <span className="font-light">Pay</span></span>
                  )}
                </div>
                <div className="text-[10px] text-white/80 font-semibold tracking-wide uppercase">
                  রিয়েল টাইম পেমেন্ট গেটওয়ে
                </div>
              </div>

              {/* Package Detail strip */}
              <div className="bg-black/15 px-5 py-3 text-xs flex justify-between items-center border-b border-white/5 font-bold">
                <span>প্যাকেজ: {payingPackage.tag} ({payingPackage.coins} কয়েন)</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md text-amber-100 font-mono text-[11px]">৳{payingPackage.price} টাকা</span>
              </div>

              {/* Dynamic steps renderer */}
              <div className="p-6 flex-1 flex flex-col justify-between min-h-[220px]">
                {coinPaymentStep === 'method' && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-white/90 leading-relaxed font-semibold">
                      আপনার পছন্দের গেটওয়ে নির্বাচন করুন:
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={() => setCoinSelectedGateway('bKash')}
                        className={`py-3.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                          coinSelectedGateway === 'bKash'
                            ? 'bg-white text-[#e2136e] border-white shadow-md'
                            : 'bg-white/10 text-white border-transparent hover:bg-white/15'
                        }`}
                      >
                        <span className="text-xl">💳</span>
                        <span>বিকাশ (bKash)</span>
                      </button>
                      <button
                        onClick={() => setCoinSelectedGateway('Nagad')}
                        className={`py-3.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                          coinSelectedGateway === 'Nagad'
                            ? 'bg-white text-[#f04f23] border-white shadow-md'
                            : 'bg-white/10 text-white border-transparent hover:bg-white/15'
                        }`}
                      >
                        <span className="text-xl">🔥</span>
                        <span>নগদ (Nagad)</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setCoinPaymentStep('phone')}
                        className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-bold text-xs hover:bg-opacity-90 shadow-lg hover:scale-[1.01] transition-all"
                      >
                        পরবর্তী ধাপে যান →
                      </button>
                    </div>
                  </div>
                )}

                {coinPaymentStep === 'phone' && (
                  <div className="space-y-4">
                    <label className="block text-[11px] text-white/90 text-left font-black tracking-wide uppercase">
                      ১১ ডিজিটের {coinSelectedGateway === 'bKash' ? 'বিকাশ' : 'নগদ'} মোবাইল অ্যাকাউন্ট নম্বর:
                    </label>
                    <div className="space-y-1.5 focus-within:translate-y-[-1px] transition-transform">
                      <input
                        type="text"
                        maxLength={11}
                        value={coinPhoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCoinPhoneNumber(val);
                          setCoinPaymentError('');
                        }}
                        placeholder="e.g. 017XXXXXXXX"
                        className="w-full p-2.5 rounded-xl border-none focus:outline-hidden text-center text-sm font-bold tracking-widest text-slate-800 focus:ring-4 focus:ring-white/20 bg-white"
                      />
                      {coinPaymentError && (
                        <p className="text-[10px] text-yellow-305 font-bold text-center mt-1">{coinPaymentError}</p>
                      )}
                    </div>

                    <p className="text-[10px] text-white/70 leading-normal text-justify">
                      * এই অ্যাকাউন্টে ওটিপি ও সুরক্ষা নিশ্চিতকরণের জন্য একটি ওয়ান টাইম পাসওয়ার্ড প্রেরণ করা হবে।
                    </p>

                    <button
                      onClick={() => {
                        if (coinPhoneNumber.length !== 11 || !coinPhoneNumber.startsWith('01')) {
                          setCoinPaymentError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭********)');
                          return;
                        }
                        setCoinIsProcessing(true);
                        setTimeout(() => {
                          setCoinIsProcessing(false);
                          setCoinPaymentStep('otp');
                        }, 800);
                      }}
                      className="w-full py-2.5 bg-black/30 hover:bg-black/50 text-white font-bold text-xs rounded-xl border border-white/20 transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {coinIsProcessing ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>ওটিপি কোড পাঠান (OTP Send)</span>
                      )}
                    </button>
                  </div>
                )}

                {coinPaymentStep === 'otp' && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full inline-block font-mono">
                        +৮৮ {coinPhoneNumber}
                      </span>
                      <p className="text-[11px] text-white/95 leading-normal">
                        আপনার নাম্বারে পাঠানো ৪ ডিজিটের ভেরিফিকেশন ওটিপি দিন (আমরা কোড `১২৩৪` পাঠিয়েছি):
                      </p>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={coinOTP}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCoinOTP(val);
                          setCoinPaymentError('');
                        }}
                        placeholder="ভেরিফিকেশন কোড লিখুন"
                        className="w-full p-2.5 rounded-xl border-none focus:outline-hidden text-center text-sm font-bold tracking-widest text-slate-800 bg-white"
                      />
                      {coinPaymentError && (
                        <p className="text-[10px] text-yellow-305 font-bold text-center mt-1">{coinPaymentError}</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (!coinOTP) {
                          setCoinPaymentError('ওটিপি কোড টাইপ করা আবশ্যক।');
                          return;
                        }
                        setCoinIsProcessing(true);
                        setTimeout(() => {
                          setCoinIsProcessing(false);
                          setCoinPaymentStep('pin');
                        }, 700);
                      }}
                      className="w-full py-2.5 bg-black/30 hover:bg-black/50 text-white font-bold text-xs rounded-xl border border-white/20 transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {coinIsProcessing ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>কোড নিশ্চিত করুন</span>
                      )}
                    </button>
                  </div>
                )}

                {coinPaymentStep === 'pin' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs text-white/95 leading-normal">
                        পেমেন্ট সম্পন্ন করতে আপনার ওয়ালেট পিন (PIN) লিখুন:
                      </p>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="password"
                        maxLength={5}
                        value={coinPIN}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCoinPIN(val);
                          setCoinPaymentError('');
                        }}
                        placeholder="••••"
                        className="w-full p-2.5 rounded-xl border-none focus:outline-hidden text-center text-base font-mono tracking-widest text-slate-800 bg-white"
                      />
                      {coinPaymentError && (
                        <p className="text-[10px] text-yellow-305 font-bold text-center mt-1">{coinPaymentError}</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (coinPIN.length < 4) {
                          setCoinPaymentError('সঠিক পিন কোড দিন (কমপক্ষে ৪ সংখ্যা)');
                          return;
                        }
                        setCoinIsProcessing(true);
                        setTimeout(() => {
                          setCoinIsProcessing(false);
                          
                          // Credit the coins to reader balance
                          setReaderCoins(prev => {
                            const updated = prev + payingPackage.coins;
                            localStorage.setItem('r2p_reader_coins', String(updated));
                            return updated;
                          });
                          
                          setCoinPaymentStep('success');
                        }, 1400);
                      }}
                      className="w-full py-2.5 bg-white text-gray-950 font-black text-xs rounded-xl hover:bg-slate-100 transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {coinIsProcessing ? (
                        <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-650 rounded-full animate-spin" />
                      ) : (
                        <span>নিশ্চিত করুন & রিচার্জ পান</span>
                      )}
                    </button>
                  </div>
                )}

                {coinPaymentStep === 'success' && (
                  <div className="space-y-4 text-center">
                    <div className="w-12 h-12 bg-white text-[#22c55e] rounded-full flex items-center justify-center mx-auto text-xl shadow-md font-bold animate-pulse">
                      ✓
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-[#22c55e] text-sm bg-white px-2 py-1 rounded-lg inline-block">ধন্যবাদ! পেমেন্ট সফল হয়েছে</h4>
                      <p className="text-xs text-white/95 leading-relaxed font-semibold">
                        আপনার ওয়ালেটে সফলভাবে <strong>{payingPackage.coins} কয়েন</strong> জমা করা হয়েছে।
                      </p>
                    </div>

                    <div className="bg-black/15 p-2.5 rounded-xl text-[11px] font-mono font-bold">
                      নতুন ওয়ালেট ব্যালেন্স: {readerCoins} 🪙
                    </div>

                    <button
                      onClick={() => setPayingPackage(null)}
                      className="w-full py-2 bg-white text-black font-bold text-xs rounded-xl shadow-xs hover:bg-gray-100 transition-all"
                    >
                      পাসবুক বন্ধ করুন
                    </button>
                  </div>
                )}
              </div>

              {/* Secure note */}
              <div className="bg-black/10 px-5 py-3 text-[10px] text-white/80 text-center font-bold font-sans">
                🛡️ Verified by Trust-Pay Gateway. SSL End-to-End Secured.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
