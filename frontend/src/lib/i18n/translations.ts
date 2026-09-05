export type Language = "en" | "hi";

export interface TranslationDict {
  portalTitle: string;
  portalSubtitle: string;
  nationalHeader: string;
  governmentOfIndia: string;
  login: string;
  logout: string;
  dashboard: string;
  projects: string;
  parcels: string;
  compensation: string;
  possession: string;
  randr: string;
  analytics: string;
  integrations: string;
  masterData: string;
  documents: string;
  fieldSurvey: string;
  reports: string;
  riskIntelligence: string;
  switchRole: string;
  activeRole: string;
  searchPlaceholder: string;
  refresh: string;
  exportPdf: string;
  exportExcel: string;
  status: string;
  action: string;
  viewDetails: string;
  submit: string;
  cancel: string;
  totalProjects: string;
  landAcquired: string;
  compensationDisbursed: string;
  affectedFamilies: string;
  rfctlarrCompliance: string;
  prototypeNotice: string;
  statutoryAccess: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    portalTitle: "NLAMS",
    portalSubtitle: "National Land Acquisition & Management System",
    nationalHeader: "Government of India | Ministry of Road Transport & Highways",
    governmentOfIndia: "Government of India",
    login: "Official Sign In",
    logout: "Sign Out",
    dashboard: "National Dashboard",
    projects: "Project Lifecycle",
    parcels: "Cadastral Parcels",
    compensation: "Compensation & Awards",
    possession: "Land Possession",
    randr: "R&R Schemes",
    analytics: "Analytics & GIS",
    integrations: "Integration Gateway",
    masterData: "Master Taxonomy",
    documents: "Document Vault",
    fieldSurvey: "Field Survey App",
    reports: "MIS Reports",
    riskIntelligence: "Predictive Risk AI",
    switchRole: "Switch Role Context",
    activeRole: "Active Role",
    searchPlaceholder: "Search by project code, khasra number, district, or owner...",
    refresh: "Refresh Telemetry",
    exportPdf: "Export Statutory PDF",
    exportExcel: "Export Dataset (.XLSX)",
    status: "Status",
    action: "Action",
    viewDetails: "View 360° Record",
    submit: "Submit Verification",
    cancel: "Cancel",
    totalProjects: "Total Monitored Projects",
    landAcquired: "Total Land Acquired (Acres)",
    compensationDisbursed: "Direct DBT Disbursed",
    affectedFamilies: "Rehabilitated Families",
    rfctlarrCompliance: "RFCTLARR 2013 Statutory Compliance",
    prototypeNotice: "Demonstration & Prototype Sandbox Layer",
    statutoryAccess: "Role-Based Statutory Access",
  },
  hi: {
    portalTitle: "एन.एल.ए.एम.एस.",
    portalSubtitle: "राष्ट्रीय भूमि अधिग्रहण एवं प्रबंधन प्रणाली",
    nationalHeader: "भारत सरकार | सड़क परिवहन एवं राजमार्ग मंत्रालय",
    governmentOfIndia: "भारत सरकार",
    login: "आधिकारिक प्रवेश",
    logout: "लॉग आउट",
    dashboard: "राष्ट्रीय डैशबोर्ड",
    projects: "परियोजना जीवनचक्र",
    parcels: "भू-अभिलेख एवं खसरा",
    compensation: "मुआवजा एवं अधिनिर्णय",
    possession: "भूमि कब्ज़ा स्थिति",
    randr: "पुनर्वास एवं पुनर्व्यवस्थापन",
    analytics: "विश्लेषिकी एवं जी.आई.एस.",
    integrations: "एकीकरण गेटवे (सैंडबॉक्स)",
    masterData: "मानक मास्टर डेटा",
    documents: "दस्तावेज़ संस्करण कक्ष",
    fieldSurvey: "क्षेत्रीय सर्वेक्षण पोर्टल",
    reports: "एम.आई.एस. रिपोर्ट",
    riskIntelligence: "जोखिम पूर्वानुमान प्रणाली",
    switchRole: "भूमिका संदर्भ बदलें",
    activeRole: "सक्रिय भूमिका",
    searchPlaceholder: "परियोजना कोड, खसरा संख्या, जिला या भूमि स्वामी से खोजें...",
    refresh: "डेटा ताज़ा करें",
    exportPdf: "वैधानिक पीडीएफ डाउनलोड",
    exportExcel: "एक्सेल डेटा (.XLSX)",
    status: "स्थिति",
    action: "कार्रवाई",
    viewDetails: "विवरण देखें",
    submit: "सत्यापन सबमिट करें",
    cancel: "रद्द करें",
    totalProjects: "कुल निगरानी परियोजनाएं",
    landAcquired: "कुल अधिग्रहीत भूमि (एकड़)",
    compensationDisbursed: "प्रत्यक्ष डी.बी.टी. संवितरण",
    affectedFamilies: "पुनर्वासित प्रभावित परिवार",
    rfctlarrCompliance: "आर.एफ.सी.टी.एल.ए.आर.आर. 2013 वैधानिक अनुपालन",
    prototypeNotice: "प्रोटोटाइप एवं सैंडबॉक्स इंटरऑपरेबिलिटी लेयर",
    statutoryAccess: "भूमिका-आधारित वैधानिक अभिगम",
  },
};
