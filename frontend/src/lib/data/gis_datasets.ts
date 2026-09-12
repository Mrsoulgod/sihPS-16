import { GisGeoJsonFeatureCollection, GisGeoJsonFeature } from "../types/parcel";

// -------------------------------------------------------------
// Bhu-Aadhaar ULPIN (Unique Land Parcel Identification Number) Generator
// Standard: 14-digit alphanumeric string based on State, District, Sub-district, Village & Centroid Coordinates
// -------------------------------------------------------------
export function generateULPIN(stateCode: string, distCode: string, villageCode: string, lat: number, lng: number, khasra: string): string {
  const cleanKhasra = khasra.replace(/[^a-zA-Z0-9]/g, "").padStart(4, "0").slice(0, 4);
  const latPart = Math.round((Math.abs(lat) % 1) * 1000).toString().padStart(3, "0");
  const lngPart = Math.round((Math.abs(lng) % 1) * 1000).toString().padStart(3, "0");
  return `${stateCode}-${distCode}-${cleanKhasra}-${latPart}${lngPart}`.toUpperCase();
}

// -------------------------------------------------------------
// Geodesic Utilities for Accurate Measurement
// -------------------------------------------------------------
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
}

export function calculatePolygonAreaSqm(coords: [number, number][]): number {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const R = 6378137; // meters
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const lat1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    const lon1 = (p1[0] * Math.PI) / 180;
    const lon2 = (p2[0] * Math.PI) / 180;
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = (Math.abs(area) * R * R) / 2;
  return Math.round(area * 100) / 100;
}

