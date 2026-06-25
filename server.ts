import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { signJwt, hashPassword, verifyPassword } from "./lib/jwt";
import { INITIAL_ARTICLES } from "./src/data";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is not defined in the environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// In-Memory fallback caches in case tables do not exist in Supabase yet
let fallbackArticles = [...INITIAL_ARTICLES];
let fallbackUsers: any[] = [
  {
    id: "1",
    name: "অ্যাডমিন ইউজার",
    username: "admin",
    password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // Hashed "admin2026"
    salt: "abcdef1234567890",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=admin",
    coins: 500,
    spent_amount: 0.00,
    bio: "সিস্টেম অ্যাডমিনিস্ট্রেটর পোর্টাল।",
    role: "admin",
    lifetime_coins: 500,
    monthly_coins: 500,
    balance_bdt: 0.00,
    created_at: new Date().toISOString()
  }
];
let fallbackReports: any[] = [];

// Helper to check if an error represents a missing table in Supabase
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || "";
  const code = error.code || "";
  return (
    code === "PGRST116" ||
    code === "42P01" ||
    msg.includes("Could not find") ||
    msg.includes("relation") ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

// Function to print a helpful SQL setup guide in the server terminal
function printDatabaseSetupInstructions() {
  console.log("\n" + "=".repeat(80));
  console.log("⚠️  SUPABASE TABLES NOT FOUND!");
  console.log("Please copy and run this SQL script in your Supabase SQL Editor:");
  console.log("=".repeat(80));
  console.log(`
-- 1. Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt VARCHAR(64) NOT NULL,
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  coins INT DEFAULT 200,
  spent_amount NUMERIC(10, 2) DEFAULT 0.00,
  bio TEXT DEFAULT 'মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।',
  role VARCHAR(30) DEFAULT 'reader',
  lifetime_coins INT DEFAULT 200,
  monthly_coins INT DEFAULT 200,
  balance_bdt NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Create the 'articles' table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100) DEFAULT '',
  tags TEXT DEFAULT '',
  writer_id VARCHAR(50) DEFAULT 'w-admin',
  author VARCHAR(100) NOT NULL,
  writer_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  status VARCHAR(20) DEFAULT 'published',
  coins INT DEFAULT 0,
  reads INT DEFAULT 0,
  word_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- 3. Create the 'closing_reports' table
CREATE TABLE IF NOT EXISTS closing_reports (
  id SERIAL PRIMARY KEY,
  report_month VARCHAR(100) NOT NULL,
  total_coins INT DEFAULT 0,
  pool_amount NUMERIC(10, 2) DEFAULT 0.00,
  distribution_details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
  `);
  console.log("=".repeat(80) + "\n");
}

function getMappedArticles(list: any[]) {
  return list.map((art: any) => ({
    id: art.id.toString(),
    title: art.title,
    content: art.content,
    category: art.category,
    subCategory: art.subCategory || art.sub_category || "",
    tags: art.tags ? (typeof art.tags === "string" ? art.tags.split(",") : art.tags) : [],
    writerId: art.writerId || art.writer_id || "w-admin",
    writerName: art.writerName || art.author || "মডারেটর",
    writerAvatar: art.writerAvatar || art.writer_avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    status: art.status || "published",
    createdAt: art.createdAt ? new Date(art.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    created_at: art.created_at || art.createdAt || new Date().toISOString(),
    reads: art.reads || 0,
    wordCount: art.wordCount || art.word_count || art.content?.split(/\s+/).filter(Boolean).length || 0,
    requiredCoins: art.requiredCoins ?? art.coins ?? 0,
    coins: art.requiredCoins ?? art.coins ?? 0
  }));
}

async function startServer() {
  const app = RouterApp();
  const PORT = 3000;

  console.log("[Database Connection] Connecting permanently to Supabase cloud database...");

  // Seed default articles into Supabase 'articles' table if empty
  async function seedDatabaseIfEmpty() {
    try {
      const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

      if (error) {
        if (isTableMissingError(error)) {
          printDatabaseSetupInstructions();
        } else {
          console.warn("[Database Seeding Warning] Articles table check skipped or failed:", error.message);
        }
        return;
      }

      if (count === 0) {
        console.log("[Database Seeding] Articles table is empty. Seeding default articles into Supabase...");
        const articlesToInsert = INITIAL_ARTICLES.map(art => {
          const tagsString = Array.isArray(art.tags) ? art.tags.join(",") : "";
          return {
            title: art.title,
            content: art.content,
            category: art.category,
            sub_category: art.subCategory || "",
            tags: tagsString,
            writer_id: art.writerId || "w-admin",
            author: art.writerName || "রবীন্দ্রনাথ দত্ত",
            writer_avatar: art.writerAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            status: art.status || "published",
            coins: art.requiredCoins || 0,
            reads: art.reads || 0,
            word_count: art.wordCount || 150,
            created_at: art.createdAt ? new Date(art.createdAt).toISOString() : new Date().toISOString()
          };
        });

        const { error: insertError } = await supabase
          .from("articles")
          .insert(articlesToInsert);

        if (insertError) {
          console.error("[Database Seeding Error] Seeding articles failed:", insertError.message);
        } else {
          console.log("[Database Seeding] Default articles seeded successfully in Supabase!");
        }
      }
    } catch (err: any) {
      console.error("[Database Seeding Error] Unexpected error seeding articles:", err.message || err);
    }
  }

  // Seed default admin user into Supabase 'users' table if empty
  async function seedAdminUser() {
    try {
      const { data: adminUsers, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", "admin");

      if (error) {
        if (!isTableMissingError(error)) {
          console.warn("[Database Seeding Warning] Users table check skipped or failed:", error.message);
        }
        return;
      }

      if (!adminUsers || adminUsers.length === 0) {
        console.log("[Database Seeding] Admin user not found. Seeding default admin user into Supabase...");
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            name: "অ্যাডমিন ইউজার",
            username: "admin",
            password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // Hashed "admin2026"
            salt: "abcdef1234567890",
            avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=admin",
            coins: 500,
            spent_amount: 0.00,
            bio: "সিস্টেম অ্যাডমিনিস্ট্রেটর পোর্টাল।",
            role: "admin",
            lifetime_coins: 500,
            monthly_coins: 500,
            balance_bdt: 0.00,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("[Database Seeding Error] Seeding admin user failed:", insertError.message);
        } else {
          console.log("[Database Seeding] Admin user seeded successfully in Supabase!");
        }
      }
    } catch (err: any) {
      console.error("[Database Seeding Error] Unexpected error seeding admin:", err.message || err);
    }
  }

  // Fire off background seeders asynchronously
  seedDatabaseIfEmpty();
  seedAdminUser();

  function RouterApp() {
    return express();
  }

  // Common Middleware
  app.use(express.json());

  // -------------------------------------------------------------
  // API ENDPOINTS (CONNECTED TO SUPABASE WITH ROBUST IN-MEMORY FALLBACK)
  // -------------------------------------------------------------

  // 1. GET /api/articles/get
  app.get("/api/articles/get", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Supabase Error] GET /api/articles/get failed:", error.message);
        if (isTableMissingError(error)) {
          printDatabaseSetupInstructions();
          console.log("[Fallback Mode] Serving articles from in-memory cache.");
          return res.json(getMappedArticles(fallbackArticles));
        }
        return res.status(500).json({ error: "Failed to fetch articles from database.", details: error.message });
      }

      const mapped = (data || []).map((art: any) => ({
        id: art.id.toString(),
        title: art.title,
        content: art.content,
        category: art.category,
        subCategory: art.sub_category || "",
        tags: art.tags ? (typeof art.tags === "string" ? art.tags.split(",") : art.tags) : [],
        writerId: art.writer_id || "w-admin",
        writerName: art.author || "মডারেটর",
        writerAvatar: art.writer_avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        status: art.status || "published",
        createdAt: art.created_at ? new Date(art.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        created_at: art.created_at || new Date().toISOString(),
        reads: art.reads || 0,
        wordCount: art.word_count || art.content?.split(/\s+/).filter(Boolean).length || 0,
        requiredCoins: art.coins ?? 0,
        coins: art.coins ?? 0
      }));

      return res.json(mapped);
    } catch (err: any) {
      console.error("[API Error] Inside GET /api/articles/get:", err.stack || err);
      console.log("[Fallback Mode] Serving articles from in-memory cache due to uncaught error.");
      return res.json(getMappedArticles(fallbackArticles));
    }
  });

  // 2. POST /api/articles/create
  app.post("/api/articles/create", async (req, res) => {
    try {
      const { 
        title, 
        content, 
        category, 
        subCategory = "", 
        tags = "", 
        writerId = "w-admin", 
        author, 
        writerAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", 
        status = "published", 
        coins = 0, 
        wordCount = 0 
      } = req.body;

      if (!title || !content || !category || !author) {
        return res.status(400).json({ error: "Missing mandatory fields: title, content, category, and author are required." });
      }

      const resolvedTags = Array.isArray(tags) ? tags.join(",") : (typeof tags === "string" ? tags : "");
      const resolvedWordCount = wordCount || content.split(/\s+/).filter(Boolean).length;

      const { data, error } = await supabase
        .from("articles")
        .insert({
          title,
          content,
          category,
          sub_category: subCategory,
          tags: resolvedTags,
          writer_id: writerId,
          author,
          writer_avatar: writerAvatar,
          status,
          coins: Number(coins) || 0,
          word_count: resolvedWordCount,
          reads: 0,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("[Supabase Error] POST /api/articles/create failed:", error.message);
        if (isTableMissingError(error)) {
          printDatabaseSetupInstructions();
          console.log("[Fallback Mode] Creating article in-memory.");
          const inMemoryArt = {
            id: "art-" + Date.now(),
            title,
            content,
            category,
            subCategory,
            tags: resolvedTags ? resolvedTags.split(",") : [],
            writerId,
            writerName: author,
            writerAvatar,
            status,
            createdAt: new Date().toISOString().split("T")[0],
            created_at: new Date().toISOString(),
            reads: 0,
            wordCount: resolvedWordCount,
            requiredCoins: Number(coins) || 0,
            coins: Number(coins) || 0
          };
          fallbackArticles.unshift(inMemoryArt);
          return res.status(201).json(inMemoryArt);
        }
        return res.status(500).json({ error: "Database insert failure. Article could not be created.", details: error.message });
      }

      const row = data?.[0] || {};
      const newArticle = {
        id: (row.id || "art-" + Date.now()).toString(),
        title: row.title || title,
        content: row.content || content,
        category: row.category || category,
        subCategory: row.sub_category || subCategory,
        tags: row.tags ? row.tags.split(",") : [],
        writerId: row.writer_id || writerId,
        writerName: row.author || author,
        writerAvatar: row.writer_avatar || writerAvatar,
        status: row.status || status,
        createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        created_at: row.created_at || new Date().toISOString(),
        reads: row.reads || 0,
        wordCount: row.word_count || resolvedWordCount,
        requiredCoins: row.coins || 0,
        coins: row.coins || 0
      };
      return res.status(201).json(newArticle);
    } catch (err: any) {
      console.error("[API Error] Inside POST /api/articles/create:", err.stack || err);
      // Failover to in-memory
      const inMemoryArt = {
        id: "art-" + Date.now(),
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        subCategory: req.body.subCategory || "",
        tags: req.body.tags || [],
        writerId: req.body.writerId || "w-admin",
        writerName: req.body.author || "মডারেটর",
        writerAvatar: req.body.writerAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        status: req.body.status || "published",
        createdAt: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        reads: 0,
        wordCount: 150,
        requiredCoins: Number(req.body.coins) || 0,
        coins: Number(req.body.coins) || 0
      };
      fallbackArticles.unshift(inMemoryArt);
      return res.status(201).json(inMemoryArt);
    }
  });

  // Helper to handle registration logic using Supabase database insertions
  const handleRegistrationLogic = async (req: express.Request, res: express.Response) => {
    try {
      const { name, username, password, avatar, bio } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required fields." });
      }

      const lowerUsername = username.trim().toLowerCase();

      // Check if username already exists in Supabase
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("username", lowerUsername);

      if (checkError) {
        console.error("[Supabase Error] Registration check failed:", checkError.message);
        if (isTableMissingError(checkError)) {
          printDatabaseSetupInstructions();
          // Fallback check
          const existing = fallbackUsers.find(u => u.username === lowerUsername);
          if (existing) {
            return res.status(409).json({ error: "Username already exists. Please choose another username." });
          }
          // Proceed to register in memory
          const { hash, salt } = hashPassword(password);
          const userAvatar = avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
          const userBio = bio || "মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।";
          const inMemoryUser = {
            id: "usr-" + Date.now(),
            name: (name || username).trim(),
            username: lowerUsername,
            password_hash: hash,
            salt: salt,
            avatar: userAvatar,
            coins: 200,
            spent_amount: 0.00,
            bio: userBio,
            role: "reader",
            lifetime_coins: 200,
            monthly_coins: 200,
            balance_bdt: 0.00,
            created_at: new Date().toISOString()
          };
          fallbackUsers.push(inMemoryUser);
          const token = signJwt({ userId: inMemoryUser.id, username: inMemoryUser.username, role: inMemoryUser.role });
          return res.status(201).json({
            success: true,
            message: "Registration successful (In-Memory Fallback)!",
            user: {
              id: inMemoryUser.id,
              name: inMemoryUser.name,
              username: inMemoryUser.username,
              avatar: inMemoryUser.avatar,
              currentCoins: inMemoryUser.coins,
              spentAmount: 0,
              bio: inMemoryUser.bio,
              role: inMemoryUser.role,
              lifetime_coins: 200,
              monthly_coins: 200,
              balance_bdt: 0
            },
            token
          });
        }
        return res.status(500).json({ error: "Failed to check existing username.", details: checkError.message });
      }

      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({ error: "Username already exists. Please choose another username." });
      }

      const { hash, salt } = hashPassword(password);
      const userAvatar = avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
      const userBio = bio || "মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।";

      // Insert new profile into Custom 'users' table
      const { data: insertedUser, error: insertError } = await supabase
        .from("users")
        .insert({
          name: (name || username).trim(),
          username: lowerUsername,
          password_hash: hash,
          salt: salt,
          avatar: userAvatar,
          coins: 200,
          spent_amount: 0.00,
          bio: userBio,
          role: "reader",
          lifetime_coins: 200,
          monthly_coins: 200,
          balance_bdt: 0.00,
          created_at: new Date().toISOString()
        })
        .select();

      if (insertError || !insertedUser || insertedUser.length === 0) {
        console.error("[Supabase Error] Registration insert failed:", insertError?.message);
        return res.status(500).json({ error: "Database registration insert failed.", details: insertError?.message });
      }

      const newUser = insertedUser[0];

      const token = signJwt({
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful!",
        user: {
          id: newUser.id.toString(),
          name: newUser.name,
          username: newUser.username,
          avatar: newUser.avatar,
          currentCoins: newUser.coins,
          spentAmount: Number(newUser.spent_amount) || 0,
          bio: newUser.bio,
          role: newUser.role,
          lifetime_coins: newUser.lifetime_coins || 200,
          monthly_coins: newUser.monthly_coins || 200,
          balance_bdt: Number(newUser.balance_bdt) || 0
        },
        token
      });
    } catch (e: any) {
      console.error("[API Error] Inside registration handler:", e.stack || e);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  // Helper to handle login logic using Supabase database lookups
  const handleLoginLogic = async (req: express.Request, res: express.Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required fields." });
      }

      const lowerUsername = username.trim().toLowerCase();

      // Fetch user profile from Supabase
      const { data: users, error: selectError } = await supabase
        .from("users")
        .select("*")
        .eq("username", lowerUsername);

      if (selectError) {
        console.error("[Supabase Error] Login select failed:", selectError.message);
        if (isTableMissingError(selectError)) {
          printDatabaseSetupInstructions();
          // Fallback login
          const inMemoryUser = fallbackUsers.find(u => u.username === lowerUsername);
          if (!inMemoryUser) {
            return res.status(401).json({ error: "Invalid username or password. User not found." });
          }
          const isValid = verifyPassword(password, inMemoryUser.password_hash, inMemoryUser.salt);
          if (!isValid) {
            return res.status(401).json({ error: "Invalid username or password. Please try again." });
          }
          const token = signJwt({ userId: inMemoryUser.id, username: inMemoryUser.username, role: inMemoryUser.role });
          return res.json({
            success: true,
            message: "Login successful (In-Memory Fallback)!",
            user: {
              id: inMemoryUser.id.toString(),
              name: inMemoryUser.name,
              username: inMemoryUser.username,
              avatar: inMemoryUser.avatar,
              currentCoins: inMemoryUser.coins,
              spentAmount: Number(inMemoryUser.spent_amount) || 0,
              bio: inMemoryUser.bio,
              role: inMemoryUser.role,
              lifetime_coins: inMemoryUser.lifetime_coins || 200,
              monthly_coins: inMemoryUser.monthly_coins || 200,
              balance_bdt: Number(inMemoryUser.balance_bdt) || 0
            },
            token
          });
        }
        return res.status(500).json({ error: "Database query error during authentication.", details: selectError.message });
      }

      if (!users || users.length === 0) {
        return res.status(401).json({ error: "Invalid username or password. User not found." });
      }

      const dbUser = users[0];
      const isValid = verifyPassword(password, dbUser.password_hash, dbUser.salt);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password. Please try again." });
      }

      const token = signJwt({
        userId: dbUser.id,
        username: dbUser.username,
        role: dbUser.role
      });

      return res.json({
        success: true,
        message: "Login successful!",
        user: {
          id: dbUser.id.toString(),
          name: dbUser.name,
          username: dbUser.username,
          avatar: dbUser.avatar,
          currentCoins: dbUser.coins,
          spentAmount: Number(dbUser.spent_amount) || 0,
          bio: dbUser.bio,
          role: dbUser.role,
          lifetime_coins: dbUser.lifetime_coins || 200,
          monthly_coins: dbUser.monthly_coins || 200,
          balance_bdt: Number(dbUser.balance_bdt) || 0
        },
        token
      });
    } catch (e: any) {
      console.error("[API Error] Inside login handler:", e.stack || e);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  // Register routes
  app.post("/api/register", handleRegistrationLogic);
  app.post("/api/login", handleLoginLogic);
  app.post("/api/auth/register", handleRegistrationLogic);
  app.post("/api/auth/login", handleLoginLogic);

  // 5. POST /api/admin/monthly-closing
  app.post("/api/admin/monthly-closing", async (req, res) => {
    try {
      const { poolAmount, writers = [] } = req.body;
      const parsedPoolAmount = Number(poolAmount) || 0;

      if (parsedPoolAmount <= 0) {
        return res.status(400).json({ error: "বাজেট বা পুল অ্যামাউন্ট অবশ্যই ০ এর চেয়ে বেশি হতে হবে।" });
      }

      const totalMonthlyCoins = writers.reduce((sum: number, w: any) => sum + (Number(w.monthly_coins) || 0), 0);
      if (totalMonthlyCoins <= 0) {
        return res.status(400).json({ error: "কোনো চলতি মাসের রয়্যালটি কয়েন নেই, তাই ক্লোজিং সম্ভব নয়।" });
      }

      // Calculate ratios and distribute
      const updatedWriters = writers.map((w: any) => {
        const monthlyCoins = Number(w.monthly_coins) || 0;
        const ratio = monthlyCoins / totalMonthlyCoins;
        const shareBdt = ratio * parsedPoolAmount;
        const currentBalanceBdt = Number(w.balance_bdt) || 0;
        const newBalanceBdt = Number((currentBalanceBdt + shareBdt).toFixed(2));
        
        return {
          ...w,
          monthly_coins: 0,
          coinBalance: 0,
          balance_bdt: newBalanceBdt
        };
      });

      // Format Month Name
      const options: any = { month: "long", year: "numeric" };
      const reportMonth = new Date().toLocaleString("bn-BD", options) || "জুন ২০২৬";

      const distributionDetails = writers.map((w: any) => {
        const monthlyCoins = Number(w.monthly_coins) || 0;
        const ratio = monthlyCoins / totalMonthlyCoins;
        const shareBdt = Number((ratio * parsedPoolAmount).toFixed(2));
        return {
          id: w.id,
          name: w.name,
          username: w.username,
          coins: monthlyCoins,
          shareBdt
        };
      });

      const reportObject = {
        reportMonth,
        totalCoins: totalMonthlyCoins,
        poolAmount: parsedPoolAmount,
        distributionDetails: JSON.stringify(distributionDetails),
        createdAt: new Date().toISOString()
      };

      // Save report to database table 'closing_reports'
      const { data: insertedReports, error: reportError } = await supabase
        .from("closing_reports")
        .insert({
          report_month: reportObject.reportMonth,
          total_coins: reportObject.totalCoins,
          pool_amount: reportObject.poolAmount,
          distribution_details: reportObject.distributionDetails,
          created_at: reportObject.createdAt
        })
        .select();

      if (reportError) {
        console.error("[Supabase Error] Monthly closing report insert failed:", reportError.message);
        if (isTableMissingError(reportError)) {
          printDatabaseSetupInstructions();
          // Fallback report save in-memory
          const inMemoryReport = {
            id: "rep-" + Date.now(),
            reportMonth: reportObject.reportMonth,
            totalCoins: reportObject.totalCoins,
            poolAmount: reportObject.poolAmount,
            distributionDetails: JSON.parse(reportObject.distributionDetails),
            createdAt: reportObject.createdAt
          };
          fallbackReports.unshift(inMemoryReport);

          // Update users in fallback
          for (const w of updatedWriters) {
            const userIndex = fallbackUsers.findIndex(u => u.username === w.username);
            if (userIndex !== -1) {
              fallbackUsers[userIndex].balance_bdt = w.balance_bdt;
              fallbackUsers[userIndex].monthly_coins = 0;
              fallbackUsers[userIndex].coins = 0;
            }
          }

          return res.json({
            success: true,
            message: "মাসিক ক্লোজিং সফলভাবে সম্পন্ন হয়েছে (In-Memory Fallback)!",
            report: inMemoryReport,
            updatedWriters
          });
        }
        return res.status(500).json({ error: "ডাটাবেসে রিপোর্ট সংরক্ষণ করতে ব্যর্থ হয়েছে।" });
      }

      // Loop to update each writer's balance, coins, and monthly_coins in 'users' table
      for (const w of updatedWriters) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            balance_bdt: w.balance_bdt,
            monthly_coins: 0,
            coins: 0
          })
          .eq("username", w.username);

        if (updateError) {
          console.error(`[Supabase Error] Failed to update user ${w.username} during closing:`, updateError.message);
        }
      }

      const savedReport = insertedReports?.[0] || {};
      return res.json({
        success: true,
        message: "মাসিক ক্লোজিং সফলভাবে ব্যাকএন্ডে সংরক্ষিত ও বন্টন সম্পন্ন হয়েছে!",
        report: {
          id: (savedReport.id || "rep-" + Date.now()).toString(),
          reportMonth: savedReport.report_month || reportObject.reportMonth,
          totalCoins: savedReport.total_coins || reportObject.totalCoins,
          poolAmount: Number(savedReport.pool_amount) || reportObject.poolAmount,
          distributionDetails: typeof savedReport.distribution_details === "string" ? JSON.parse(savedReport.distribution_details) : savedReport.distribution_details,
          createdAt: savedReport.created_at || reportObject.createdAt
        },
        updatedWriters
      });
    } catch (e: any) {
      console.error("[API Error] Inside /api/admin/monthly-closing:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 6. GET /api/admin/closing-reports
  app.get("/api/admin/closing-reports", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("closing_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Supabase Error] GET /api/admin/closing-reports failed:", error.message);
        if (isTableMissingError(error)) {
          printDatabaseSetupInstructions();
          console.log("[Fallback Mode] Serving closing reports from in-memory cache.");
          return res.json(fallbackReports);
        }
        return res.status(500).json({ error: "ডাটাবেস থেকে রিপোর্ট লোড করতে ব্যর্থ হয়েছে।" });
      }

      const mapped = (data || []).map((row: any) => ({
        id: row.id.toString(),
        reportMonth: row.report_month,
        totalCoins: row.total_coins,
        poolAmount: Number(row.pool_amount),
        distributionDetails: typeof row.distribution_details === "string" ? JSON.parse(row.distribution_details) : row.distribution_details,
        createdAt: row.created_at
      }));

      return res.json(mapped);
    } catch (e: any) {
      console.error("[API Error] Inside GET /api/admin/closing-reports:", e);
      return res.json(fallbackReports);
    }
  });

  // -------------------------------------------------------------
  // VITE DEVELOPMENT MODES & STATIC ROUTING HANDLERS
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      app.get("*", (req, res) => {
        res.status(404).send("Production dist assets are not built yet. Run 'npm run build' first.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Server] Server running successfully on port ${PORT}`);
  });
}

// Spark up Express server
startServer();
