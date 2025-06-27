
-- Create function to set up free trial subscription on profile creation
CREATE OR REPLACE FUNCTION public.create_free_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  trial_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set trial end to 14 days from now
  trial_end_date := TIMEZONE('utc', NOW()) + INTERVAL '30 days';
  
  -- Create subscription record
  INSERT INTO public.subscriptions (
    org_id, 
    plan, 
    status, 
    trial_end, 
    current_period_end
  )
  VALUES (
    NEW.id, 
    'Basic', 
    'trialing', 
    trial_end_date,
    trial_end_date
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to execute the function on profile creation
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_free_trial_subscription(); 