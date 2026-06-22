# Read2Print Next.js (App Router) & Vercel Postgres Migration Guide

This step-by-step developer blueprint will guide you through migrating your **read2print** platform to Next.js (App Router), enabling permanent serverless Postgres synchronization when you deploy on Vercel.

---

## 1. Database Schema Setup

First, initiate your **Vercel Postgres** database instance via the Vercel dashboard. Then, run the SQL code generated in the `nextjs-migration/database/table_schema.sql` file in your database console to set up the `articles` table:

```sql
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100) DEFAULT '',
  tags TEXT DEFAULT '', -- comma-separated list of tags
  writer_id VARCHAR(50) DEFAULT 'w-admin',
  author VARCHAR(100) NOT NULL, -- writerName
  writer_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  status VARCHAR(20) DEFAULT 'published',
  coins INT DEFAULT 0, -- requiredCoins
  reads INT DEFAULT 0,
  word_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
```

---

## 2. Dependencies Installation

To use Vercel Postgres in your Next.js project, install the `@vercel/postgres` connector in your Next.js workspace:

```bash
npm install @vercel/postgres
```

---

## 3. Serverless API Route Definitions

Place the API routes in your Next.js directory exactly like this:

### A. Publish API: `app/api/articles/create/route.ts`
This API captures properties from the Writer Panel publication form and performs a parameterized SQL insertion to prevent SQL injection.

### B. Discover API: `app/api/articles/get/route.ts`
This route connects to Vercel Postgres, retrieves records ordered descendingly by date, and serves them back in a clean json format. (Remember to configure `export const revalidate = 0;` to prevent Vercel CDN static caching, ensuring edits and additions show up instantly).

---

## 4. Frontend Fetch Integration

To query these real APIs inside your Next.js frontend pages (or components):

### A. Loading standard articles on page visit:
```javascript
useEffect(() => {
  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles/get');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Map properties safely back into standard frontend camelCase Article format
          const mapped = data.map((item) => ({
            id: item.id?.toString(),
            title: item.title,
            content: item.content,
            category: item.category,
            subCategory: item.subCategory || '',
            tags: item.tags ? item.tags.split(',') : [],
            writerId: item.writerId || 'w-admin',
            writerName: item.author || 'মডারেটর',
            writerAvatar: item.writerAvatar,
            status: item.status || 'published',
            createdAt: item.created_at ? item.created_at.split('T')[0] : '2026-06-22',
            reads: item.reads || 0,
            wordCount: item.wordCount || 0,
            requiredCoins: item.coins || 0
          }));
          setArticles(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to query DB articles:", err);
    }
  };
  fetchArticles();
}, []);
```

### B. Registering/Publishing written articles:
```javascript
const handleAddArticle = async (newArticle) => {
  try {
    const response = await fetch('/api/articles/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newArticle.title,
        content: newArticle.content,
        category: newArticle.category,
        author: newArticle.writerName,
        coins: newArticle.requiredCoins || 0,
        subCategory: newArticle.subCategory || '',
        tags: Array.isArray(newArticle.tags) ? newArticle.tags.join(',') : '',
        writerId: newArticle.writerId,
        writerAvatar: newArticle.writerAvatar,
        status: newArticle.status,
        wordCount: newArticle.wordCount
      }),
    });
    
    if (response.ok) {
      const dbArticle = await response.json();
      console.log("Published and saved to Vercel Postgres db successfully:", dbArticle);
    }
  } catch (err) {
    console.error("Network error saving article:", err);
  }
};
```

---

## 5. Vercel Environment Variables Configuration
Ensure that during Vercel project configuration, you link your Vercel Postgres service to your Next.js project. Vercel automatically populates the required credentials:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

Now, you have a solid production-grade serverless Next.js App Router framework ready to power your `read2print` application!
