'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Chrome, Globe, Plus, Share2, Smartphone } from "lucide-react";

export function InstallDialog() {
  return (
    <Dialog>
      <DialogTrigger className="text-sm text-muted-foreground hover:text-primary transition">
        Install Mobile
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-bold">Install Clutchly on Your Device</DialogTitle>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* iOS Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary transition">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Globe className="w-8 h-8" />
                <h3 className="text-lg font-semibold">iOS Installation</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Follow these steps on your iPhone or iPad:</p>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">1</div>
                    <span>Open Safari browser on your iOS device</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">2</div>
                    <span>Visit Clutchly website</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">3</div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-muted-foreground" />
                      <span>Tap the Share button at the bottom of the screen</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">4</div>
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                      <span>Scroll and tap "Add to Home Screen"</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">5</div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <span>Tap "Add" to install the app</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Android Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary transition">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Chrome className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Android Installation</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Follow these steps on your Android device:</p>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">1</div>
                    <span>Open Chrome browser on your Android device</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">2</div>
                    <span>Visit Clutchly website</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">3</div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-muted-foreground" />
                      <span>Tap the three dots menu (⋮) in the top-right</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">4</div>
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                      <span>Select "Install app" from the menu</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">5</div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <span>Tap "Install" in the prompt</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


      </DialogContent>
    </Dialog>
  );
}