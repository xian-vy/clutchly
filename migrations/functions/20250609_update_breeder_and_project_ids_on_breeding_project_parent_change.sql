CREATE OR REPLACE FUNCTION update_breeder_and_project_ids_on_breeding_project_parent_change()
RETURNS TRIGGER AS $$
DECLARE
  has_clutch BOOLEAN;
  new_project_ids uuid[];
  old_project_ids uuid[];
BEGIN
  -- Check if this project has at least one clutch
  SELECT EXISTS (
    SELECT 1 FROM clutches WHERE breeding_project_id = NEW.id
  ) INTO has_clutch;

  -- Handle male_id change
  IF NEW.male_id IS DISTINCT FROM OLD.male_id THEN
    IF has_clutch AND NEW.male_id IS NOT NULL THEN
      SELECT project_ids INTO new_project_ids FROM reptiles WHERE id = NEW.male_id;
      IF new_project_ids IS NULL THEN
        new_project_ids := ARRAY[NEW.id];
      ELSIF NOT NEW.id = ANY(new_project_ids) THEN
        new_project_ids := array_append(new_project_ids, NEW.id);
      END IF;
      UPDATE reptiles SET 
        is_breeder = true,
        project_ids = new_project_ids
      WHERE id = NEW.male_id;
    END IF;

    IF OLD.male_id IS NOT NULL THEN
      SELECT project_ids INTO old_project_ids FROM reptiles WHERE id = OLD.male_id;
      IF old_project_ids IS NOT NULL AND NEW.id = ANY(old_project_ids) THEN
        old_project_ids := array_remove(old_project_ids, NEW.id);
        UPDATE reptiles SET 
          project_ids = old_project_ids
        WHERE id = OLD.male_id;
      END IF;
      UPDATE reptiles SET is_breeder = (
        EXISTS (
          SELECT 1 FROM reptiles WHERE dam_id = OLD.male_id OR sire_id = OLD.male_id
        ) OR
        EXISTS (
          SELECT 1 FROM breeding_projects WHERE male_id = OLD.male_id OR female_id = OLD.male_id
        ) OR
        EXISTS (
          SELECT 1 FROM clutches c
          JOIN breeding_projects bp ON c.breeding_project_id = bp.id
          WHERE (bp.male_id = OLD.male_id OR bp.female_id = OLD.male_id)
        )
      ) WHERE id = OLD.male_id;
    END IF;

    -- Update sire_id for all hatchlings if male_id changed
    UPDATE reptiles
    SET sire_id = NEW.male_id
    WHERE parent_clutch_id IN (
      SELECT id FROM clutches WHERE breeding_project_id = NEW.id
    );
  END IF;

  -- Handle female_id change
  IF NEW.female_id IS DISTINCT FROM OLD.female_id THEN
    IF has_clutch AND NEW.female_id IS NOT NULL THEN
      SELECT project_ids INTO new_project_ids FROM reptiles WHERE id = NEW.female_id;
      IF new_project_ids IS NULL THEN
        new_project_ids := ARRAY[NEW.id];
      ELSIF NOT NEW.id = ANY(new_project_ids) THEN
        new_project_ids := array_append(new_project_ids, NEW.id);
      END IF;
      UPDATE reptiles SET 
        is_breeder = true,
        project_ids = new_project_ids
      WHERE id = NEW.female_id;
    END IF;

    IF OLD.female_id IS NOT NULL THEN
      SELECT project_ids INTO old_project_ids FROM reptiles WHERE id = OLD.female_id;
      IF old_project_ids IS NOT NULL AND NEW.id = ANY(old_project_ids) THEN
        old_project_ids := array_remove(old_project_ids, NEW.id);
        UPDATE reptiles SET 
          project_ids = old_project_ids
        WHERE id = OLD.female_id;
      END IF;
      UPDATE reptiles SET is_breeder = (
        EXISTS (
          SELECT 1 FROM reptiles WHERE dam_id = OLD.female_id OR sire_id = OLD.female_id
        ) OR
        EXISTS (
          SELECT 1 FROM breeding_projects WHERE male_id = OLD.female_id OR female_id = OLD.female_id
        ) OR
        EXISTS (
          SELECT 1 FROM clutches c
          JOIN breeding_projects bp ON c.breeding_project_id = bp.id
          WHERE (bp.male_id = OLD.female_id OR bp.female_id = OLD.female_id)
        )
      ) WHERE id = OLD.female_id;
    END IF;

    -- Update dam_id for all hatchlings if female_id changed
    UPDATE reptiles
    SET dam_id = NEW.female_id
    WHERE parent_clutch_id IN (
      SELECT id FROM clutches WHERE breeding_project_id = NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Trigger
DROP TRIGGER IF EXISTS trg_update_breeder_and_project_ids_on_breeding_project_parent_change ON breeding_projects;

CREATE TRIGGER trg_update_breeder_and_project_ids_on_breeding_project_parent_change
AFTER UPDATE OF male_id, female_id ON breeding_projects
FOR EACH ROW
EXECUTE FUNCTION update_breeder_and_project_ids_on_breeding_project_parent_change(); 