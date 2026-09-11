import { RoleCode } from "./auth";

export interface FieldAssignedParcel {
  parcel_id: string;
  khasra_number: string;
  project_id?: string;
  project_code: string;
  project_title: string;
  village_name: string;
  tehsil_name: string;
  district_name: string;
  area_acres: number;
  land_type: string;
  primary_owner_name: string;
  verification_status: string;
  dispute_status: string;
  has_structures: boolean;
  has_trees: boolean;
  task_id?: string;
  task_status?: string;
  due_date?: string;
  assigned_at?: string;
  lat?: number;
  lng?: number;
}

export interface FieldTask {
  id: string;
  task_type: string;
  title: string;
  description?: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED" | "REWORK_REQUIRED" | "COMPLETED" | "OVERDUE" | "PENDING";
  priority: "NORMAL" | "HIGH" | "CRITICAL";
  due_date?: string;
  created_at: string;
  started_at?: string;
  submitted_at?: string;
  is_overdue: boolean;

  project_id: string;
  project_code: string;
  project_title: string;

  parcel_id?: string;
  khasra_number?: string;
  village_name?: string;
  tehsil_name?: string;
  district_name?: string;
  area_acres?: number;
  land_type?: string;
  owner_name?: string;

  rework_reason?: string;
  rework_requested_by?: string;
  rework_requested_at?: string;

  action_url?: string;
  can_start: boolean;
  can_verify: boolean;
  can_resubmit: boolean;
}

export interface FieldLocationData {
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  captured_at?: string;
  notes?: string;
}

export interface FieldParcelCheckData {
  parcel_identifiable: boolean;
  boundary_identifiable: boolean;
  location_corresponds: boolean;
  site_accessible: boolean;
}

export interface FieldLandUseData {
  observed_land_use: string;
  remarks?: string;
}

export interface FieldStructuresData {
  has_structures: boolean;
  structure_type?: string;
  structure_count: number;
  structure_condition?: string;
  remarks?: string;
}

export interface FieldTreesAssetsData {
  has_trees: boolean;
  trees_count: number;
  tree_category?: string;
  other_assets?: string;
  remarks?: string;
}

export interface FieldPhotoItem {
  id?: string;
  category: "PARCEL" | "BOUNDARY" | "STRUCTURE" | "TREE" | "SITE_ADDITIONAL" | string;
  file_name: string;
  file_path: string;
  caption?: string;
  mime_type?: string;
  uploaded_at?: string;
  uploaded_by?: string;
}

export interface FieldVerificationPayload {
  location?: FieldLocationData;
  parcel_check?: FieldParcelCheckData;
  land_use?: FieldLandUseData;
  structures?: FieldStructuresData;
  trees_assets?: FieldTreesAssetsData;
  photos?: FieldPhotoItem[];
  field_remarks: string;
  is_draft: boolean;
}

export interface FieldVerificationDetail {
  task_id: string;
  task_status: string;
  parcel_id: string;
  khasra_number: string;
  khata_number?: string;
  village_name: string;
  tehsil_name: string;
  district_name: string;
  project_id: string;
  project_code: string;
  project_title: string;
  official_area_acres: number;
  official_land_type: string;
  primary_owner_name: string;
  centroid_lat: number;
  centroid_lng: number;
  geojson_polygon?: Record<string, any>;

  location?: FieldLocationData;
  parcel_check?: FieldParcelCheckData;
  land_use?: FieldLandUseData;
  structures?: FieldStructuresData;
  trees_assets?: FieldTreesAssetsData;
  photos: FieldPhotoItem[];
  field_remarks?: string;

  rework_reason?: string;
  rework_requested_by?: string;
  rework_requested_at?: string;

  is_draft: boolean;
  verified_by_name?: string;
  submitted_at?: string;
  started_at?: string;
}

export interface FieldDashboardData {
  assigned_today_count: number;
  pending_count: number;
  in_progress_count: number;
  submitted_count: number;
  overdue_count: number;
  rework_count: number;
  total_assigned_parcels: number;

  priority_tasks: FieldTask[];
  urgent_tasks: FieldTask[];
  rework_tasks: FieldTask[];
  recent_submissions: FieldTask[];
  assigned_parcels: FieldAssignedParcel[];
  notifications: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    timestamp: string;
    action_url?: string;
  }>;
}
