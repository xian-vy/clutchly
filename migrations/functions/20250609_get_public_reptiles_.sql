
CREATE OR REPLACE FUNCTION get_public_reptiles()
RETURNS TABLE (
    id uuid,
    created_at timestamp with time zone,
    last_modified timestamp with time zone,
    org_id uuid,
    name text,
    price numeric,
    reptile_code varchar(255),
    morph_id int,
    species_id int,
    visual_traits text[],
    het_traits jsonb,
    sex text,
    weight int,
    length int,
    hatch_date date,
    acquisition_date date,
    status text, 
    notes text,
    parent_clutch_id uuid,
    dam_id uuid,
    sire_id uuid,
    generation integer,
    breeding_line text,
    is_breeder boolean,
    retired_breeder boolean,
    project_ids uuid[],
    location_id uuid,
    original_breeder text,
    morph_name text,
    species_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.created_at,
        r.last_modified,
        r.org_id,
        r.name,
        r.price,
        r.reptile_code,
        r.morph_id,
        r.species_id,
        r.visual_traits,
        r.het_traits,
        r.sex,
        r.weight,
        r.length,
        r.hatch_date,
        r.acquisition_date,
        r.status,
        r.notes,
        r.parent_clutch_id,
        r.dam_id,
        r.sire_id,
        r.generation,
        r.breeding_line,
        r.is_breeder,
        r.retired_breeder,
        r.project_ids,
        r.location_id,
        r.original_breeder,
        m.name AS morph_name,
        s.name AS species_name
    FROM public.catalog_entries ce
    JOIN public.reptiles r ON ce.reptile_id = r.id
    JOIN public.morphs m ON r.morph_id = m.id
    JOIN public.species s ON r.species_id = s.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;