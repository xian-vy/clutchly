CREATE OR REPLACE FUNCTION update_is_breeder_on_parent_change()
RETURNS TRIGGER AS $$
BEGIN
  --(only proceed when parent fields actually change to avoid recursion from the breeding project trigger)
  IF TG_OP = 'UPDATE' AND 
     OLD.dam_id IS NOT DISTINCT FROM NEW.dam_id AND 
     OLD.sire_id IS NOT DISTINCT FROM NEW.sire_id THEN
    RETURN NEW;
  END IF;

  -- Set is_breeder = true for new dam/sire
  IF NEW.dam_id IS NOT NULL THEN
    UPDATE reptiles SET is_breeder = true WHERE id = NEW.dam_id;
  END IF;
  IF NEW.sire_id IS NOT NULL THEN
    UPDATE reptiles SET is_breeder = true WHERE id = NEW.sire_id;
  END IF;

  -- Handle removal of dam/sire
  IF TG_OP = 'UPDATE' THEN
    IF OLD.dam_id IS NOT NULL AND OLD.dam_id IS DISTINCT FROM NEW.dam_id THEN
      UPDATE reptiles SET is_breeder = (
        EXISTS (
          SELECT 1 FROM reptiles WHERE dam_id = OLD.dam_id OR sire_id = OLD.dam_id
        ) OR
        EXISTS (
          SELECT 1 FROM breeding_projects WHERE male_id = OLD.dam_id OR female_id = OLD.dam_id
        ) OR
        EXISTS (
          SELECT 1 FROM clutches c
          JOIN breeding_projects bp ON c.breeding_project_id = bp.id
          WHERE (bp.male_id = OLD.dam_id OR bp.female_id = OLD.dam_id)
        )
      ) WHERE id = OLD.dam_id;
    END IF;
    
    IF OLD.sire_id IS NOT NULL AND OLD.sire_id IS DISTINCT FROM NEW.sire_id THEN
      UPDATE reptiles SET is_breeder = (
        EXISTS (
          SELECT 1 FROM reptiles WHERE dam_id = OLD.sire_id OR sire_id = OLD.sire_id
        ) OR
        EXISTS (
          SELECT 1 FROM breeding_projects WHERE male_id = OLD.sire_id OR female_id = OLD.sire_id
        ) OR
        EXISTS (
          SELECT 1 FROM clutches c
          JOIN breeding_projects bp ON c.breeding_project_id = bp.id
          WHERE (bp.male_id = OLD.sire_id OR bp.female_id = OLD.sire_id)
        )
      ) WHERE id = OLD.sire_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;