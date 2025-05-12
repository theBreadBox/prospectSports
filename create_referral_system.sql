-- Add referral code and referral tracking to the prospect_al table

-- Add a referral_code column (unique per user)
ALTER TABLE prospect_al ADD COLUMN referral_code VARCHAR(20) UNIQUE;

-- Add a referred_by column to track who referred this user
ALTER TABLE prospect_al ADD COLUMN referred_by VARCHAR(20);

-- Add a constraint to ensure referred_by is a valid referral_code
ALTER TABLE prospect_al 
  ADD CONSTRAINT fk_referred_by 
  FOREIGN KEY (referred_by) 
  REFERENCES prospect_al(referral_code);

-- Generate random referral codes for existing users
UPDATE prospect_al
SET referral_code = SUBSTR(MD5(RANDOM()::TEXT), 1, 10)
WHERE referral_code IS NULL;

-- Create referral usage tracking function
CREATE OR REPLACE FUNCTION check_referral_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the provided referral code exists
  IF NEW.referred_by IS NOT NULL THEN
    -- Count how many times this referral code has been used
    DECLARE
      usage_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO usage_count
      FROM prospect_al
      WHERE referred_by = NEW.referred_by;
      
      -- If used 5 or more times, block the insert
      IF usage_count >= 5 THEN
        RAISE EXCEPTION 'Referral code has reached maximum usage limit';
      END IF;
    END;
  END IF;
  
  -- If code is not used or is under the limit, allow the insert
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to check referral usage before insert
CREATE TRIGGER check_referral_before_insert
BEFORE INSERT ON prospect_al
FOR EACH ROW
EXECUTE FUNCTION check_referral_usage(); 