import { Reptile } from "./reptile";

export interface CatalogEntry {
  id: string;
  user_id: string;
  reptile_id: string;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CatalogImage {
  id: string;
  catalog_entry_id: string;
  image_url: string;
  image_path: string;
  display_order: number;
  created_at: string;
}

export interface CatalogSettings {
  id: string;
  user_id: string;
  bio: string | null;
  show_bio: boolean;
  contacts: { [key: string]: string }[] | null;
  address: string | null;
  about : string | null;
  layout_type: 'grid' | 'list';
  created_at: string;
  updated_at: string;
}

export interface EnrichedCatalogEntry extends CatalogEntry {
  reptiles: Reptile & {
    morph_name: string;
    species_name: string;
  };
  catalog_settings: CatalogSettings;
  catalog_images: CatalogImage[];
}
export type NewCatalogEntry = Omit<CatalogEntry, 'id' | 'created_at' | 'updated_at'>;
export type NewCatalogImage = Omit<CatalogImage, 'id' | 'created_at'>;
export type NewCatalogSettings = Omit<CatalogSettings, 'id' | 'created_at' | 'updated_at'>;
