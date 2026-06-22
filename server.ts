import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { INITIAL_ARTICLES } from "./src/data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // Database Path inside workspace
  const DATA_DIR = path.join(process.cwd(), "data");
  const DB_FILE = path.join(DATA_DIR, "articles.json");
  const USERS_FILE = path.join(DATA_DIR, "users.json");

  // Ensure directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Load articles from JSON file or fall back to INITIAL_ARTICLES
  function getArticlesFromFile() {
    if (!fs.existsSync(DB_FILE)) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_ARTICLES, null, 2), "utf8");
      } catch (err) {
        console.error("Failed to write initial articles database file:", err);
      }
      return INITIAL_ARTICLES;
    }
    try {
      const content = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(content);
    } catch (err) {
      console.error("Error reading database file, resetting to initial:", err);
      return INITIAL_ARTICLES;
    }
  }

  // Save articles to file
  function saveArticlesToFile(articles: any[]) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(articles, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to write articles to database file:", err);
    }
  }

  // User database utilities
  function getUsersFromFile() {
    if (!fs.existsSync(USERS_FILE)) {
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf8");
      } catch (err) {
        console.error("Failed to write initial users file:", err);
      }
      return [];
    }
    try {
      const content = fs.readFileSync(USERS_FILE, "utf8");
      return JSON.parse(content);
    } catch (err) {
      return [];
    }
  }

  function saveUsersToFile(users: any[]) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save users:", err);
    }
  }

  // Crypto helpers (matching standard JWT & PBKDF2 logic)
  function localHashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return { hash, salt };
  }

  function localVerifyPassword(password: string, hash: string, salt: string): boolean {
    const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === checkHash;
  }

  // 1. Core API Route: Get all articles (sorted newer first)
  app.get("/api/articles/get", (req, res) => {
    try {
      const articles = getArticlesFromFile();
      // Map properties for pristine consistency with standard schema
      const mapped = articles.map((art: any) => ({
        id: art.id,
        title: art.title,
        content: art.content,
        category: art.category,
        subCategory: art.subCategory || "",
        tags: art.tags || [],
        writerId: art.writerId || "w-admin",
        writerName: art.writerName || art.author || "মডারেটর",
        writerAvatar: art.writerAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        status: art.status || "published",
        createdAt: art.createdAt || art.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        created_at: art.created_at || art.createdAt || new Date().toISOString(),
        reads: art.reads || 0,
        wordCount: art.wordCount || art.content?.split(/\s+/).filter(Boolean).length || 0,
        requiredCoins: art.requiredCoins ?? art.coins ?? 0,
        coins: art.coins ?? art.requiredCoins ?? 0
      }));
      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Core API Route: Create/insert a brand new article
  app.post("/api/articles/create", (req, res) => {
    try {
      const { 
        title, 
        content, 
        category, 
        author, 
        coins = 0, 
        subCategory = "", 
        tags = [], 
        writerId = "w-admin", 
        writerAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", 
        status = "published", 
        wordCount 
      } = req.body;
      
      if (!title || !content || !category || !author) {
        return res.status(400).json({ error: "Missing mandatory fields: title, content, category, and author are required." });
      }

      const articles = getArticlesFromFile();
      const newId = 'art-' + Date.now();
      
      const newArticle = {
        id: newId,
        title,
        content,
        category,
        subCategory,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map((t: string) => t.trim()) : []),
        writerId,
        writerName: author, // writerName matches DB author parameter for consistency
        writerAvatar,
        status,
        createdAt: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        reads: 0,
        wordCount: wordCount || content.split(/\s+/).filter(Boolean).length,
        requiredCoins: Number(coins) || 0,
        coins: Number(coins) || 0
      };

      // Push to beginning of array to simulate NEWEST first insertion
      articles.unshift(newArticle);
      saveArticlesToFile(articles);

      res.status(201).json(newArticle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. User Authentication endpoints
  app.post("/api/auth/register", (req, res) => {
    try {
      const { name, username, password, avatar, bio } = req.body;
      if (!name || !username || !password) {
        return res.status(400).json({ error: "Name, Username, and Password are required." });
      }

      const users = getUsersFromFile();
      const lowerUsername = username.trim().toLowerCase();

      const existingUser = users.find((u: any) => u.username === lowerUsername);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists. Please choose another username." });
      }

      const { hash, salt } = localHashPassword(password);
      const userAvatar = avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
      const userBio = bio || "মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।";

      const newUser = {
        id: "usr-" + Date.now(),
        name: name.trim(),
        username: lowerUsername,
        passwordHash: hash,
        salt: salt,
        avatar: userAvatar,
        currentCoins: 200, // Dynamic free coins on signup
        spentAmount: 0.00,
        bio: userBio,
        role: "reader",
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsersToFile(users);

      res.status(201).json({
        success: true,
        message: "Registration successful!",
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          avatar: newUser.avatar,
          currentCoins: newUser.currentCoins,
          spentAmount: newUser.spentAmount,
          bio: newUser.bio,
          role: newUser.role
        },
        token: "mock-jwt-token-" + newUser.id
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const users = getUsersFromFile();
      const lowerUsername = username.trim().toLowerCase();

      const user = users.find((u: any) => u.username === lowerUsername);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password. User not found." });
      }

      const isValid = localVerifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password. Please try again." });
      }

      res.json({
        success: true,
        message: "Login successful!",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          currentCoins: user.currentCoins,
          spentAmount: user.spentAmount,
          bio: user.bio,
          role: user.role
        },
        token: "mock-jwt-token-" + user.id
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health probe in case orchestration checks compatibility
  app.get("/api/health", (req, res) => {

    res.json({ status: "ok" });
  });

  // Setup Vite Dev Server / Static production assets serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite's connect instance as middleware in high-performance mode
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html globally as router fallback for Single Page Application
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[read2print] Dynamic Express server running on port ${PORT}`);
  });
}

startServer();
