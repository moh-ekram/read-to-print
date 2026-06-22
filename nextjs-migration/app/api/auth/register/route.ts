import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { hashPassword, signJwt } from '../../../lib/jwt';

// POST /api/auth/register
// Registers a new user/reader in Vercel Postgres
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, password, avatar, bio } = body;

    // Validation
    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Name, Username, and Password are required.' },
        { status: 400 }
      );
    }

    const client = await db.connect();

    // Check if user already exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [username.trim().toLowerCase()]
    );

    if (userCheck.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { error: 'Username already exists. Please choose a unique name.' },
        { status: 409 }
      );
    }

    // Securely hash password
    const { hash, salt } = hashPassword(password);
    
    const userAvatar = avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
    const userBio = bio || 'মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।';

    // Insert user into table
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
      RETURNING id, name, username, avatar, coins, spent_amount AS "spentAmount", bio, role`,
      [
        name.trim(),
        username.trim().toLowerCase(),
        hash,
        salt,
        userAvatar,
        userBio
      ]
    );

    client.release();

    const newUser = result.rows[0];

    // Generate token
    const token = signJwt({
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: newUser.id.toString(),
        name: newUser.name,
        username: newUser.username,
        avatar: newUser.avatar,
        currentCoins: newUser.coins,
        spentAmount: Number(newUser.spentAmount) || 0,
        bio: newUser.bio,
        role: newUser.role
      },
      token
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in user registration:', error);
    return NextResponse.json(
      { error: 'Registration failed.', details: error.message },
      { status: 500 }
    );
  }
}
