-- Create backup_logs table
CREATE TABLE backup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL,
  data_size INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_backup_type CHECK (backup_type IN (
    'reptiles',
    'feeding',
    'health',
    'growth',
    'breeding',
    'locations',
    'profiles'
  )),
  CONSTRAINT valid_status CHECK (status IN ('success', 'failed'))
);

-- Enable RLS
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own backup logs"
  ON backup_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backup logs"
  ON backup_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster rate limit checks
CREATE INDEX backup_logs_user_type_created_idx 
  ON backup_logs(user_id, backup_type, created_at DESC); 