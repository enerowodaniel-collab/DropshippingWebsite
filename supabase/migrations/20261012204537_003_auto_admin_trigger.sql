/*
# Auto-admin trigger

1. Changes
- Creates a trigger function that auto-assigns 'admin' role to the first user who signs up, 'customer' to all subsequent users
- Creates trigger on auth.users table
2. Security: trigger runs with SECURITY DEFINER
3. Notes
- The first registered user becomes the store admin automatically
- All subsequent users get 'customer' role
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin') THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'customer');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();