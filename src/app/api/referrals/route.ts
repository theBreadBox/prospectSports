import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://Allowlist_owner:npg_kE1gGq6nbcad@ep-lucky-thunder-a4cg4mvm-pooler.us-east-1.aws.neon.tech/Allowlist?sslmode=require',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const wallet = searchParams.get('wallet');
  const referralCode = searchParams.get('code');

  if (!email && !wallet && !referralCode) {
    return NextResponse.json(
      { error: 'Must provide either email, wallet address, or referral code' },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    
    try {
      let userId;
      
      // Find the user by email, wallet, or referral code
      if (email) {
        const userResult = await client.query(
          'SELECT id, email, wallet_address, referral_code FROM prospect_al WHERE email = $1',
          [email]
        );
        userId = userResult.rows[0]?.id;
      } else if (wallet) {
        const userResult = await client.query(
          'SELECT id, email, wallet_address, referral_code FROM prospect_al WHERE wallet_address = $1',
          [wallet]
        );
        userId = userResult.rows[0]?.id;
      } else if (referralCode) {
        const userResult = await client.query(
          'SELECT id, email, wallet_address, referral_code FROM prospect_al WHERE referral_code = $1',
          [referralCode]
        );
        userId = userResult.rows[0]?.id;
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get user's referral stats
      const statsResult = await client.query(
        `SELECT 
          p.email,
          p.wallet_address,
          p.referral_code,
         
          COUNT(r.id) AS total_referred,
          5 - COUNT(r.id) AS remaining_uses
        FROM prospect_al p
        LEFT JOIN prospect_al r ON r.referred_by = p.referral_code
        WHERE p.id = $1
        GROUP BY p.id, p.email, p.wallet_address, p.referral_code`,
        [userId]
      );

      // Get list of users referred by this user
      const referralsResult = await client.query(
        `SELECT 
          r.email AS referred_email,
          r.wallet_address AS referred_wallet
        FROM prospect_al p
        JOIN prospect_al r ON r.referred_by = p.referral_code
        WHERE p.id = $1`,
        [userId]
      );

      return NextResponse.json({
        stats: statsResult.rows[0],
        referred_users: referralsResult.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Endpoint to get all referral statistics
export async function POST(request: Request) {
  try {
    const client = await pool.connect();
    
    try {
      // Get referral stats for all users
      const statsResult = await client.query(
        `SELECT 
          u.email AS inviter_email,
          u.wallet_address AS inviter_wallet,
          u.referral_code,
          COUNT(r.id) AS total_referred,
          5 - COUNT(r.id) AS remaining_uses
        FROM prospect_al u
        LEFT JOIN prospect_al r ON r.referred_by = u.referral_code
        GROUP BY u.id, u.email, u.wallet_address, u.referral_code
        ORDER BY total_referred DESC`
      );

      return NextResponse.json({
        referral_stats: statsResult.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching referral statistics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 