import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_uKGYCtV1pkF5@ep-lucky-rain-a62b2bxo-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get user's referral stats
      const userResult = await client.query(
        'SELECT wallet_address, email, referral_code FROM prospect_al WHERE wallet_address = $1',
        [wallet]
      );

      if (userResult.rowCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const user = userResult.rows[0];

      // Get referred users
      const referredResult = await client.query(
        'SELECT email as referred_email, wallet_address as referred_wallet FROM prospect_al WHERE referred_by = $1',
        [user.referral_code]
      );

      const stats = {
        email: user.email,
        wallet_address: user.wallet_address,
        referral_code: user.referral_code,
        total_referred: referredResult.rowCount || 0,
        remaining_uses: Math.max(0, 5 - (referredResult.rowCount || 0))
      };

      return NextResponse.json({
        stats,
        referred_users: referredResult.rows || []
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