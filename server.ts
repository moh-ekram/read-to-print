import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { db } from "@vercel/postgres";
// Vite will be imported dynamically in dev mode to prevent production loading overhead
import { INITIAL_ARTICLES } from "./src/data";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const hasPostgres = !!process.env.POSTGRES_URL;

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
  app.get("/api/articles/get", async (req, res) => {
    if (hasPostgres) {
      try {
        const client = await db.connect();
        // Auto-create table if not exists for instant compatibility
        await client.query(`
          CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            sub_category VARCHAR(100),
            tags TEXT,
            writer_id VARCHAR(100) DEFAULT 'w-admin',
            author VARCHAR(255) NOT NULL,
            writer_avatar TEXT,
            status VARCHAR(50) DEFAULT 'published',
            coins INT DEFAULT 0,
            reads INT DEFAULT 0,
            word_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        const result = await client.query(`
          SELECT 
            id, 
            title, 
            content, 
            category, 
            sub_category AS "subCategory", 
            tags, 
            writer_id AS "writerId", 
            author, 
            writer_avatar AS "writerAvatar", 
            status, 
            coins, 
            reads, 
            word_count AS "wordCount", 
            created_at AS "created_at"
          FROM articles 
          ORDER BY created_at DESC
        `);
        client.release();
        
        const mapped = result.rows.map((art: any) => ({
          id: art.id.toString(),
          title: art.title,
          content: art.content,
          category: art.category,
          subCategory: art.subCategory || "",
          tags: art.tags ? (typeof art.tags === 'string' ? art.tags.split(',') : art.tags) : [],
          writerId: art.writerId || "w-admin",
          writerName: art.author || "মডারেটর",
          writerAvatar: art.writerAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
          status: art.status || "published",
          createdAt: art.created_at ? new Date(art.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          created_at: art.created_at || new Date().toISOString(),
          reads: art.reads || 0,
          wordCount: art.wordCount || art.content?.split(/\s+/).filter(Boolean).length || 0,
          requiredCoins: art.coins ?? 0,
          coins: art.coins ?? 0
        }));
        return res.json(mapped);
      } catch (err: any) {
        console.error("Vercel Postgres reading failed, falling back to local file:", err);
      }
    }

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
  app.post("/api/articles/create", async (req, res) => {
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

      if (hasPostgres) {
        try {
          const client = await db.connect();
          await client.query(`
            CREATE TABLE IF NOT EXISTS articles (
              id SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              category VARCHAR(100) NOT NULL,
              sub_category VARCHAR(100),
              tags TEXT,
              writer_id VARCHAR(100) DEFAULT 'w-admin',
              author VARCHAR(255) NOT NULL,
              writer_avatar TEXT,
              status VARCHAR(50) DEFAULT 'published',
              coins INT DEFAULT 0,
              reads INT DEFAULT 0,
              word_count INT DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);

          const resolvedTags = Array.isArray(tags) ? tags.join(',') : (typeof tags === 'string' ? tags : '');
          const resolvedWordCount = wordCount || content.split(/\s+/).filter(Boolean).length;

          const result = await client.query(
            `INSERT INTO articles (
              title, 
              content, 
              category, 
              sub_category, 
              tags, 
              writer_id, 
              author, 
              writer_avatar, 
              status, 
              coins, 
              word_count,
              reads
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0)
            RETURNING *`,
            [
              title,
              content,
              category,
              subCategory,
              resolvedTags,
              writerId,
              author,
              writerAvatar,
              status,
              Number(coins) || 0,
              resolvedWordCount
            ]
          );
          client.release();

          const row = result.rows[0];
          const newArticle = {
            id: row.id.toString(),
            title: row.title,
            content: row.content,
            category: row.category,
            subCategory: row.sub_category || "",
            tags: row.tags ? row.tags.split(',') : [],
            writerId: row.writer_id || "w-admin",
            writerName: row.author,
            writerAvatar: row.writer_avatar,
            status: row.status,
            createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            created_at: row.created_at,
            reads: row.reads || 0,
            wordCount: row.word_count || 0,
            requiredCoins: row.coins || 0,
            coins: row.coins || 0
          };
          return res.status(201).json(newArticle);
        } catch (err: any) {
          console.error("Vercel Postgres create failed, falling back to local file:", err);
        }
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
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, username, password, avatar, bio } = req.body;
      if (!name || !username || !password) {
        return res.status(400).json({ error: "Name, Username, and Password are required." });
      }

      const lowerUsername = username.trim().toLowerCase();

      if (hasPostgres) {
        try {
          const client = await db.connect();
          await client.query(`
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              username VARCHAR(255) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              salt VARCHAR(255) NOT NULL,
              avatar TEXT,
              coins INT DEFAULT 200,
              spent_amount DECIMAL(10, 2) DEFAULT 0.00,
              bio TEXT,
              role VARCHAR(50) DEFAULT 'reader',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);

          const userCheck = await client.query(
            "SELECT id FROM users WHERE username = $1",
            [lowerUsername]
          );

          if (userCheck.rows.length > 0) {
            client.release();
            return res.status(409).json({ error: "Username already exists. Please choose another username." });
          }

          const { hash, salt } = localHashPassword(password);
          const userAvatar = avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
          const userBio = bio || "মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।";

          const result = await client.query(
            `INSERT INTO users (
              name, 
              username, 
              password_hash, 
              salt, 
              avatar, 
              coins, 
              spent_amount, 
              bio, 
              role
            ) VALUES ($1, $2, $3, $4, $5, 200, 0.00, $6, 'reader')
            RETURNING id, name, username, avatar, coins, spent_amount, bio, role`,
            [
              name.trim(),
              lowerUsername,
              hash,
              salt,
              userAvatar,
              userBio
            ]
          );

          client.release();
          const newUser = result.rows[0];

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
              role: newUser.role
            },
            token: "mock-jwt-token-" + newUser.id
          });
        } catch (dbErr: any) {
          console.error("Vercel Postgres register failed, falling back to local file:", dbErr);
        }
      }

      const users = getUsersFromFile();

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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const lowerUsername = username.trim().toLowerCase();

      if (hasPostgres) {
        try {
          const client = await db.connect();
          await client.query(`
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              username VARCHAR(255) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              salt VARCHAR(255) NOT NULL,
              avatar TEXT,
              coins INT DEFAULT 200,
              spent_amount DECIMAL(10, 2) DEFAULT 0.00,
              bio TEXT,
              role VARCHAR(50) DEFAULT 'reader',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);

          const result = await client.query(
            `SELECT id, name, username, password_hash, salt, avatar, coins, spent_amount, bio, role 
             FROM users 
             WHERE username = $1`,
            [lowerUsername]
          );

          client.release();

          if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password. User not found." });
          }

          const dbUser = result.rows[0];
          const isValid = localVerifyPassword(password, dbUser.password_hash, dbUser.salt);
          if (!isValid) {
            return res.status(401).json({ error: "Invalid username or password. Please try again." });
          }

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
              role: dbUser.role
            },
            token: "mock-jwt-token-" + dbUser.id
          });
        } catch (dbErr: any) {
          console.error("Vercel Postgres login failed, falling back to local file:", dbErr);
        }
      }

      const users = getUsersFromFile();

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
    const { createServer: createViteServer } = await import("vite");
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
