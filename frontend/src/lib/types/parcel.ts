export interface LandownerSummaryItem {
  id: string;
  full_name: string;
  relative_name?: string;
  social_category: string;
  is_kyc_verified: boolean;
  masked_aadhaar: string;
  masked_bank_account: string;
  bank_name: string;
  ownership_share_percent: number;
  extent_area_acres: number;
  is_primary_contact: boolean;
}

export interface FieldVerificationItem {
  id: string;
  verification_date: string;
  verified_by_name: string;
  verified_by_role: string;
  ground_survey_notes?: string;
  trees_count: number;
  structures_count: number;
  wells_count: number;
  verification_status: string;
}

export interface ParcelListItem {
  id: string;
  project_id: string;
  project_code: string;
  project_title: string;
  village_id: string;
  village_name: string;
  district_name: string;
  state_name: string;
  khasra_number: string;
  khata_number: string;
  total_area_acres: number;
  acquired_area_acres: number;
  land_type: string;
  acquisition_status: string;
  verification_status: string;
  is_disputed: boolean;
  owner_count: number;
  primary_owner_name?: string;
  possession_status: string;
  centroid: [number, number];
}

export interface ParcelListResponse {
  items: ParcelListItem[];
  total_records: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ParcelDetailResponse {
  id: string;
  project_id: string;
  project_code: string;
  project_title: string;
  sponsoring_ministry: string;
  implementing_agency: string;
  village_id: string;
  village_name: string;
  tehsil_name: string;
  district_name: string;
  state_name: string;
  khasra_number: string;
  khata_number: string;
  total_area_acres: number;
  acquired_area_acres: number;
  land_type: string;
  circle_rate_per_sqm: number;
  market_multiplier: number;
  acquisition_status: string;
  verification_status: string;
  current_workflow_stage: string;
  is_disputed: boolean;
  centroid_latitude: number;
  centroid_longitude: number;
  geojson_polygon: any;
  owners: LandownerSummaryItem[];
  field_verifications: FieldVerificationItem[];
  recent_activity: Array<{
    id: number;
    action: string;
    timestamp: string;
    details?: any;
  }>;
  can_verify: boolean;
}

export interface FieldVerificationCreateRequest {
  discrepancies_found?: boolean;
  findings?: string;
  trees_count: number;
  structures_count: number;
  wells_count: number;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  recommendation?: string;
  ground_survey_notes?: string;
  verification_status?: string;
}

export interface GisGeoJsonFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Polygon" | "LineString" | "MultiPolygon";
    coordinates: any;
  };
  properties: {
    parcel_id: string;
    ulpin?: string;
    khasra_number: string;
    khata_number: string;
    village_name: string;
    tehsil_name?: string;
    district_name?: string;
    state_name?: string;
    total_area_acres: number;
    acquired_area_acres: number;
    area_sqm?: number;
    land_type: string;
    acquisition_status: string;
    status_label: string;
    verification_status: string;
    is_disputed: boolean;
    dispute_reason?: string;
    owner_name?: string;
    owner_count?: number;
    circle_rate_sqm?: number;
    assessed_compensation_inr?: number;
    trees_count?: number;
    structures_count?: number;
    wells_count?: number;
    centroid: [number, number];
    current_stage: string;
    fillColor: string;
    color: string;
    fillOpacity: number;
    weight: number;
    layer_type?: "PARCEL" | "ROW_CENTERLINE" | "ROW_BUFFER" | "VILLAGE_BOUNDARY" | "ECO_SENSITIVE";
  };
}

export interface GisGeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GisGeoJsonFeature[];
  metadata?: {
    project_id?: string;
    project_title?: string;
    total_parcels?: number;
    parcel_count?: number;
    center?: [number, number];
    bounds?: [[number, number], [number, number]];
    row_width_meters?: number;
    survey_datum?: string;
    epsg?: string;
  };
}
