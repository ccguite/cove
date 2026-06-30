-- Fix seeded users by populating required auth fields with empty strings
UPDATE auth.users 
SET 
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  is_anonymous = COALESCE(is_anonymous, false),
  is_sso_user = COALESCE(is_sso_user, false),
  confirmation_token = COALESCE(confirmation_token, '') 
WHERE email IN ('admin@cove.com', 'staff@cove.com');
