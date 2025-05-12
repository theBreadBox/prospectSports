import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://Allowlist_owner:npg_kE1gGq6nbcad@ep-lucky-thunder-a4cg4mvm-pooler.us-east-1.aws.neon.tech/Allowlist?sslmode=require',
});

export async function POST(request: Request) {
  try {
    const { wallet_address, email } = await request.json();

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      // Check if address already exists
      const checkResult = await client.query(
        'SELECT 1 FROM prospect_al WHERE wallet_address = $1',
        [wallet_address]
      );

      if ((checkResult.rowCount ?? 0) > 0) {
        return NextResponse.json(
          { error: 'Wallet address already registered' },
          { status: 409 }
        );
      }

      // Insert the new address with email
      await client.query(
        'INSERT INTO prospect_al (wallet_address, email) VALUES ($1, $2)',
        [wallet_address, email]
      );

      return NextResponse.json(
        { message: 'Wallet address and email stored successfully' },
        { status: 200 }
      );
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error storing wallet address:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 