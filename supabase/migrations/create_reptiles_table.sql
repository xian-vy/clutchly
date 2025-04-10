-- Create the reptiles table
CREATE TABLE reptiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    morph TEXT NOT NULL,
    sex TEXT CHECK (sex IN ('male', 'female', 'unknown')) NOT NULL,
    hatch_date DATE,
    acquisition_date DATE NOT NULL,
    status TEXT CHECK (status IN ('active', 'sold', 'deceased')) NOT NULL DEFAULT 'active',
    notes TEXT,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE reptiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own reptiles
CREATE POLICY "Users can view their own reptiles"
    ON reptiles FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own reptiles
CREATE POLICY "Users can create their own reptiles"
    ON reptiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reptiles
CREATE POLICY "Users can update their own reptiles"
    ON reptiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reptiles
CREATE POLICY "Users can delete their own reptiles"
    ON reptiles FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX reptiles_user_id_idx ON reptiles(user_id);
CREATE INDEX reptiles_created_at_idx ON reptiles(created_at);

-- Function to automatically update last_modified
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_modified on update
CREATE TRIGGER update_reptiles_last_modified
    BEFORE UPDATE ON reptiles
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified(); 