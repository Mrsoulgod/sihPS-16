"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

export type NotificationCategory = "STATUTORY_ACTION" | "PROJECT_PROPOSAL" | "FIELD_SURVEY" | "COMPENSATION_PFMS" | "RR_ENTITLEMENT" | "RISK_ALERT";
export type NotificationSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  sourceAuthority: string;
  targetRole?: string;
  targetRoute: string;
  timestamp: string;
  isRead: boolean;
  projectCode?: string;
  projectName?: string;
  actionRequired?: string;
}

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<SystemNotification, "id" | "timestamp" | "isRead">) => void;
  forwardActionNotification: (
    sourceAuthority: string,
    targetRole: string,
    actionTitle: string,
    description: string,
    projectCode: string,
    targetRoute: string,
    category?: NotificationCategory
  ) => void;
  triggerDemoForwardAction: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const getDefaultNotificationsForRole = (roleId?: string, orgName?: string): SystemNotification[] => {
  const now = new Date();
  const getPastTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

  // Role: Implementing Agency
  if (roleId === "ROLE_PROJECT_AGENCY") {
    return [
      {
        id: "notif-agency-1",
        title: "Statutory Scrutiny Correction Required",
        message: "CALA Jaipur requested DPR alignment chainage revision (KM 142 to KM 148) due to canal buffer overlap.",
        category: "STATUTORY_ACTION",
        severity: "HIGH",
        sourceAuthority: "CALA Jaipur (District Magistrate)",
        targetRole: "ROLE_PROJECT_AGENCY",
        targetRoute: "/actions",
        timestamp: getPastTime(12),
        isRead: false,
        projectCode: "PRJ-NH48-PKG4",
        projectName: "NH-48 6-Laning & Bypass",
        actionRequired: "Update Section 3A alignment schedule and re-upload DPR Annexure IV.",
      },
      {
        id: "notif-agency-2",
        title: "Forest NOC Clearance Certificate Required",
        message: "Stage-1 In-Principle Forest Clearance for 12.4 Ha diversion along Kotputli forest division is awaiting upload.",
        category: "STATUTORY_ACTION",
        severity: "CRITICAL",
        sourceAuthority: "District Revenue Officer",
        targetRole: "ROLE_PROJECT_AGENCY",
        targetRoute: "/documents",
        timestamp: getPastTime(45),
        isRead: false,
        projectCode: "PRJ-NH48-PKG4",
        projectName: "NH-48 6-Laning & Bypass",
        actionRequired: "Submit signed Forest NOC clearance copy.",
      },
      {
        id: "notif-agency-3",
        title: "Section 38 Possession Handover Protocol Ready",
        message: "CALA office confirmed readiness of 24.5 Acres encumbrance-free land for Package 4 contractor mobilization.",
        category: "STATUTORY_ACTION",
        severity: "INFO",
        sourceAuthority: "Competent Authority for Land Acquisition (CALA)",
        targetRole: "ROLE_PROJECT_AGENCY",
        targetRoute: "/possession",
        timestamp: getPastTime(180),
        isRead: true,
        projectCode: "PRJ-NH48-PKG4",
        projectName: "NH-48 6-Laning & Bypass",
      },
      {
        id: "notif-agency-4",
        title: "Joint Demarcation Survey Schedule Fixed",
        message: "Field survey teams scheduled for boundary pillar pegging on Monday 09:00 AM.",
        category: "FIELD_SURVEY",
        severity: "MEDIUM",
        sourceAuthority: "Sub-Divisional Magistrate, Kotputli",
        targetRole: "ROLE_PROJECT_AGENCY",
        targetRoute: "/field/tasks",
        timestamp: getPastTime(360),
        isRead: true,
        projectCode: "PRJ-NH48-PKG4",
      },
    ];
  }

  // Role: District CALA / District Magistrate
  if (roleId === "ROLE_DISTRICT_CALA" || roleId === "ROLE_DISTRICT_MAGISTRATE") {
    return [
      {
        id: "notif-cala-1",
        title: "New Statutory Project Proposal Received",
        message: "NHAI Project Director submitted new 6-Laning project proposal (NH-48 Jaipur Bypass) for initial Section 3A / Sec 11 scrutiny.",
        category: "PROJECT_PROPOSAL",
        severity: "HIGH",
        sourceAuthority: "National Highways Authority of India (NHAI)",
        targetRole: "ROLE_DISTRICT_CALA",
        targetRoute: "/projects",
        timestamp: getPastTime(8),
        isRead: false,
        projectCode: "NHAI-RJ-JAI-2026-004",
        projectName: "NH-48 Western Ring Road Corridor",
        actionRequired: "Initiate statutory feasibility scrutiny and cadastral mapping check.",
      },
      {
        id: "notif-cala-2",
        title: "Cadastral Ground-Truthing Report Submitted",
        message: "Field Revenue Inspector completed ground verification for 18 disputed khasras in Sundarpura Village.",
        category: "FIELD_SURVEY",
        severity: "MEDIUM",
        sourceAuthority: "Field Revenue Inspector (Patwari Cell)",
        targetRole: "ROLE_DISTRICT_CALA",
        targetRoute: "/field/tasks",
        timestamp: getPastTime(28),
        isRead: false,
        projectCode: "PRJ-NH48-PKG4",
        projectName: "NH-48 6-Laning & Bypass",
        actionRequired: "Review geotagged parcel photos and sanction boundary declaration.",
      },
      {
        id: "notif-cala-3",
        title: "Section 15 Hearing Scheduled",
        message: "Public hearing for 4 objection petitions on valuation multiplier scheduled at Collectorate Court.",
        category: "STATUTORY_ACTION",
        severity: "HIGH",
        sourceAuthority: "Sub-Divisional Officer, Kotputli",
        targetRole: "ROLE_DISTRICT_CALA",
        targetRoute: "/workflow",
        timestamp: getPastTime(120),
        isRead: false,
        projectCode: "PRJ-NH48-PKG4",
      },
      {
        id: "notif-cala-4",
        title: "PFMS Compensation Batch Sanctioned",
        message: "Treasury escrow allocation of ₹42.50 Cr approved for Direct Benefit Transfer disbursement.",
        category: "COMPENSATION_PFMS",
        severity: "INFO",
        sourceAuthority: "State Finance Department",
        targetRole: "ROLE_DISTRICT_CALA",
        targetRoute: "/compensation",
        timestamp: getPastTime(320),
        isRead: true,
        projectCode: "PRJ-NH48-PKG4",
      },
    ];
  }

  // Role: Field Survey Officer
  if (roleId === "ROLE_FIELD_SURVEYOR" || roleId === "ROLE_REVENUE_INSPECTOR") {
    return [
      {
        id: "notif-field-1",
        title: "New Ground Truthing Task Assigned",
        message: "CALA Office assigned parcel verification task for 12 agriculture khasras in Pragpura Village.",
        category: "FIELD_SURVEY",
        severity: "HIGH",
        sourceAuthority: "CALA Jaipur (District Revenue Officer)",
        targetRole: "ROLE_FIELD_SURVEYOR",
        targetRoute: "/field/tasks",
        timestamp: getPastTime(15),
        isRead: false,
        projectCode: "PRJ-NH48-PKG4",
        actionRequired: "Complete mobile GIS polygon inspection with farmer biometric signatures.",
      },
      {
        id: "notif-field-2",
        title: "Boundary Pillar Pegging Protocol",
        message: "Coordination with NHAI engineering surveyors requested for KM 145 chainage marking.",
        category: "FIELD_SURVEY",
        severity: "MEDIUM",
        sourceAuthority: "SDM Kotputli",
        targetRole: "ROLE_FIELD_SURVEYOR",
        targetRoute: "/field/tasks",
        timestamp: getPastTime(90),
        isRead: false,
      },
    ];
  }

  // Role: Social Impact & R&R Officer
  if (roleId === "ROLE_SOCIAL_IMPACT_OFFICER" || roleId === "ROLE_RR_COMMISSIONER") {
    return [
      {
        id: "notif-social-1",
        title: "New R&R Entitlement Claim Filed",
        message: "Socio-economic census report submitted for 48 Project Affected Families in Sundarpura & Pragpura.",
        category: "RR_ENTITLEMENT",
        severity: "HIGH",
        sourceAuthority: "Social Impact Assessment (SIA) Agency",
        targetRole: "ROLE_SOCIAL_IMPACT_OFFICER",
        targetRoute: "/r-and-r",
        timestamp: getPastTime(20),
        isRead: false,
        projectCode: "PRJ-NH48-PKG4",
        actionRequired: "Review Second Schedule housing & skill grant eligibility register.",
      },
      {
        id: "notif-social-2",
        title: "Resettlement Colony Plot Allotment Ready",
        message: "District Collector approved master layout plan for Kotputli Model Resettlement Colony.",
        category: "RR_ENTITLEMENT",
        severity: "INFO",
        sourceAuthority: "District Collectorate",
        targetRole: "ROLE_SOCIAL_IMPACT_OFFICER",
        targetRoute: "/r-and-r",
        timestamp: getPastTime(150),
        isRead: true,
      },
    ];
  }

  // Role: State Revenue Secretary
  if (roleId === "ROLE_STATE_REVENUE_SECRETARY" || roleId === "ROLE_STATE_LAND_COMMISSIONER") {
    return [
      {
        id: "notif-state-1",
        title: "Statewide Gazette Section 19 Notification",
        message: "Jaipur District CALA forwarded finalized Section 19 declaration for State Gazette publication.",
        category: "STATUTORY_ACTION",
        severity: "HIGH",
        sourceAuthority: "District Magistrate, Jaipur",
        targetRole: "ROLE_STATE_REVENUE_SECRETARY",
        targetRoute: "/dashboard",
        timestamp: getPastTime(10),
        isRead: false,
        projectCode: "PRJ-NH48-PKG4",
        actionRequired: "Digital signature authorization for e-Gazette dispatch.",
      },
      {
        id: "notif-state-2",
        title: "Disbursement Milestone Achieved",
        message: "Statewide PFMS compensation direct transfers passed ₹1,200 Crore milestone across 4 active corridors.",
        category: "COMPENSATION_PFMS",
        severity: "INFO",
        sourceAuthority: "State PFMS Nodal Cell",
        targetRole: "ROLE_STATE_REVENUE_SECRETARY",
        targetRoute: "/reports",
        timestamp: getPastTime(80),
        isRead: false,
      },
      {
        id: "notif-state-3",
        title: "High Risk Corridor Warning: Forest NOC Delay",
        message: "Alwar-Jaipur link flagged for 45-day statutory SLA breach regarding Stage-2 forest diversion.",
        category: "RISK_ALERT",
        severity: "CRITICAL",
        sourceAuthority: "State Land Governance Monitoring Cell",
        targetRole: "ROLE_STATE_REVENUE_SECRETARY",
        targetRoute: "/analytics",
        timestamp: getPastTime(210),
        isRead: true,
      },
    ];
  }

  // Default: Central Command / Multi-Agency Admin
  return [
    {
      id: "notif-central-1",
      title: "PM-GatiShakti High Impact Milestone",
      message: "6 Mega-Corridors entered Section 19 declaration phase with 88.4% cadastral ground-truthing complete.",
      category: "PROJECT_PROPOSAL",
      severity: "INFO",
      sourceAuthority: "National Project Coordination Unit",
      targetRoute: "/overview",
      timestamp: getPastTime(5),
      isRead: false,
      projectCode: "NAT-CORRIDOR-2026",
    },
    {
      id: "notif-central-2",
      title: "New Project Proposal Forwarded to CALA Jaipur",
      message: "NHAI submitted proposal for NH-48 6-Laning & Jaipur Western Ring Road Connector (56.5 KM).",
      category: "PROJECT_PROPOSAL",
      severity: "HIGH",
      sourceAuthority: "National Highways Authority of India (NHAI)",
      targetRoute: "/projects",
      timestamp: getPastTime(18),
      isRead: false,
      projectCode: "NHAI-RJ-JAI-2026-004",
    },
    {
      id: "notif-central-3",
      title: "Direct Benefit Transfer Batch Authorized",
      message: "PFMS Direct Benefit Transfer batch of ₹42.50 Cr successfully verified across 4 revenue tehsils.",
      category: "COMPENSATION_PFMS",
      severity: "MEDIUM",
      sourceAuthority: "Central Treasury & PFMS Gateway",
      targetRoute: "/compensation",
      timestamp: getPastTime(90),
      isRead: true,
    },
  ];
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const safeUser = user && typeof user === "object" && !Array.isArray(user) ? user : null;
  const roleId = safeUser?.role_id;
  const orgName = safeUser?.organization;
  const districtId = safeUser?.district_id;

  // Sync / Load Notifications based on user persona
  useEffect(() => {
    const storageKey = `nlams_notifications_${roleId || "ANONYMOUS"}_${districtId || "ALL"}`;
    const stored = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          return;
        }
      } catch (e) {
        console.error("Error parsing stored notifications", e);
      }
    }

    // Default Seed
    const initial = getDefaultNotificationsForRole(roleId, orgName);
    setNotifications(initial);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  }, [roleId, districtId, orgName]);

  // Persist helper
  const persistNotifications = (updated: SystemNotification[]) => {
    setNotifications(updated);
    if (typeof window !== "undefined") {
      const storageKey = `nlams_notifications_${roleId || "ANONYMOUS"}_${districtId || "ALL"}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    persistNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    persistNotifications(updated);
  };

  const clearNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    persistNotifications(updated);
  };

  const clearAll = () => {
    persistNotifications([]);
  };

  const addNotification = (notif: Omit<SystemNotification, "id" | "timestamp" | "isRead">) => {
    const newItem: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    persistNotifications([newItem, ...notifications]);
  };

  const forwardActionNotification = (
    sourceAuthority: string,
    targetRole: string,
    actionTitle: string,
    description: string,
    projectCode: string,
    targetRoute: string,
    category: NotificationCategory = "STATUTORY_ACTION"
  ) => {
    addNotification({
      title: `Forwarded: ${actionTitle}`,
      message: `${description} [Dispatched by: ${sourceAuthority}]`,
      category,
      severity: "HIGH",
      sourceAuthority,
      targetRole,
      targetRoute,
      projectCode,
    });
  };

  const triggerDemoForwardAction = () => {
    const sampleActions = [
      {
        title: "Statutory Proposal Forwarded to CALA Jaipur",
        message: "NHAI PIU Jaipur dispatched proposal PRJ-NH48-PKG5 for Section 3A scrutiny and village gazette schedule.",
        source: "Er. Vikram Singh (NHAI Jaipur)",
        route: "/projects",
        code: "PRJ-NH48-PKG5",
        cat: "PROJECT_PROPOSAL" as NotificationCategory,
      },
      {
        title: "Field Demarcation Verification Completed",
        message: "Revenue Inspector forwarded geotagged drone survey & khasra map verification for CALA sign-off.",
        source: "Field Surveyor Cell (Kotputli)",
        route: "/field/tasks",
        code: "PRJ-NH48-PKG4",
        cat: "FIELD_SURVEY" as NotificationCategory,
      },
      {
        title: "PFMS Direct Benefit Transfer Batch Dispatched",
        message: "Direct transfer of ₹18.75 Cr forwarded to Bank of Baroda PFMS Gateway for 64 verified landowners.",
        source: "District Treasury Officer",
        route: "/compensation",
        code: "PRJ-NH48-PKG4",
        cat: "COMPENSATION_PFMS" as NotificationCategory,
      },
    ];

    const pick = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    addNotification({
      title: pick.title,
      message: pick.message,
      category: pick.cat,
      severity: "HIGH",
      sourceAuthority: pick.source,
      targetRoute: pick.route,
      projectCode: pick.code,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        addNotification,
        forwardActionNotification,
        triggerDemoForwardAction,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
