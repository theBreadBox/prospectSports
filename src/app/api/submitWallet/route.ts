import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://Allowlist_owner:npg_kE1gGq6nbcad@ep-lucky-thunder-a4cg4mvm-pooler.us-east-1.aws.neon.tech/Allowlist?sslmode=require',
});

// Generate a unique referral code
function generateReferralCode() {
  return crypto.randomBytes(5).toString('hex');
}

export async function POST(request: Request) {
  try {
    const { wallet_address, email, referred_by } = await request.json();

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

      // If a referral code is provided, validate it exists
      if (referred_by) {
        const referralResult = await client.query(
          'SELECT 1 FROM prospect_al WHERE referral_code = $1',
          [referred_by]
        );

        if ((referralResult.rowCount ?? 0) === 0) {
          return NextResponse.json(
            { error: 'Invalid referral code' },
            { status: 400 }
          );
        }

        // Check referral usage count
        const usageResult = await client.query(
          'SELECT COUNT(*) FROM prospect_al WHERE referred_by = $1',
          [referred_by]
        );
        
        if (parseInt(usageResult.rows[0].count) >= 5) {
          return NextResponse.json(
            { error: 'Referral code has reached maximum usage limit' },
            { status: 400 }
          );
        }
      }

      // Generate a unique referral code for this user
      const referral_code = generateReferralCode();

      // Insert the new address with email and referral information
      if (referred_by) {
        await client.query(
          'INSERT INTO prospect_al (wallet_address, email, referral_code, referred_by) VALUES ($1, $2, $3, $4)',
          [wallet_address, email, referral_code, referred_by]
        );
      } else {
        await client.query(
          'INSERT INTO prospect_al (wallet_address, email, referral_code) VALUES ($1, $2, $3)',
          [wallet_address, email, referral_code]
        );
      }

      return NextResponse.json(
        { 
          message: 'Registration successful', 
          referral_code: referral_code 
        },
        { status: 200 }
      );
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error storing wallet address:', error);
    
    // Check if it's a referral limit error
    if (error instanceof Error && error.message.includes('maximum usage limit')) {
      return NextResponse.json(
        { error: 'Referral code has reached maximum usage limit' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 