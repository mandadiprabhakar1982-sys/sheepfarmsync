'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share, PlusSquare, Smartphone, ChevronRight, MoreVertical, Download, ShieldCheck, Fingerprint, Globe, Key } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-4xl">
      <PageHeader
        title={t('install')}
        description="Optimize your SYNC PRO experience across all devices."
      />

      <Tabs defaultValue="android" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-10 p-1.5 bg-neutral-100 rounded-2xl h-14">
          <TabsTrigger value="android" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Android</TabsTrigger>
          <TabsTrigger value="ios" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">iPhone / iPad</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <ShieldCheck className="h-3 w-3 mr-2" /> {t('security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="android">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-neutral-900 text-white p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-emerald-400" />
                For Android (Chrome)
              </CardTitle>
              <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Install SYNC PRO via Google Chrome</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {[
                { step: 1, title: "Open in Chrome", desc: "View this dashboard directly in the Chrome browser app." },
                { step: 2, title: "Menu Settings", desc: "Tap the three-dot menu icon in the top right corner." },
                { step: 3, title: "Install App", desc: "Select 'Install app' or 'Add to Home screen' from the menu." },
                { step: 4, title: "Finalize", desc: "Confirm the installation. SYNC PRO is now native on your device." }
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-emerald-400 font-black text-sm shadow-lg">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-neutral-900">{item.title}</p>
                    <p className="text-xs font-bold text-muted-foreground/70 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ios">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-blue-600 text-white p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-white" />
                For iOS (Safari)
              </CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Install SYNC PRO via Apple Safari</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {[
                { step: 1, title: "Open in Safari", desc: "Launch Safari and visit your SYNC PRO dashboard URL." },
                { step: 2, title: "Share Action", desc: "Tap the 'Share' icon (square with upward arrow) at the bottom." },
                { step: 3, title: "Home Screen", desc: "Scroll down and select 'Add to Home Screen'." },
                { step: 4, title: "Confirm", desc: "Tap 'Add' in the top right. The icon will appear on your Home Screen." }
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-neutral-900">{item.title}</p>
                    <p className="text-xs font-bold text-muted-foreground/70 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-neutral-900 text-white">
              <CardHeader className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  <CardTitle className="text-xl font-black tracking-tight">{t('stealth_mode')}</CardTitle>
                </div>
                <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enterprise Multi-Project Privacy Strategy</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-white/80 leading-relaxed">
                    To hide your SYNC PRO instance from other users on a shared network or device registry, you can deploy the UI code to a separate **Private Project**.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Project A (Public Core)</h4>
                    </div>
                    <p className="text-[11px] font-medium text-white/60">
                      This project hosts your primary database and user list. This is where your farm data lives securely.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Project B (Private UI)</h4>
                    </div>
                    <p className="text-[11px] font-medium text-white/60">
                      Create a second project where only you are an owner. Host the SYNC PRO code here to generate a "hidden" app icon.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Key className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-tight">The Precision Link</span>
                  </div>
                  <p className="text-[11px] font-medium text-white/50 leading-relaxed italic">
                    During initialization in your Private Project (B), point the Firebase SDK back to the Public Project (A) configuration. This ensures you see your data through a private portal that others cannot discover.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
              <CardHeader className="bg-neutral-50 p-6">
                <CardTitle className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  Privacy Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                  SYNC PRO employs **Precision Access Control**. This means even if someone discovers your "Stealth" URL, they cannot access any data without a verified email and role-based clearance from the Core Database.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> Fully Encrypted Audit Path Active
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.4em]">Sync Pro Enterprise | Stealth Protocol v4.2</p>
      </div>
    </div>
  );
}
