export interface Writer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  coinBalance?: number; // Author's earned coins
  lifetime_coins?: number;
  monthly_coins?: number;
  balance_bdt?: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: 'সাহিত্য' | 'বিজ্ঞান' | 'রাজনীতি' | 'অর্থনীতি' | 'ধর্ম' | 'দর্শন';
  subCategory: string;
  tags: string[];
  writerId: string;
  writerName: string;
  writerAvatar: string;
  status: 'published' | 'draft';
  createdAt: string;
  reads: number;
  wordCount: number;
  requiredCoins?: number; // Coins required to unlock this article (0 or more)
  hidden?: boolean; // Whether the admin has hidden the article
  printCount?: number; // How many times added to print
  earnedCoins?: number; // Total coins earned by this article
}

export interface ReaderUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  currentCoins: number;
  spentAmount: number; // total money spent to buy coins
  totalCoinsPurchased: number; // lifetime total coins
  printCartCount: number; // number of products in print-ready queue/order or active cart
  bio?: string;
  savedArticlesCount?: number;
  role?: 'reader' | 'writer' | 'admin';
  lifetime_coins?: number;
  monthly_coins?: number;
  balance_bdt?: number;
}


export interface CartItem {
  articleId: string;
  articleTitle: string;
  writerName: string;
  wordCount: number;
  content: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: 'Dhaka' | 'Outside Dhaka';
  cartItems: CartItem[];
  totalPages: number;
  pageCost: number;
  bindingCost: number;
  deliveryCost: number;
  totalCost: number;
  paymentMethod: 'bkash' | 'nagad' | 'card';
  paymentStatus: 'paid' | 'pending';
  orderDate: string;
  status: 'Received' | 'Printing' | 'Shipped' | 'Delivered';
}

export interface WriterApplication {
  id: string;
  name: string;
  bKashNumber: string;
  bio: string;
  address: string;
  sampleTitle1: string;
  sampleContent1: string;
  sampleCategory1: 'সাহিত্য' | 'বিজ্ঞান' | 'রাজনীতি' | 'অর্থনীতি' | 'ধর্ম' | 'দর্শন';
  sampleTitle2: string;
  sampleContent2: string;
  sampleCategory2: 'সাহিত্য' | 'বিজ্ঞান' | 'রাজনীতি' | 'অর্থনীতি' | 'ধর্ম' | 'দর্শন';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface PayoutRequest {
  id: string;
  writerId: string;
  writerName: string;
  writerUsername: string;
  amount: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket';
  accountNumber: string;
  status: 'pending' | 'paid';
  requestDate: string;
}