// -------------------------------------------------------------
// 1. NH-48 JAIPUR-KOTPUTLI CORRIDOR (PRJ-NH48-PKG4)
// High-Fidelity Highway PostGIS Cadastre
// -------------------------------------------------------------
export const GIS_NH48_PKG4: GisGeoJsonFeatureCollection = {
  type: "FeatureCollection",
  metadata: {
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector (Package 4)",
    total_parcels: 8,
    parcel_count: 8,
    center: [26.9145, 75.7895],
    bounds: [[26.9080, 75.7820], [26.9230, 75.8020]],
    row_width_meters: 60,
    survey_datum: "WGS84 / EPSG:4326 PostGIS",
    epsg: "EPSG:4326",
  },
  features: [
    // --- Parcel 1: Khasra 142/1 (Sundarpura) ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-001",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7860, 26.9115],
            [75.7885, 26.9115],
            [75.7885, 26.9135],
            [75.7860, 26.9135],
            [75.7860, 26.9115],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-001",
        ulpin: "RJ-08-JAI-1421-9118",
        khasra_number: "142/1",
        khata_number: "58",
        village_name: "Sundarpura",
        tehsil_name: "Kotputli",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 3.45,
        acquired_area_acres: 3.45,
        area_sqm: 13961.5,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "ACQUIRED",
        status_label: "Acquired / Disbursed",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Rameshwar Prasad Sharma (50%), Manoj Kumar Sharma (50%)",
        owner_count: 2,
        circle_rate_sqm: 1450,
        assessed_compensation_inr: 38414915,
        trees_count: 14,
        structures_count: 1,
        wells_count: 1,
        centroid: [75.7873, 26.9125],
        current_stage: "SECTION_38",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },

    // --- Parcel 2: Khasra 142/2 (Sundarpura) ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-002",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7885, 26.9135],
            [75.7910, 26.9135],
            [75.7910, 26.9155],
            [75.7885, 26.9155],
            [75.7885, 26.9135],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-002",
        ulpin: "RJ-08-JAI-1422-9138",
        khasra_number: "142/2",
        khata_number: "58",
        village_name: "Sundarpura",
        tehsil_name: "Kotputli",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 2.80,
        acquired_area_acres: 2.80,
        area_sqm: 11331.2,
        land_type: "AGRICULTURAL_UNIRRIGATED",
        acquisition_status: "SECTION_11_NOTIFIED",
        status_label: "Sec 11 Notified",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Bhagwan Sahay Sharma",
        owner_count: 1,
        circle_rate_sqm: 1450,
        assessed_compensation_inr: 29500000,
        trees_count: 8,
        structures_count: 0,
        wells_count: 0,
        centroid: [75.7897, 26.9145],
        current_stage: "SECTION_11",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },

    // --- Parcel 3: Khasra 143/A (Sundarpura) - Disputed Title ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-003",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7910, 26.9155],
            [75.7935, 26.9155],
            [75.7935, 26.9175],
            [75.7910, 26.9175],
            [75.7910, 26.9155],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-003",
        ulpin: "RJ-08-JAI-143A-9159",
        khasra_number: "143/A",
        khata_number: "62",
        village_name: "Sundarpura",
        tehsil_name: "Kotputli",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 4.10,
        acquired_area_acres: 3.50,
        area_sqm: 16592.1,
        land_type: "RESIDENTIAL_COMMERCIAL",
        acquisition_status: "DISPUTED",
        status_label: "Disputed / Court Stay",
        verification_status: "SURVEYED",
        is_disputed: true,
        dispute_reason: "Civil Suit #218/2025 (District Court Jaipur): Co-owner Partition & Inheritance injunction",
        owner_name: "Mohan Lal Yadav & 2 Others",
        owner_count: 3,
        circle_rate_sqm: 2100,
        assessed_compensation_inr: 51200000,
        trees_count: 4,
        structures_count: 2,
        wells_count: 1,
        centroid: [75.7922, 26.9165],
        current_stage: "SECTION_15",
        fillColor: "#ef4444",
        color: "#b91c1c",
        fillOpacity: 0.7,
        weight: 2,
        layer_type: "PARCEL",
      },
    },

    // --- Parcel 4: Khasra 144/B (Sundarpura) ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-004",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7860, 26.9135],
            [75.7885, 26.9135],
            [75.7885, 26.9155],
            [75.7860, 26.9155],
            [75.7860, 26.9135],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-004",
        ulpin: "RJ-08-JAI-144B-9137",
        khasra_number: "144/B",
        khata_number: "71",
        village_name: "Sundarpura",
        tehsil_name: "Kotputli",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 1.95,
        acquired_area_acres: 1.00,
        area_sqm: 7891.4,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "VERIFICATION_PENDING",
        status_label: "Under Ground Survey",
        verification_status: "IN_PROGRESS",
        is_disputed: false,
        owner_name: "Smt. Kamala Devi Meena",
        owner_count: 1,
        circle_rate_sqm: 1450,
        assessed_compensation_inr: 21800000,
        trees_count: 12,
        structures_count: 0,
        wells_count: 0,
        centroid: [75.7872, 26.9145],
        current_stage: "GROUND_SURVEY",
        fillColor: "#f59e0b",
        color: "#d97706",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },

    // --- Parcel 5: Khasra 208/B (Goneda Village) ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-005",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7935, 26.9175],
            [75.7965, 26.9175],
            [75.7965, 26.9200],
            [75.7935, 26.9200],
            [75.7935, 26.9175],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-005",
        ulpin: "RJ-08-JAI-208B-9189",
        khasra_number: "208/B",
        khata_number: "88",
        village_name: "Goneda",
        tehsil_name: "Kotputli",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 5.60,
        acquired_area_acres: 4.20,
        area_sqm: 22662.4,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "AWARD_ENQUIRY",
        status_label: "Sec 23 Award Passed",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Smt. Shanti Devi Gurjar (70%), Devendra Gurjar (30%)",
        owner_count: 2,
        circle_rate_sqm: 1450,
        assessed_compensation_inr: 64200000,
        trees_count: 26,
        structures_count: 2,
        wells_count: 2,
        centroid: [75.7950, 26.9188],
        current_stage: "SECTION_23",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },

    // --- Parcel 6: Khasra 209 (Goneda Village) ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-006",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7965, 26.9200],
            [75.7995, 26.9200],
            [75.7995, 26.9225],
            [75.7965, 26.9225],
            [75.7965, 26.9200],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-006",
        ulpin: "RJ-08-JAI-2090-9209",
        khasra_number: "209",
        khata_number: "92",
        village_name: "Goneda",
        tehsil_name: "Kotputli",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 4.80,
        acquired_area_acres: 4.80,
        area_sqm: 19424.9,
        land_type: "AGRICULTURAL_UNIRRIGATED",
        acquisition_status: "SECTION_19_DECLARED",
        status_label: "Sec 19 Declared",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Harish Chandra Saini",
        owner_count: 1,
        circle_rate_sqm: 1450,
        assessed_compensation_inr: 49800000,
        trees_count: 10,
        structures_count: 0,
        wells_count: 1,
        centroid: [75.7980, 26.9212],
        current_stage: "SECTION_19",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },

    // --- Parcel 7: Khasra 312/1 (Achrol Village) ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-007",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7835, 26.9095],
            [75.7860, 26.9095],
            [75.7860, 26.9115],
            [75.7835, 26.9115],
            [75.7835, 26.9095],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-007",
        ulpin: "RJ-08-JAI-3121-9097",
        khasra_number: "312/1",
        khata_number: "104",
        village_name: "Achrol",
        tehsil_name: "Amer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 3.20,
        acquired_area_acres: 3.20,
        area_sqm: 12949.9,
        land_type: "COMMERCIAL_CORRIDOR",
        acquisition_status: "POSSESSION_TAKEN",
        status_label: "Possession Handed Over",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Er. Mahendra Pratap Singh",
        owner_count: 1,
        circle_rate_sqm: 2400,
        assessed_compensation_inr: 54000000,
        trees_count: 2,
        structures_count: 1,
        wells_count: 0,
        centroid: [75.7847, 26.9105],
        current_stage: "SECTION_38",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },

    // --- Parcel 8: Khasra 312/2 (Achrol Village) ---
    {
      type: "Feature",
      id: "PCL-RJ-JAI-008",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7810, 26.9075],
            [75.7835, 26.9075],
            [75.7835, 26.9095],
            [75.7810, 26.9095],
            [75.7810, 26.9075],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-008",
        ulpin: "RJ-08-JAI-3122-9078",
        khasra_number: "312/2",
        khata_number: "105",
        village_name: "Achrol",
        tehsil_name: "Amer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 2.50,
        acquired_area_acres: 2.50,
        area_sqm: 10117.1,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "SECTION_11_NOTIFIED",
        status_label: "Sec 11 Notified",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Govind Narayan Saini",
        owner_count: 1,
        circle_rate_sqm: 1450,
        assessed_compensation_inr: 27000000,
        trees_count: 6,
        structures_count: 0,
        wells_count: 1,
        centroid: [75.7822, 26.9085],
        current_stage: "SECTION_11",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },
  ],
};

