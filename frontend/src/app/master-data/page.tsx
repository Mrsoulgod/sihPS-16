"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  MapPin,
  Layers,
  Scale,
  RefreshCw,
  Calculator,
  AlertTriangle,
  FolderTree,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguage } from "@/lib/context/LanguageContext";

interface MasterGeographicItem {
  id: string;
  name: string;
  code?: string | null;
  level: string; // STATE, DISTRICT, TEHSIL, VILLAGE
  parent_id?: string | null;
  lgd_code?: string | null;
  rural_factor?: number | null;
}

interface MasterTaxonomyCategory {
  category_id: string;
  category_name: string;
  description: string;
  values: {
    code: string;
    label?: string;
    name?: string;
    type?: string;
    category?: string;
  }[];
}

interface StatutoryParams {
  act_name?: string;
  solatium_multiplier_percent?: number;
  solatium_percentage?: number;
  statutory_additional_interest_percent?: number;
  statutory_interest_rate_per_annum?: number;
  sla_limits_days?: Record<string, number>;
  risk_scoring_weights?: Record<string, number>;
  risk_weights_distribution?: Record<string, number>;
  rural_multiplier_range?: { min: number; max: number };
  section_15_objection_window_days?: number;
  section_25_statutory_lapse_months?: number;
  urgency_clause_deposit_percent?: number;
}

const DEFAULT_SLA_LIMITS: Record<string, number> = {
  "Section 11 Preliminary Notification": 30,
  "Section 15 Hearing Objections": 60,
  "Section 19 Declaration of Acquisition": 90,
  "Section 23/27 Award Enquiry & Determination": 120,
  "Section 25 Statutory Award Finalization": 365,
  "Section 38 Taking Possession & Handover": 60,
};

const DEFAULT_RISK_WEIGHTS: Record<string, number> = {
  workflow_delay: 0.20,
  parcel_verification: 0.20,
  compensation_financial: 0.25,
  disputes_objections: 0.15,
  randr_possession_lag: 0.20,
};

