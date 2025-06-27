
-- Add trigger to ensure location is marked as unavailable when assigned to a reptile
CREATE OR REPLACE FUNCTION manage_location_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- If a new location is being assigned
  IF NEW.location_id IS NOT NULL AND (OLD.location_id IS NULL OR OLD.location_id != NEW.location_id) THEN
    -- Mark the new location as unavailable
    UPDATE locations SET is_available = FALSE WHERE id = NEW.location_id;
  END IF;
  
  -- If an existing location is being unassigned
  IF OLD.location_id IS NOT NULL AND (NEW.location_id IS NULL OR NEW.location_id != OLD.location_id) THEN
    -- Mark the old location as available again
    UPDATE locations SET is_available = TRUE WHERE id = OLD.location_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER reptile_location_change
BEFORE UPDATE ON reptiles
FOR EACH ROW
EXECUTE FUNCTION manage_location_availability();

CREATE TRIGGER reptile_location_insert
BEFORE INSERT ON reptiles
FOR EACH ROW
EXECUTE FUNCTION manage_location_availability(); 