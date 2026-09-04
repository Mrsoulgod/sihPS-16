export type RoleCode =
  | "ROLE_CENTRAL_OFFICER"
  | "ROLE_STATE_OFFICER"
  | "ROLE_DISTRICT_OFFICER"
  | "ROLE_PROJECT_AGENCY"
  | "ROLE_FIELD_OFFICER"
  | "ROLE_ADMIN";

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  full_name: string;
  designation: string;
  organization: string;
  role_id: string;
  role_name?: string;
  state_id?: string | null;
  state_name?: string | null;
  district_id?: string | null;
  district_name?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
}

export interface LoginResponseData {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  user: UserSummary;
}

export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface SwitchRolePayload {
  target_role: string;
}
