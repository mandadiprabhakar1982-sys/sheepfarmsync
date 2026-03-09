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
    flock: "Flock",
    buy: "Buy",
    health: "Health",
    feed: "Feed",
    labor: "Labor",
    sales: "Sales",
    expenses: "Expenses",
    analytics: "Analytics",
    overview: "Overview",
    marketplace: "Marketplace",
    reports: "Reports",
    calculator: "Calculator",
    install: "Install App",
    ledger: "Monthly Ledger",
    liabilities: "Liabilities",
    mortality: "Loss Log",
    intelligence: "AI Intelligence",
    
    // Suite Labels
    private_suite: "Private Project Assets",
    public_suite: "Public Project Assets",
    ops_suite: "Operations & Staff",
    ecosystem: "Ecosystem",
    
    // UI
    precision: "Precision Management",
    syncing: "Syncing Farm Data",
    identity: "Identity Audit",
    logout: "Terminate Session",
    settings: "Settings",
    system_name: "Farm Management System",
    security: "Security & Privacy",
    privacy: "Privacy Guard",
    database_project: "Core Database Project",
    stealth_mode: "Stealth Deployment",
    
    // Headers
    farm_overview: "Farm Overview",
    flock_intel: "Flock Intelligence",
    nutrition_engine: "Nutrition Engine",
    community_market: "Community Marketplace",
    liability_portfolio: "Liability Portfolio",
    monthly_balance: "Monthly Balance Sheet",
    dashboard_hero: "SYNC PRO",
    dashboard_desc: "PRECISION MANAGEMENT SUITE",
    
    // Stats
    live_sheep: "LIVE SHEEP",
    tracked: "INDIVIDUALLY TRACKED",
    mortalities: "TOTAL MORTALITIES",
    revenue: "TOTAL REVENUE",
    cost: "TOTAL COST",
    receivables: "RECEIVABLES",
    payables: "PAYABLES",
    feed_usage: "FEED USAGE",
    labor_costs: "LABOR COSTS",
    medical: "MEDICAL",
    misc: "MISC.",
    inventory_status: "Inventory & Flock Status",
    financial_summary: "Financial Summary",
    operational_breakdown: "Operational Breakdown",
  },
  te: {
    // Nav
    home: "హోమ్",
    flock: "మంద",
    buy: "కొనుగోలు",
    health: "ఆరోగ్యం",
    feed: "మేత",
    labor: "కార్మికులు",
    sales: "అమ్మకాలు",
    expenses: "ఖర్చులు",
    analytics: "విశ్లేషణ",
    overview: "అవలోకనం",
    marketplace: "మార్కెట్ ప్లేస్",
    reports: "నివేదికలు",
    calculator: "క్యాలిక్యులేటర్",
    install: "యాప్ ఇన్‌స్టాల్",
    ledger: "నెలవారీ లెడ్జర్",
    liabilities: "అప్పులు",
    mortality: "మరణాల జాబితా",
    intelligence: "AI నివేదికలు",

    // Suite Labels
    private_suite: "ప్రైవేట్ ప్రాజెక్ట్ ఆస్తులు",
    public_suite: "పబ్లిక్ ప్రాజెక్ట్ ఆస్తులు",
    ops_suite: "ఆపరేషన్స్ & స్టాఫ్",
    ecosystem: "ఎకోసిస్టమ్",

    // UI
    precision: "ఖచ్చితమైన నిర్వహణ",
    syncing: "ఫాం డేటా సింక్ అవుతోంది",
    identity: "గుర్తింపు ఆడిట్",
    logout: "సెషన్ ముగించు",
    settings: "సెట్టింగులు",
    system_name: "ఫాం మేనేజ్‌మెంట్ సిస్టమ్",
    security: "భద్రత మరియు గోప్యత",
    privacy: "గోప్యత రక్షణ",
    database_project: "కోర్ డేటాబేస్ ప్రాజెక్ట్",
    stealth_mode: "స్టెల్త్ డిప్లాయ్‌మెంట్",

    // Headers
    farm_overview: "ఫాం అవలోకనం",
    flock_intel: "మంద ఇంటెలిజెన్స్",
    nutrition_engine: "పోషకాహార ఇంజిన్",
    community_market: "కమ్యూనిటీ మార్కెట్ ప్లేస్",
    liability_portfolio: "అప్పుల పోర్ట్‌ఫోలియో",
    monthly_balance: "నెలవారీ బ్యాలెన్స్ షీట్",
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
