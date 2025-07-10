-- Update the user's registration status to true for existing users with basic profile data
UPDATE user_profiles 
SET registration_completed = true 
WHERE email = 'helgasoul@yandex.ru' 
  AND (first_name IS NOT NULL AND first_name != '' OR last_name IS NOT NULL AND last_name != '');