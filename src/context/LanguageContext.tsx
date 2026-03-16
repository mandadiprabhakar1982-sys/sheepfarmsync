'use client';
/**
 * @fileOverview Language context for English and Telugu support.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Nav
    home: "Home",
    flock: "Sheep List",
    buy: "Buying",
    health: "Medical",
    feed: "Fodder",
    labor: "Labour",
    sales: "Buying & Selling",
    expenses: "Expenses",
    analytics: "Analytics",
    overview: "Dashboard",
    marketplace: "Market",
    reports: "Reports",
    calculator: "Calculator",
    install: "Install App",
    ledger: "Daily Ledger",
    liabilities: "Debt & Loans",
    mortality: "Death Log",
    intelligence: "AI Reports",
    
    // UI
    precision: "Precision Management",
    syncing: "Syncing Farm Data",
    identity: "Identity Audit",
    logout: "Logout",
    settings: "Settings",
    system_name: "Farm Management System",
    security: "Security & Privacy",
    privacy: "Privacy Guard",
    stealth_mode: "Stealth Deployment",
    
    // Headers
    farm_overview: "Dashboard",
    flock_intel: "Flock Intelligence",
    nutrition_engine: "Nutrition Engine",
    community_market: "Community Market",
    liability_portfolio: "Debt & Loan Portfolio",
    monthly_balance: "Finance Ledger",
    dashboard_hero: "SYNC PRO",
    dashboard_desc: "PRECISION MANAGEMENT SUITE",
    
    // Stats
    live_sheep: "LIVE SHEEP",
    tracked: "TRACKED",
    mortalities: "TOTAL DEATHS",
    revenue: "TOTAL REVENUE",
    cost: "TOTAL COST",
    receivables: "RECEIVABLES",
    payables: "PAYABLES",
    feed_usage: "FODDER USAGE",
    labor_costs: "LABOUR COSTS",
    medical: "MEDICAL",
    misc: "EXPENSES",
    inventory_status: "Sheep Inventory Status",
    financial_summary: "Financial Summary",
    operational_breakdown: "Operational Breakdown",
    avg_weight: "AVG WEIGHT",
    daily_feed_qty: "DAILY FEED (KG)",
  },
  te: {
    // Nav
    home: "హోమ్",
    flock: "మంద",
    buy: "కొనుగోలు",
    health: "ఆరోగ్యం",
    feed: "మేత",
    labor: "కార్మికులు",
    sales: "కొనుగోళ్లు & అమ్మకాలు",
    expenses: "ఖర్చులు",
    analytics: "విశ్లేషణ",
    overview: "డ్యాష్‌బోర్డ్",
    marketplace: "మార్కెట్ ప్లేస్",
    reports: "నివేదికలు",
    calculator: "క్యాలిక్యులేటర్",
    install: "యాప్ ఇన్‌స్టాల్",
    ledger: "ఫాం లెడ్జర్",
    liabilities: "అప్పులు",
    mortality: "మరణాల జాబితా",
    intelligence: "AI నివేదికలు",

    // UI
    precision: "ఖచ్చితమైన నిర్వహణ",
    syncing: "ఫాం డేటా సింక్ అవుతోంది",
    identity: "గుర్తింపు ఆడిట్",
    logout: "సెషన్ ముగించు",
    settings: "సెట్టింగులు",
    system_name: "ఫాం మేనేజ్‌మెంట్ సిస్టమ్",
    security: "భద్రత మరియు గోప్యత",
    privacy: "గోప్యత రక్షణ",
    stealth_mode: "స్టెల్త్ డిప్లాయ్‌మెంట్",

    // Headers
    farm_overview: "డ్యాష్‌బోర్డ్",
    flock_intel: "మంద ఇంటెలిజెన్స్",
    nutrition_engine: "పోషకాహార ఇంజిన్",
    community_market: "కమ్యూనిటీ మార్కెట్ ప్లేస్",
    liability_portfolio: "అప్పుల పోర్ట్‌ఫోలియో",
    monthly_balance: "ఫాం లెడ్జర్",
    dashboard_hero: "షీప్ సింక్ ప్రో",
    dashboard_desc: "నిర్వహణ సాఫ్ట్‌వేర్",

    // Stats
    live_sheep: "ప్రస్తుత గొర్రెలు",
    tracked: "ట్రాక్ చేయబడినవి",
    mortalities: "మరణాలు",
    revenue: "మొత్తం ఆదాయం",
    cost: "మొత్తం ఖర్చు",
    receivables: "రావాల్సినవి",
    payables: "చెల్లించాల్సినవి",
    feed_usage: "మేత ఖర్చు",
    labor_costs: "కార్మికుల ఖర్చు",
    medical: "వైద్య ఖర్చులు",
    misc: "ఇతర ఖర్చులు",
    inventory_status: "స్టాక్ మరియు మంద స్థితి",
    financial_summary: "ఆర్థిక సారాంశం",
    operational_breakdown: "నిర్వహణ ఖర్చులు",
    avg_weight: "సగటు బరువు",
    daily_feed_qty: "రోజువారీ మేత (kg)",
  }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'te')) {
      setLanguage(savedLang);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string) => {
    const langSet = translations[language] || translations['en'];
    return langSet[key as keyof typeof translations['en']] || key;
  };

  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};