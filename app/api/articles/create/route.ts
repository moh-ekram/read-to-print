import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// POST /api/articles/create
// Insert a newly published article from the writer panel into Vercel Postgres
export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    } = body;

    // Validate request constraints
    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { error: 'Missing required parameters: title, content, category, and author are mandatory.' },
        { status: 400 }
      );
    }

    // Connect to Vercel Postgres client
    const client = await db.connect();

    // Insert statement with parameterized values to prevent SQL Injection
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
        tags,
        writerId,
        author,
        writerAvatar,
        status,
        coins,
        wordCount
      ]
    );

    // Release the client back to the connection pool
    client.release();

    // Return the newly created record
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error inserting article in Vercel Postgres:', error);
    return NextResponse.json(
      { error: 'Failed to insert article', details: error.message },
      { status: 500 }
    );
  }
}
