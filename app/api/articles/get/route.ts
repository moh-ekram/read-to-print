import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Ensure the route response is not statically cached indefinitely
export const revalidate = 0; 

// GET /api/articles/get
// Retrieve all articles from Vercel Postgres
export async function GET() {
  try {
    const client = await db.connect();

    // Query to pull all rows, ordered by newest first
    const result = await client.query(
      `SELECT 
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
      ORDER BY created_at DESC`
    );

    client.release();

    // Return the rows directly as JSON array
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching articles from Vercel Postgres:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve articles', details: error.message },
      { status: 500 }
    );
  }
}
