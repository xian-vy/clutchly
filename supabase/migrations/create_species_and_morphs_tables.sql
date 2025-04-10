-- Create species table
CREATE TABLE species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    scientific_name TEXT,
    description TEXT,
    care_level TEXT CHECK (care_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create morphs table
CREATE TABLE morphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    species_id UUID REFERENCES species(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    genetic_traits TEXT[],
    visual_traits TEXT[],
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE morphs ENABLE ROW LEVEL SECURITY;

-- Species policies
CREATE POLICY "Users can view their own species"
    ON species FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own species"
    ON species FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own species"
    ON species FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own species"
    ON species FOR DELETE
    USING (auth.uid() = user_id);

-- Morphs policies
CREATE POLICY "Users can view their own morphs"
    ON morphs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own morphs"
    ON morphs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own morphs"
    ON morphs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own morphs"
    ON morphs FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX species_user_id_idx ON species(user_id);
CREATE INDEX morphs_user_id_idx ON morphs(user_id);
CREATE INDEX morphs_species_id_idx ON morphs(species_id);

-- Update triggers for last_modified
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_species_last_modified
    BEFORE UPDATE ON species
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_morphs_last_modified
    BEFORE UPDATE ON morphs
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified(); 