// -------------------------------------------------------------
// 2. WESTERN DEDICATED FREIGHT CORRIDOR (PRJ-DFCC-W03)
// -------------------------------------------------------------
export const GIS_DFCC_W03: GisGeoJsonFeatureCollection = {
  type: "FeatureCollection",
  metadata: {
    project_id: "PRJ-DFCC-W03",
    project_title: "Western Dedicated Freight Corridor (Kotputli - Phulera Feeder Link)",
    total_parcels: 6,
    parcel_count: 6,
    center: [26.9350, 75.8150],
    bounds: [[26.9250, 75.8050], [26.9450, 75.8250]],
    row_width_meters: 50,
    survey_datum: "WGS84 / EPSG:4326 PostGIS",
    epsg: "EPSG:4326",
  },
  features: [
    {
      type: "Feature",
      id: "PCL-DFCC-001",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.8080, 26.9300],
            [75.8120, 26.9300],
            [75.8120, 26.9330],
            [75.8080, 26.9330],
            [75.8080, 26.9300],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-DFCC-001",
        ulpin: "RJ-08-PHU-0841-9308",
        khasra_number: "84/1",
        khata_number: "33",
        village_name: "Phulera Rural",
        tehsil_name: "Phulera",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 6.20,
        acquired_area_acres: 6.20,
        area_sqm: 25090.5,
        land_type: "AGRICULTURAL_UNIRRIGATED",
        acquisition_status: "SECTION_19_DECLARED",
        status_label: "Sec 19 Declared",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Kishore Kumar Choudhary",
        owner_count: 2,
        circle_rate_sqm: 1100,
        assessed_compensation_inr: 52000000,
        trees_count: 15,
        structures_count: 0,
        wells_count: 1,
        centroid: [75.8100, 26.9315],
        current_stage: "SECTION_19",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },
    {
      type: "Feature",
      id: "PCL-DFCC-002",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.8120, 26.9330],
            [75.8160, 26.9330],
            [75.8160, 26.9360],
            [75.8120, 26.9360],
            [75.8120, 26.9330],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-DFCC-002",
        ulpin: "RJ-08-PHU-0842-9338",
        khasra_number: "84/2",
        khata_number: "33",
        village_name: "Phulera Rural",
        tehsil_name: "Phulera",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 5.80,
        acquired_area_acres: 5.80,
        area_sqm: 23471.8,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "ACQUIRED",
        status_label: "Acquired / Handed Over",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Gajendra Singh Rathore",
        owner_count: 1,
        circle_rate_sqm: 1100,
        assessed_compensation_inr: 48500000,
        trees_count: 8,
        structures_count: 0,
        wells_count: 1,
        centroid: [75.8140, 26.9345],
        current_stage: "SECTION_38",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },
    {
      type: "Feature",
      id: "PCL-DFCC-003",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.8160, 26.9360],
            [75.8200, 26.9360],
            [75.8200, 26.9390],
            [75.8160, 26.9390],
            [75.8160, 26.9360],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-DFCC-003",
        ulpin: "RJ-08-PHU-085A-9368",
        khasra_number: "85/A",
        khata_number: "41",
        village_name: "Phulera Rural",
        tehsil_name: "Phulera",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 4.50,
        acquired_area_acres: 4.50,
        area_sqm: 18210.8,
        land_type: "INDUSTRIAL_LOGISTICS",
        acquisition_status: "AWARD_ENQUIRY",
        status_label: "Sec 23 Award Pending",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Rajasthan State Industrial Corp",
        owner_count: 1,
        circle_rate_sqm: 1800,
        assessed_compensation_inr: 42000000,
        trees_count: 0,
        structures_count: 1,
        wells_count: 0,
        centroid: [75.8180, 26.9375],
        current_stage: "SECTION_23",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },
  ],
};

