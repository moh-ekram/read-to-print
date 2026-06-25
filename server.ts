import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { db } from "@vercel/postgres";
import { signJwt, hashPassword, verifyPassword } from "./lib/jwt";
import { INITIAL_ARTICLES } from "./src/data";

// In-memory fallbacks for local development when Vercel Postgres env vars are missing
let fallbackArticles = [...INITIAL_ARTICLES];
let fallbackUsers: any[] = [
  {
    id: "usr-fallback-1",
    name: "অ্যাডমিন ইউজার",
    username: "admin",
    password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // Hashed "admin2026"
    salt: "abcdef1234567890",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=admin",
    coins: 500,
    spent_amount: 0.00,
    bio: "সিস্টেম অ্যাডমিনিস্ট্রেটর পোর্টাল।",
    role: "admin"
  }
];

// Robust live Postgres database existence check
const hasPostgres = !!process.env.POSTGRES_URL && 
                     process.env.POSTGRES_URL.trim() !== "" && 
                     !process.env.POSTGRES_URL.includes("placeholder") && 
                     process.env.POSTGRES_URL.startsWith("postgres");

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[Database Initialization] hasPostgres configured: ${hasPostgres}`);

  // Dynamic automatic schema migration on startup (if postgres is enabled)
  if (hasPostgres) {
    let client;
    try {
      client = await db.connect();
      console.log("[Database Connection] Seamlessly connected to Vercel Postgres pool. Running initialization schema...");

      // 1. Create users table with full schema
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
          lifetime_coins INT DEFAULT 200,
          monthly_coins INT DEFAULT 200,
          balance_bdt DECIMAL(10, 2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Create articles table
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

      // 3. Ensure any evolved columns are safely upgraded (Alters tables to eliminate 'column does not exist' runtime bugs)
      const alterQueries = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INT DEFAULT 200",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(10, 2) DEFAULT 0.00",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'reader'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_coins INT DEFAULT 200",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_coins INT DEFAULT 200",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_bdt DECIMAL(10, 2) DEFAULT 0.00",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",

        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100)",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS writer_id VARCHAR(100) DEFAULT 'w-admin'",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS author VARCHAR(255)",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS writer_avatar TEXT",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published'",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS reads INT DEFAULT 0",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_count INT DEFAULT 0",
        "ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      ];

      for (const q of alterQueries) {
        try {
          await client.query(q);
        } catch (alterErr: any) {
          console.warn(`[Migration Warning] Optional column upgrade was skipped: "${q}". Error:`, alterErr.message || alterErr);
        }
      }

      // 4. Seed initial articles if articles table is currently empty
      const articleCountResult = await client.query("SELECT COUNT(*) FROM articles");
      const count = parseInt(articleCountResult.rows[0].count, 10);
      if (count === 0) {
        console.log("[Database Seeding] Seeding default articles into Vercel Postgres...");
        for (const art of INITIAL_ARTICLES) {
          const tagsString = Array.isArray(art.tags) ? art.tags.join(',') : '';
          await client.query(`
            INSERT INTO articles (
              title, content, category, sub_category, tags, writer_id, author, writer_avatar, status, coins, reads, word_count, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            art.title,
            art.content,
            art.category,
            art.subCategory || '',
            tagsString,
            art.writerId || 'w-admin',
            art.writerName || 'রবীন্দ্রনাথ দত্ত',
            art.writerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            art.status || 'published',
            art.requiredCoins || 0,
            art.reads || 0,
            art.wordCount || 150,
            art.createdAt ? new Date(art.createdAt) : new Date()
          ]);
        }
        console.log("[Database Seeding] Data seeding executed successfully.");
      }
    } catch (err: any) {
      console.error("[Database Connection] Database schema/migration initialization error:", err.stack || err);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Common Middleware
  app.use(express.json());

  // -------------------------------------------------------------
  // API ENDPOINTS (PRO-GRADE AND SAFE FROM CONNECTION LEAKS)
  // -------------------------------------------------------------

  // 1. GET /api/articles/get
  app.get("/api/articles/get", async (req, res) => {
    if (hasPostgres) {
      let client;
      try {
        client = await db.connect();
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
        console.error("[Database Error] GET /api/articles/get failed:", err.stack || err);
        return res.status(500).json({ 
          error: "Database read failure. Please contact system admin or verify postgres configurations.", 
          details: err.message || String(err)
        });
      } finally {
        if (client) client.release();
      }
    } else {
      // In-Memory Fallback Response for offline sandbox
      return res.json(fallbackArticles);
    }
  });

  // 2. POST /api/articles/create
  app.post("/api/articles/create", async (req, res) => {
    try {
      const { 
        title, 
        content, 
        category, 
        subCategory = '', 
        tags = '', 
        writerId = 'w-admin', 
        author, 
        writerAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 
        status = 'published', 
        coins = 0, 
        wordCount = 0 
      } = req.body;

      if (!title || !content || !category || !author) {
        return res.status(400).json({ error: "Missing mandatory fields: title, content, category, and author are required." });
      }

      if (hasPostgres) {
        let client;
        try {
          client = await db.connect();
          const resolvedTags = Array.isArray(tags) ? tags.join(',') : (typeof tags === 'string' ? tags : '');
          const resolvedWordCount = wordCount || content.split(/\s+/).filter(Boolean).length;

          const result = await client.query(`
            INSERT INTO articles (
              title, content, category, sub_category, tags, writer_id, author, writer_avatar, status, coins, word_count, reads
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0)
            RETURNING *
          `, [
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
          ]);

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
          console.error("[Database Error] POST /api/articles/create failed:", err.stack || err);
          return res.status(500).json({ 
            error: "Database write failure. Article could not be created.", 
            details: err.message || String(err)
          });
        } finally {
          if (client) client.release();
        }
      } else {
        // In-Memory Fallback Response for offline sandbox
        const newId = 'art-' + Date.now();
        const resolvedTagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : []);
        const newArt: any = {
          id: newId,
          title,
          content,
          category,
          subCategory,
          tags: resolvedTagsArray,
          writerId,
          writerName: author,
          writerAvatar,
          status,
          createdAt: new Date().toISOString().split('T')[0],
          reads: 0,
          wordCount: wordCount || content.split(/\s+/).filter(Boolean).length,
          requiredCoins: Number(coins) || 0
        };

        fallbackArticles = [newArt, ...fallbackArticles];
        return res.status(201).json(newArt);
      }
    } catch (e: any) {
      console.error("[API Error] Inside /api/articles/create handler:", e.stack || e);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 3. POST /api/auth/register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, username, password, avatar, bio } = req.body;
      if (!name || !username || !password) {
        return res.status(400).json({ error: "Name, username, and password are required fields." });
      }

      const lowerUsername = username.trim().toLowerCase();

      if (hasPostgres) {
        let client;
        try {
          client = await db.connect();

          const userCheck = await client.query(
            "SELECT id FROM users WHERE username = $1",
            [lowerUsername]
          );

          if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: "Username already exists. Please choose another username." });
          }

          const { hash, salt } = hashPassword(password);
          const userAvatar = avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
          const userBio = bio || "মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।";

          const result = await client.query(`
            INSERT INTO users (
              name, username, password_hash, salt, avatar, coins, spent_amount, bio, role, lifetime_coins, monthly_coins, balance_bdt
            ) VALUES ($1, $2, $3, $4, $5, 200, 0.00, $6, 'reader', 200, 200, 0.00)
            RETURNING id, name, username, avatar, coins, spent_amount, bio, role, lifetime_coins, monthly_coins, balance_bdt
          `, [
            name.trim(),
            lowerUsername,
            hash,
            salt,
            userAvatar,
            userBio
          ]);

          const newUser = result.rows[0];

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
        } catch (dbErr: any) {
          console.error("[Database Error] POST /api/auth/register failed:", dbErr.stack || dbErr);
          return res.status(500).json({ 
            error: "Registration failed on Vercel Postgres database connection.", 
            details: dbErr.message || String(dbErr)
          });
        } finally {
          if (client) client.release();
        }
      } else {
        // In-Memory Fallback Response for offline sandbox
        const existingUser = fallbackUsers.find((u: any) => u.username === lowerUsername);
        if (existingUser) {
          return res.status(409).json({ error: "Username already exists. Please choose another username." });
        }

        const { hash, salt } = hashPassword(password);
        const userAvatar = avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
        const userBio = bio || "মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।";

        const newUser: any = {
          id: "usr-" + Date.now(),
          name: name.trim(),
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
          balance_bdt: 0.00
        };

        fallbackUsers = [...fallbackUsers, newUser];

        const token = signJwt({
          userId: newUser.id,
          username: newUser.username,
          role: newUser.role
        });

        return res.status(201).json({
          success: true,
          message: "Registration successful!",
          user: {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            avatar: newUser.avatar,
            currentCoins: newUser.coins,
            spentAmount: 0,
            bio: newUser.bio,
            role: newUser.role,
            lifetime_coins: newUser.lifetime_coins,
            monthly_coins: newUser.monthly_coins,
            balance_bdt: newUser.balance_bdt
          },
          token
        });
      }
    } catch (e: any) {
      console.error("[API Error] Inside /api/auth/register handler:", e.stack || e);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 4. POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required fields." });
      }

      const lowerUsername = username.trim().toLowerCase();

      if (hasPostgres) {
        let client;
        try {
          client = await db.connect();
          const result = await client.query(`
            SELECT id, name, username, password_hash, salt, avatar, coins, spent_amount, bio, role, lifetime_coins, monthly_coins, balance_bdt 
            FROM users 
            WHERE username = $1
          `, [lowerUsername]);

          if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password. User not found." });
          }

          const dbUser = result.rows[0];
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
        } catch (dbErr: any) {
          console.error("[Database Error] POST /api/auth/login failed:", dbErr.stack || dbErr);
          return res.status(500).json({ 
            error: "Authentication failed on Vercel Postgres database connection.", 
            details: dbErr.message || String(dbErr)
          });
        } finally {
          if (client) client.release();
        }
      } else {
        // In-Memory Fallback Response for offline sandbox
        const user = fallbackUsers.find((u: any) => u.username === lowerUsername);
        if (!user) {
          return res.status(401).json({ error: "Invalid username or password. User not found." });
        }

        const isValid = verifyPassword(password, user.password_hash, user.salt);
        if (!isValid) {
          return res.status(401).json({ error: "Invalid username or password. Please try again." });
        }

        const token = signJwt({
          userId: user.id,
          username: user.username,
          role: user.role
        });

        return res.json({
          success: true,
          message: "Login successful!",
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            currentCoins: user.coins,
            spentAmount: user.spent_amount,
            bio: user.bio,
            role: user.role,
            lifetime_coins: user.lifetime_coins || 200,
            monthly_coins: user.monthly_coins || 200,
            balance_bdt: user.balance_bdt || 0.00
          },
          token
        });
      }
    } catch (e: any) {
      console.error("[API Error] Inside /api/auth/login handler:", e.stack || e);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------------------------------------------------
  // VITE DEVELOPMENT MODES & STATIC ROUTING HANDLERS
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    // Dynamically load Vite's dev server middleware to speed up loading
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

  // Bind to host and listen on port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Server] Server running successfully on port ${PORT}`);
  });
}

// Spark up Express server + Database initialization
startServer();
