'use client';

import { Shell } from '@/components/shared/Shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, ShieldCheck, Fingerprint, Key, Globe, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function HelpContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl h-full flex flex-col pb-32">
      <PageHeader
        title="Stealth & Setup"
        description="Optimize your enterprise experience and privacy strategy."
        className="px-4 md:px-0"
      />

      <Tabs defaultValue="security" className="w-full px-4 md:px-0">
        <TabsList className="grid w-full grid-cols-3 mb-10 p-1.5 bg-[#D7F2F1] rounded-2xl h-14">
          <TabsTrigger value="security" className="rounded-xl font-black text-[10px] uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="android" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Android</TabsTrigger>
          <TabsTrigger value="ios" className="rounded-xl font-black text-[10px] uppercase tracking-widest">iOS</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-neutral-900 text-white">
              <CardHeader className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-6 w-6 text-[#14d5c7]" />
                  <CardTitle className="text-xl font-black tracking-tight text-white uppercase">Stealth Deployment</CardTitle>
                </div>
                <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Private Project Hosting Strategy</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-white/80 leading-relaxed">
                    To hide your Farm Audit instance from discovery on shared network registries, we recommend deploying the UI code to a separate **Private Project**.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#14d5c7]" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Core Database (Project A)</h4>
                    </div>
                    <p className="text-[11px] font-medium text-white/60">
                      Hosts your primary Firestore data and user whitelist. This is your backend.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Private UI (Project B)</h4>
                    </div>
                    <p className="text-[11px] font-medium text-white/60">
                      Create a second project where only you are owner. Host the code here to generate a "hidden" app link.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Key className="h-4 w-4 text-[#14d5c7]" />
                    <span className="text-xs font-black uppercase tracking-tight">The Precision Link</span>
                  </div>
                  <p className="text-[11px] font-medium text-white/50 leading-relaxed italic">
                    During initialization in your Private Project (B), point the Firebase SDK back to the Core Project (A) configuration. This ensures you see your data through a private portal.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 p-6">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                  Farm Audit employs **Precision Access Control**. Even if someone discovers your private URL, they cannot access any data without a verified email and administrative clearance.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> Fully Encrypted Audit Path Active
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="android">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-neutral-900 text-white p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3 text-white">
                <Smartphone className="h-5 w-5 text-[#14d5c7]" />
                Android Installation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {[
                { step: 1, title: "Open in Chrome", desc: "View this hub directly in the Chrome browser app." },
                { step: 2, title: "Menu Settings", desc: "Tap the three-dot menu icon in the top right corner." },
                { step: 3, title: "Install App", desc: "Select 'Install app' or 'Add to Home screen' from the menu." }
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-[#14d5c7] font-black text-sm shadow-lg">{item.step}</div>
                  <div>
                    <p className="text-sm font-black uppercase text-slate-800">{item.title}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ios">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-[#005f4b] text-white p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3 text-white uppercase">
                <Smartphone className="h-5 w-5 text-white" />
                iOS (Safari) Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {[
                { step: 1, title: "Launch Safari", desc: "Visit your dashboard URL using the Apple Safari browser." },
                { step: 2, title: "Share Action", desc: "Tap the 'Share' icon (square with upward arrow) at the bottom." },
                { step: 3, title: "Home Screen", desc: "Scroll down and select 'Add to Home Screen'." }
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#005f4b] text-white font-black text-sm shadow-lg">{item.step}</div>
                  <div>
                    <p className="text-sm font-black uppercase text-slate-800">{item.title}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Shell>
      <HelpContent />
    </Shell>
  );
}