// -------------------------------------------------------------
// 3. JAIPUR METRO PHASE-2 (PRJ-METRO-PH2)
// Urban High-Density Transit Cadastre
// -------------------------------------------------------------
export const GIS_METRO_PH2: GisGeoJsonFeatureCollection = {
  type: "FeatureCollection",
  metadata: {
    project_id: "PRJ-METRO-PH2",
    project_title: "Jaipur Metro Phase-2 Corridor (Sitapura to Ambabari via Tonk Road)",
    total_parcels: 4,
    parcel_count: 4,
    center: [26.8500, 75.8100],
    bounds: [[26.8400, 75.8000], [26.8600, 75.8200]],
    row_width_meters: 30,
    survey_datum: "WGS84 / EPSG:4326 PostGIS",
    epsg: "EPSG:4326",
  },
  features: [
    {
      type: "Feature",
      id: "PCL-METRO-001",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.8050, 26.8480],
            [75.8080, 26.8480],
            [75.8080, 26.8505],
            [75.8050, 26.8505],
            [75.8050, 26.8480],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-METRO-001",
        ulpin: "RJ-08-JAI-512A-8488",
        khasra_number: "512/A",
        khata_number: "19",
        village_name: "Sitapura Industrial Area",
        tehsil_name: "Sanganer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 1.85,
        acquired_area_acres: 1.85,
        area_sqm: 7486.7,
        land_type: "COMMERCIAL_URBAN",
        acquisition_status: "DISPUTED",
        status_label: "Disputed / Commercial Stay",
        verification_status: "SURVEYED",
        is_disputed: true,
        dispute_reason: "High Court WP #1402/2026: Commercial traders association objecting to depot land acquisition.",
        owner_name: "Sitapura Industrial Traders Association",
        owner_count: 5,
        circle_rate_sqm: 5500,
        assessed_compensation_inr: 88000000,
        trees_count: 2,
        structures_count: 4,
        wells_count: 0,
        centroid: [75.8065, 26.8492],
        current_stage: "SECTION_15",
        fillColor: "#ef4444",
        color: "#b91c1c",
        fillOpacity: 0.7,
        weight: 2,
        layer_type: "PARCEL",
      },
    },
    {
      type: "Feature",
      id: "PCL-METRO-002",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.8080, 26.8505],
            [75.8110, 26.8505],
            [75.8110, 26.8530],
            [75.8080, 26.8530],
            [75.8080, 26.8505],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-METRO-002",
        ulpin: "RJ-08-JAI-512B-8508",
        khasra_number: "512/B",
        khata_number: "20",
        village_name: "Sitapura Industrial Area",
        tehsil_name: "Sanganer",
        district_name: "Jaipur",
        state_name: "Rajasthan",
        total_area_acres: 2.10,
        acquired_area_acres: 2.10,
        area_sqm: 8498.4,
        land_type: "COMMERCIAL_URBAN",
        acquisition_status: "SECTION_11_NOTIFIED",
        status_label: "Sec 11 Notified",
        verification_status: "VERIFIED",
        is_disputed: false,
        owner_name: "Rajasthan State Industrial Development and Investment Corp (RIICO)",
        owner_count: 1,
        circle_rate_sqm: 5500,
        assessed_compensation_inr: 96000000,
        trees_count: 0,
        structures_count: 2,
        wells_count: 0,
        centroid: [75.8095, 26.8517],
        current_stage: "SECTION_11",
        fillColor: "#10b981",
        color: "#059669",
        fillOpacity: 0.65,
        weight: 2,
        layer_type: "PARCEL",
      },
    },
  ],
};

// -------------------------------------------------------------
// Helper: Get Project GeoJSON by Project ID
// -------------------------------------------------------------
export function getGisGeoJsonByProjectId(projectId: string): GisGeoJsonFeatureCollection {
  if (projectId === "PRJ-DFCC-W03") return GIS_DFCC_W03;
  if (projectId === "PRJ-METRO-PH2") return GIS_METRO_PH2;
  return GIS_NH48_PKG4;
}
