export interface AccessControl {
    id: string;
    access_profile_id: string;
    page_id: string;
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
    created_at: string;
    updated_at: string;
}

// Helper type for creating new access controls
export interface CreateAccessControl {
    page_id: string;
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

// New type to group access controls into profiles
export interface AccessProfile {
    id: string;
    org_id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

// Helper type for creating new access profiles
export interface CreateAccessProfile {
    org_id: string;
    name: string;
    description?: string;
    access_controls: CreateAccessControl[];
}

// Type for access profile with its controls
export interface AccessProfileWithControls extends AccessProfile {
    access_controls: AccessControl[];
}