import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_uKGYCtV1pkF5@ep-lucky-rain-a62b2bxo-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require',
});

// Generate a unique referral code
function generateReferralCode() {
  return crypto.randomBytes(5).toString('hex');
}

// Function to check if data contains test patterns
function isTestData(wallet_address: string, email: string): boolean {
  const testPatterns = [
    /0xapi_test/i,
    /api_test/i,
    /test_wallet/i,  // More specific test pattern
    /\.test$/i,
    /@testing\./i,   // Changed from /@test\./ to /@testing\./
    /test@/i,
    /staging/i,
    /dev\./i,
    /@dev\./i,
    /@example\./i,   // Block example domains
    /@fake\./i       // Block fake domains
  ];
  
  return testPatterns.some(pattern => 
    pattern.test(wallet_address) || pattern.test(email)
  );
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { wallet_address, referred_by, twitter_id, twitter_username } = requestBody;
    let { email } = requestBody;

    console.log('=== Submit Wallet Debug ===');
    console.log('Request body:', requestBody);
    console.log('Wallet address:', wallet_address);
    console.log('Email:', email);
    console.log('Referred by:', referred_by);
    console.log('Twitter ID:', twitter_id);
    console.log('Twitter username:', twitter_username);
    console.log('=== End Debug ===');

    if (!wallet_address) {
      console.log('Missing wallet address');
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    if (!email) {
      // If Twitter data is provided, we can make email optional
      if (twitter_id && twitter_username) {
        console.log('Email not provided, but Twitter data is available - proceeding without email');
        // We'll use a placeholder email based on Twitter username with a safe domain
        email = `${twitter_username}@twitter-user.com`;
      } else {
        console.log('Missing email and no Twitter data');
        return NextResponse.json({ error: 'Email is required when Twitter is not connected' }, { status: 400 });
      }
    }

    // Block test data from being inserted (but allow Twitter placeholder emails)
    if (isTestData(wallet_address, email) && !email.includes('@twitter-user.com')) {
      console.log(`Blocked test data insertion: wallet=${wallet_address}, email=${email}`);
      return NextResponse.json(
        { error: 'Invalid data format detected' },
        { status: 400 }
      );
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

      // Check if email already exists
      const emailCheckResult = await client.query(
        'SELECT 1 FROM prospect_al WHERE email = $1',
        [email]
      );

      if ((emailCheckResult.rowCount ?? 0) > 0) {
        return NextResponse.json(
          { error: 'Email address already registered' },
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

      // Prepare the insert query based on what data we have
      let insertQuery: string;
      let insertValues: (string | undefined)[];

      try {
        // Try to insert with Twitter data if available (store username in twitter_id column)
        if (twitter_id && twitter_username) {
          console.log('Attempting insert with Twitter username in twitter_id column');
          if (referred_by) {
            insertQuery = 'INSERT INTO prospect_al (wallet_address, email, referral_code, referred_by, twitter_id) VALUES ($1, $2, $3, $4, $5)';
            insertValues = [wallet_address, email, referral_code, referred_by, twitter_username]; // Store username in twitter_id column
          } else {
            insertQuery = 'INSERT INTO prospect_al (wallet_address, email, referral_code, twitter_id) VALUES ($1, $2, $3, $4)';
            insertValues = [wallet_address, email, referral_code, twitter_username]; // Store username in twitter_id column
          }
        } else {
          console.log('Attempting insert without Twitter data');
          if (referred_by) {
            insertQuery = 'INSERT INTO prospect_al (wallet_address, email, referral_code, referred_by) VALUES ($1, $2, $3, $4)';
            insertValues = [wallet_address, email, referral_code, referred_by];
          } else {
            insertQuery = 'INSERT INTO prospect_al (wallet_address, email, referral_code) VALUES ($1, $2, $3)';
            insertValues = [wallet_address, email, referral_code];
          }
        }

        // Execute the insert
        console.log('Executing insert query:', insertQuery);
        console.log('With values:', insertValues);
        await client.query(insertQuery, insertValues);

      } catch (twitterInsertError) {
        // If Twitter insert fails, try without Twitter data
        if (twitter_id && twitter_username && twitterInsertError instanceof Error) {
          console.log('Twitter insert failed, retrying without Twitter data:', twitterInsertError.message);
          if (referred_by) {
            insertQuery = 'INSERT INTO prospect_al (wallet_address, email, referral_code, referred_by) VALUES ($1, $2, $3, $4)';
            insertValues = [wallet_address, email, referral_code, referred_by];
          } else {
            insertQuery = 'INSERT INTO prospect_al (wallet_address, email, referral_code) VALUES ($1, $2, $3)';
            insertValues = [wallet_address, email, referral_code];
          }
          
          console.log('Retrying insert query:', insertQuery);
          console.log('With values:', insertValues);
          await client.query(insertQuery, insertValues);
        } else {
          throw twitterInsertError;
        }
      }

      console.log('Registration successful for wallet:', wallet_address);
      return NextResponse.json(
        { 
          message: 'Registration successful', 
          referral_code: referral_code 
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error during insert:', dbError);
      throw dbError; // Re-throw to be caught by outer catch
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error storing wallet address:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Check if it's a referral limit error
    if (error instanceof Error && error.message.includes('maximum usage limit')) {
      return NextResponse.json(
        { error: 'Referral code has reached maximum usage limit' },
        { status: 400 }
      );
    }
    
    // Check if it's a database schema error
    if (error instanceof Error && error.message.includes('column')) {
      console.error('Database schema error - missing columns?');
      return NextResponse.json(
        { error: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 