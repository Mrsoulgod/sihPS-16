export const RoleCode = {
  CENTRAL_OFFICER: "ROLE_CENTRAL_OFFICER",
  STATE_OFFICER: "ROLE_STATE_OFFICER",
  DISTRICT_OFFICER: "ROLE_DISTRICT_OFFICER",
  PROJECT_AGENCY: "ROLE_PROJECT_AGENCY",
  FIELD_OFFICER: "ROLE_FIELD_OFFICER",
  ADMIN: "ROLE_ADMIN",
} as const;

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];

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
