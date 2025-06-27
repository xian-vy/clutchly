
-- Create profile trigger to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organizations (id, email, is_active)
  VALUES (NEW.id, NEW.email, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to execute the function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

---------------------------------------------------------------------------------------------------------------------------------

-- Create a function to update user status when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS trigger AS $$
BEGIN
  -- Update the user status to active when email is confirmed
  UPDATE public.users
  SET status = 'active'
  WHERE id = NEW.id
  AND NEW.email_confirmed_at IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER  SET search_path = public;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_user();
