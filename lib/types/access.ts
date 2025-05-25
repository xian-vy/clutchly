export interface AccessControl {
    id: string;
    page_id: string;
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
    description?: string; 
}

// Helper type for creating new access controls
export interface CreateAccessControl {
    page_id: string;
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
    description?: string;
}

// New type to group access controls into profiles
export interface AccessProfile {
    id: string;
    name: string;
    description?: string;
    access_controls: AccessControl[];
    created_at: string;
    updated_at: string;
}

// Helper type for creating new access profiles
export interface CreateAccessProfile {
    name: string;
    description?: string;
    access_controls: CreateAccessControl[];
}