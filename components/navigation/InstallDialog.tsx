'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Chrome, Globe, Plus, Share2, Smartphone } from "lucide-react";

export function InstallDialog() {
  return (
    <Dialog>
      <DialogTrigger className="text-[0.8rem] 3xl:text-sm text-muted-foreground hover:text-primary transition">
          Install Mobile
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[900px]">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl md:text-2xl font-bold">Install Clutchly</DialogTitle>

          </div>
          <p className="text-sm text-muted-foreground">
            Install Clutchly on your mobile device for the best experience. Choose your platform below:
          </p>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* iOS Card */}
          <Card className="relative overflow-hidden border bg-card hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 rounded-full bg-primary/10">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">iOS Installation</h3>
              </div>
              
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">Follow these steps on your iPhone or iPad:</p>
                <div className="space-y-5">
                  {[
                    { icon: null, text: "Open Safari browser on your iOS device" },
                    { icon: null, text: "Visit Clutchly website" },
                    { icon: Share2, text: "Tap the Share button at the bottom" },
                    { icon: Plus, text: "Scroll and tap Add to Home Screen" },
                    { icon: Smartphone, text: "Tap Add to install the app" }
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {step.icon && <step.icon className="w-4 h-4 text-muted-foreground" />}
                        <span>{step.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Android Card */}
          <Card className="relative overflow-hidden border bg-card hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 rounded-full bg-primary/10">
                  <Chrome className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Android Installation</h3>
              </div>
              
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">Follow these steps on your Android device:</p>
                <div className="space-y-5">
                  {[
                    { icon: null, text: "Open Chrome browser on your Android device" },
                    { icon: null, text: "Visit Clutchly website" },
                    { icon: Share2, text: "Tap the three dots menu (⋮) in the top-right" },
                    { icon: Plus, text: "Select Install app from the menu" },
                    { icon: Smartphone, text: "Tap Install in the prompt" }
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {step.icon && <step.icon className="w-4 h-4 text-muted-foreground" />}
                        <span>{step.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}