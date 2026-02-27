'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share, PlusSquare, Smartphone, ChevronRight, MoreVertical, Download } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <PageHeader
        title="Install Mobile App"
        description="Get the SheepSync Pro app experience on your phone."
      />

      <Tabs defaultValue="android" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="ios">iPhone / iPad</TabsTrigger>
        </TabsList>

        <TabsContent value="android">
          <Card className="border-primary/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                For Android (Chrome)
              </CardTitle>
              <CardDescription>Install SheepSync Pro using Google Chrome.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <div>
                  <p className="font-bold">Open in Chrome</p>
                  <p className="text-sm text-muted-foreground">Make sure you are viewing this page in the Chrome browser.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <div>
                  <p className="font-bold">Tap the Menu</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Tap the <MoreVertical className="h-4 w-4 inline" /> (three dots) icon in the top right.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                <div>
                  <p className="font-bold">Tap 'Install App'</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Select <Download className="h-4 w-4 inline" /> <span className="font-medium text-foreground">Install app</span> or <span className="font-medium text-foreground">Add to Home screen</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
                <div>
                  <p className="font-bold">Confirm Installation</p>
                  <p className="text-sm text-muted-foreground">The SheepSync icon will be added to your app drawer and home screen!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ios">
          <Card className="border-primary/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                For iPhone & iPad (iOS)
              </CardTitle>
              <CardDescription>Get a native app experience on your Apple device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <div>
                  <p className="font-bold">Open in Safari</p>
                  <p className="text-sm text-muted-foreground">Ensure you are viewing this site in the Safari browser.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <div>
                  <p className="font-bold">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for the <Share className="h-4 w-4 text-blue-500 inline" /> icon at the bottom of your screen.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                <div>
                  <p className="font-bold">Select 'Add to Home Screen'</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Scroll down and tap <PlusSquare className="h-4 w-4 inline" /> <span className="font-medium text-foreground">Add to Home Screen</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
                <div>
                  <p className="font-bold">Tap 'Add' to Finish</p>
                  <p className="text-sm text-muted-foreground">The icon will now appear on your home screen like a normal app!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card className="border-none bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Why install this way?</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>• <strong>Full Screen:</strong> The browser address bar and navigation will disappear.</p>
            <p>• <strong>Offline Support:</strong> The app will load faster and some features work without internet.</p>
            <p>• <strong>Instant Access:</strong> No need to remember the web address, just tap the icon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
