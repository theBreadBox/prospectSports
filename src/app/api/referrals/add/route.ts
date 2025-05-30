import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_uKGYCtV1pkF5@ep-lucky-rain-a62b2bxo-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require',
});

// Function to check if data contains test patterns
function isTestData(wallet_address: string, email: string): boolean {
  const testPatterns = [
    /0xapi_test/i,
    /api_test/i,
    /test_/i,
    /\.test$/i,
    /@test\./i,
    /test@/i,
    /staging/i,
    /dev\./i,
    /@dev\./i
  ];
  
  return testPatterns.some(pattern => 
    pattern.test(wallet_address) || pattern.test(email)
  );
}

// Generate a unique referral code
function generateReferralCode() {
  return crypto.randomBytes(5).toString('hex');
}

export async function POST(request: Request) {
  try {
    const { referrerWallet, referredEmail } = await request.json();

    if (!referrerWallet) {
      return NextResponse.json({ error: 'Referrer wallet address is required' }, { status: 400 });
    }

    if (!referredEmail) {
      return NextResponse.json({ error: 'Referred email is required' }, { status: 400 });
    }

    // Block test data from being inserted
    if (isTestData(referrerWallet, referredEmail)) {
      console.log(`Blocked test data insertion in referrals/add: wallet=${referrerWallet}, email=${referredEmail}`);
      return NextResponse.json(
        { error: 'Invalid data format detected' },
        { status: 400 }
      );
    }

    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      // Find the referrer by wallet address to get their referral code
      const referrerResult = await client.query(
        'SELECT referral_code FROM prospect_al WHERE wallet_address = $1',
        [referrerWallet]
      );

      if ((referrerResult.rowCount ?? 0) === 0) {
        return NextResponse.json(
          { error: 'Referrer not found' },
          { status: 404 }
        );
      }

      const referralCode = referrerResult.rows[0].referral_code;

      // Check if email already exists
      const emailCheckResult = await client.query(
        'SELECT 1 FROM prospect_al WHERE email = $1',
        [referredEmail]
      );

      if ((emailCheckResult.rowCount ?? 0) > 0) {
        return NextResponse.json(
          { error: 'Email address already registered' },
          { status: 409 }
        );
      }

      // Check referral usage count
      const usageResult = await client.query(
        'SELECT COUNT(*) FROM prospect_al WHERE referred_by = $1',
        [referralCode]
      );
      
      if (parseInt(usageResult.rows[0].count) >= 5) {
        return NextResponse.json(
          { error: 'Referral code has reached maximum usage limit' },
          { status: 400 }
        );
      }

      // Generate a unique referral code for the new user
      const newReferralCode = generateReferralCode();

      // Insert the new referral with a placeholder wallet address that will be updated when they connect
      await client.query(
        'INSERT INTO prospect_al (wallet_address, email, referral_code, referred_by) VALUES ($1, $2, $3, $4)',
        ['pending_' + newReferralCode, referredEmail, newReferralCode, referralCode]
      );

      return NextResponse.json(
        { 
          message: 'Referral added successfully',
          referralCode: newReferralCode
        },
        { status: 200 }
      );
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error adding referral:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 