export default function MasterDataPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"parameters" | "geography" | "taxonomy">("parameters");
  const [geography, setGeography] = useState<MasterGeographicItem[]>([]);
  const [taxonomy, setTaxonomy] = useState<MasterTaxonomyCategory[]>([]);
  const [statutoryParams, setStatutoryParams] = useState<StatutoryParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMasterData = async () => {
    try {
      setIsLoading(true);
      const [geoRes, taxRes, paramRes] = await Promise.all([
        apiClient<MasterGeographicItem[]>("/api/v1/master-data/geography"),
        apiClient<MasterTaxonomyCategory[]>("/api/v1/master-data/taxonomy"),
        apiClient<StatutoryParams>("/api/v1/master-data/statutory-parameters"),
      ]);
      setGeography(Array.isArray(geoRes.data) ? geoRes.data : []);
      setTaxonomy(Array.isArray(taxRes.data) ? taxRes.data : []);
      setStatutoryParams(paramRes.data || null);
    } catch (err) {
      console.error("Failed to load master data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const solatium = statutoryParams?.solatium_percentage ?? statutoryParams?.solatium_multiplier_percent ?? 100;
  const interest = statutoryParams?.statutory_interest_rate_per_annum ?? statutoryParams?.statutory_additional_interest_percent ?? 12;
  const slaLimits = statutoryParams?.sla_limits_days && Object.keys(statutoryParams.sla_limits_days).length > 0
    ? statutoryParams.sla_limits_days
    : DEFAULT_SLA_LIMITS;
  const riskWeights = statutoryParams?.risk_scoring_weights && Object.keys(statutoryParams.risk_scoring_weights).length > 0
    ? statutoryParams.risk_scoring_weights
    : DEFAULT_RISK_WEIGHTS;

  // Group geography flat items for clean hierarchical presentation
  const states = geography.filter((g) => g.level === "STATE");
  const districts = geography.filter((g) => g.level === "DISTRICT");
  const tehsils = geography.filter((g) => g.level === "TEHSIL");
  const villages = geography.filter((g) => g.level === "VILLAGE");

  return (
    <div className="space-y-6 pb-12">
      {/* Statutory Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Master Data & Statutory Taxonomy
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  Standardized RFCTLARR Parameters, Administrative Hierarchy & Lifecycle Codification
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchMasterData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold shadow-xs hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            {t.refresh}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("parameters")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === "parameters"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calculator className="h-4 w-4" />
            Statutory RFCTLARR Parameters
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("geography")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === "geography"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Administrative Geography ({geography.length} Entities)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("taxonomy")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === "taxonomy"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Lifecycle & Entitlements Taxonomy ({taxonomy.length} Categories)
          </button>
        </div>
      </div>

      {/* Tab 1: Statutory Parameters */}
      {activeTab === "parameters" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Statutory Financial Formula Constants */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-600" />
              RFCTLARR 2013 Compensation Math Parameters
            </h2>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-border bg-slate-50/80 p-4">
                <span className="text-xs font-medium text-muted-foreground">Section 30(1) Solatium</span>
                <p className="mt-1 text-2xl font-black text-emerald-700">
                  +{solatium}%
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  100% statutory solatium on basic market value + assets
                </p>
              </div>

              <div className="rounded-lg border border-border bg-slate-50/80 p-4">
                <span className="text-xs font-medium text-muted-foreground">Section 30(3) Interest</span>
                <p className="mt-1 text-2xl font-black text-primary">
                  {interest}% p.a.
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Accrued from Sec 11 notification date to award date
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 text-xs space-y-2">
              <h4 className="font-bold text-slate-900">Rural Multiplier Scale (Section 26)</h4>
              <p className="text-slate-600">
                • <strong>Urban Areas (0–10 km):</strong> Multiplier factor = 1.00x<br />
                • <strong>Rural Proximity (10–30 km):</strong> Multiplier factor = 1.25x<br />
                • <strong>Remote Rural (&gt;30 km):</strong> Multiplier factor = 1.50x to 2.00x
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-border/70 p-3 bg-slate-50">
                <span className="text-muted-foreground">Section 15 Objection Window</span>
                <p className="font-bold text-slate-900 mt-1">60 Calendar Days</p>
              </div>
              <div className="rounded border border-border/70 p-3 bg-slate-50">
                <span className="text-muted-foreground">Section 25 Award Deadline</span>
                <p className="font-bold text-slate-900 mt-1">12 Months (Statutory Lapse)</p>
              </div>
            </div>
          </div>

          {/* Statutory Stage SLA Limits & Risk Weights */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Statutory Stage SLA Limits (Days)
            </h2>

            <div className="divide-y divide-border/60 text-xs">
              {Object.entries(slaLimits).map(([stage, days]) => (
                <div key={stage} className="py-2.5 flex items-center justify-between">
                  <span className="font-mono text-slate-700">{stage}</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1 font-bold text-slate-900">
                    {days} Days Max
                  </span>
                </div>
              ))}
            </div>

            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground pt-2">
              Predictive Risk Scoring Weights
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(riskWeights).map(([factor, weight]) => {
                const pct = weight <= 1 ? (weight * 100).toFixed(0) : weight.toFixed(0);
                return (
                  <div key={factor} className="rounded border border-border/70 p-2 flex justify-between bg-slate-50/50">
                    <span className="capitalize text-slate-600">{factor.replace(/_/g, " ")}</span>
                    <span className="font-bold text-slate-900">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Geography Hierarchy */}
      {activeTab === "geography" && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-emerald-700" />
              Standardized Administrative Hierarchy (LGD Codified)
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="rounded bg-emerald-50 px-2.5 py-1 text-emerald-800 font-bold border border-emerald-200">
                {states.length} States
              </span>
              <span className="rounded bg-blue-50 px-2.5 py-1 text-blue-800 font-bold border border-blue-200">
                {districts.length} Districts
              </span>
              <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-800 font-bold">
                {tehsils.length} Tehsils
              </span>
              <span className="rounded bg-amber-50 px-2.5 py-1 text-amber-800 font-bold border border-amber-200">
                {villages.length} Villages
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {states.map((st) => {
              const stateDistricts = districts.filter((d) => d.parent_id === st.id);
              return (
                <div key={st.id} className="rounded-lg border border-border p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      <span>{st.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">({st.code || st.id})</span>
                    </div>
                    <span className="text-xs text-emerald-700 font-medium">
                      {stateDistricts.length} Assigned Districts
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stateDistricts.map((dst) => {
                      const districtTehsils = tehsils.filter((t) => t.parent_id === dst.id);
                      return (
                        <div key={dst.id} className="rounded border border-border bg-white p-3 text-xs">
                          <div className="font-bold text-primary flex justify-between">
                            <span>{dst.name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {dst.lgd_code ? `LGD: ${dst.lgd_code}` : dst.id}
                            </span>
                          </div>
                          <div className="mt-2 text-slate-600 space-y-1">
                            {districtTehsils.length > 0 ? (
                              districtTehsils.map((teh) => {
                                const tehsilVillages = villages.filter((v) => v.parent_id === teh.id);
                                return (
                                  <div key={teh.id} className="flex justify-between text-[11px] border-t border-slate-100 pt-1">
                                    <span>• Tehsil {teh.name}</span>
                                    <span className="text-muted-foreground">{tehsilVillages.length} Villages</span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">No sub-divisions mapped</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Taxonomy */}
      {activeTab === "taxonomy" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {taxonomy.map((cat) => (
            <div key={cat.category_id} className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  {cat.category_name}
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {cat.category_id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
              <div className="divide-y divide-border/60 text-xs max-h-72 overflow-y-auto pr-1">
                {cat.values?.map((val, idx) => (
                  <div key={val.code || idx} className="py-2 flex items-center justify-between">
                    <span className="font-mono text-slate-700">{val.code}</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {val.label || val.name || val.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

