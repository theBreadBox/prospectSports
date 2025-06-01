-- Create a function to check for test data patterns
CREATE OR REPLACE FUNCTION check_test_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the wallet address or email contains test patterns
  IF NEW.wallet_address ~ '(?i)(0xapi_test|api_test|test_wallet|staging|dev\.)'
     OR NEW.email ~ '(?i)(api_test|test_wallet|\.test$|@testing\.|test@testing|staging|dev\.|@dev\.|@example\.|@fake\.)'
  THEN
    -- Log the blocked attempt
    RAISE LOG 'Blocked test data insertion: wallet=%, email=%', NEW.wallet_address, NEW.email;
    
    -- Prevent the insertion
    RAISE EXCEPTION 'Test data insertion blocked: invalid data format detected';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to check test data before insert
DROP TRIGGER IF EXISTS prevent_test_data_insert ON prospect_al;
CREATE TRIGGER prevent_test_data_insert
BEFORE INSERT ON prospect_al
FOR EACH ROW
EXECUTE FUNCTION check_test_data();

-- Create a trigger to check test data before update
DROP TRIGGER IF EXISTS prevent_test_data_update ON prospect_al;
CREATE TRIGGER prevent_test_data_update
BEFORE UPDATE ON prospect_al
FOR EACH ROW
EXECUTE FUNCTION check_test_data();

-- Also clean up any existing test data (optional - uncomment if you want to remove existing test entries)
-- DELETE FROM prospect_al 
-- WHERE wallet_address ~ '(?i)(0xapi_test|api_test|test_|staging|dev\.)'
--    OR email ~ '(?i)(api_test|test_|\.test$|@test\.|test@|staging|dev\.|@dev\.)';

-- Show confirmation message
DO $$
BEGIN
  RAISE NOTICE 'Test data prevention triggers have been successfully created for the prospect_al table.';
  RAISE NOTICE 'The following patterns will be blocked:';
  RAISE NOTICE '- Wallet addresses containing: 0xapi_test, api_test, test_, staging, dev.';
  RAISE NOTICE '- Email addresses containing: api_test, test_, .test, @test., test@, staging, dev., @dev.';
END $$; 