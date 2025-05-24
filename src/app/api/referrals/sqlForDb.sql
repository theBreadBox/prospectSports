CREATE EXTENSION IF NOT EXISTS pgcrypto;

/**************************************************/    

ALTER TABLE prospect_al
ADD COLUMN referral_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(5), 'hex'),
ADD COLUMN referred_by TEXT REFERENCES prospect_al(referral_code),
ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

/**************************************************/    

CREATE OR REPLACE FUNCTION enforce_referral_limit()
RETURNS TRIGGER AS $$
DECLARE
    referral_usage_count INTEGER;
BEGIN
    IF NEW.referred_by IS NOT NULL THEN
        SELECT COUNT(*) INTO referral_usage_count
        FROM prospect_al
        WHERE referred_by = NEW.referred_by;

        IF referral_usage_count >= 5 THEN
            RAISE EXCEPTION 'Referral code % has already been used 5 times', NEW.referred_by;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/**************************************************/    

CREATE OR REPLACE FUNCTION enforce_referral_limit()
RETURNS TRIGGER AS $$
DECLARE
    referral_usage_count INTEGER;
BEGIN
    IF NEW.referred_by IS NOT NULL THEN
        SELECT COUNT(*) INTO referral_usage_count
        FROM prospect_al
        WHERE referred_by = NEW.referred_by;

        IF referral_usage_count >= 5 THEN
            RAISE EXCEPTION 'Referral code % has already been used 5 times', NEW.referred_by;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;