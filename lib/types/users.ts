export type UserRoles = 'admin' | 'staff';

export interface User {
    id: string;
    org_id: string;
    access_profile_id: string;
    full_name: string;
    role: UserRoles;
    email?: string; // Optional since it's stored in auth.users
}

// Helper type for creating new users
export interface CreateUser {
    org_id: string;
    access_profile_id: string;
    full_name: string;
    role: UserRoles;
    email: string;
    password: string;
}

// Helper type for updating user access
export interface UpdateUserAccess {
    access_profile_id: string;
}