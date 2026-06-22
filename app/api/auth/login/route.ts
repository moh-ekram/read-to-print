import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { verifyPassword, signJwt } from '../../../lib/jwt';

// POST /api/auth/login
// Logs in user/reader in Vercel Postgres
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const client = await db.connect();

    // Look up user by username
    const result = await client.query(
      `SELECT id, name, username, password_hash, salt, avatar, coins, spent_amount, bio, role 
       FROM users 
       WHERE username = $1`,
      [username.trim().toLowerCase()]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password. User not found.' },
        { status: 401 }
      );
    }

    const dbUser = result.rows[0];

    // Verify Password match
    const isValid = verifyPassword(password, dbUser.password_hash, dbUser.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password. Please try again.' },
        { status: 401 }
      );
    }

    // Generate authenticated token
    const token = signJwt({
      userId: dbUser.id,
      username: dbUser.username,
      role: dbUser.role
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
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
      token
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in user login:', error);
    return NextResponse.json(
      { error: 'Login verification failed.', details: error.message },
      { status: 500 }
    );
  }
}
