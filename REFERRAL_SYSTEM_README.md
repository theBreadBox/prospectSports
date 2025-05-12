# Referral System Implementation

This document explains how the referral system functionality has been implemented for the Prospect allowlist registration.

## Features

1. Users can register with or without a referral code
2. Each user gets a unique referral code after registration
3. Each referral code can only be used up to 5 times
4. Users can view their referral statistics and share their referral link

## Database Schema Changes

The following changes were made to the database schema:

1. Added `referral_code` column (unique per user)
2. Added `referred_by` column to track who referred each user 
3. Created a trigger to enforce the maximum usage limit (5 uses per referral code)

## Installation

1. Run the `create_referral_system.sql` script against your Neon Postgres database:

```bash
psql 'postgresql://Allowlist_owner:npg_kE1gGq6nbcad@ep-lucky-thunder-a4cg4mvm-pooler.us-east-1.aws.neon.tech/Allowlist?sslmode=require' -f create_referral_system.sql
```

## API Endpoints

The following new API endpoints are available:

1. `POST /api/submitWallet` - Updated to handle referral codes during registration
2. `GET /api/referrals` - Get referral statistics for a specific user (filter by email, wallet, or referral code)
3. `POST /api/referrals` - Get all referral statistics across all users

## Usage Examples

### Insert a user WITH a referral code

```sql
INSERT INTO prospect_al (email, wallet_address, referred_by)
VALUES ('newuser@example.com', '0x1234...', 'abc123def4');
```

### Insert a user WITHOUT a referral

```sql
INSERT INTO prospect_al (email, wallet_address)
VALUES ('directsignup@example.com', '0x5678...');
```

### Query to see who a user referred

```sql
SELECT r.email AS referred_user, r.wallet_address
FROM prospect_al p
JOIN prospect_al r ON r.referred_by = p.referral_code
WHERE p.email = 'inviter@example.com';
```

### Get referral stats per user

```sql
SELECT 
  p.email AS inviter,
  COUNT(r.id) AS total_referred,
  5 - COUNT(r.id) AS remaining_uses
FROM prospect_al p
LEFT JOIN prospect_al r ON r.referred_by = p.referral_code
GROUP BY p.id, p.email
ORDER BY total_referred DESC;
```

## Frontend Integration

The frontend has been updated to:

1. Accept referral codes from URL parameters (`?ref=abc123`)
2. Display a referral code input field during registration
3. Show the user's unique referral code after registration
4. Display referral statistics and allow copying the referral link 