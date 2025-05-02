export interface InviteCode {
  id: string;
  code: string;
  is_available: boolean;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
}

export interface InviteCodeRequest {
  code: string;
} 