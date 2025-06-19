'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { APP_NAME } from "@/lib/constants/app";
import { Chrome, Plus, Share2, Smartphone, Laptop, LucideIcon, MonitorDown } from "lucide-react";
import { useEffect, useState } from "react";
import { RiAppleLine } from "react-icons/ri";
import { RiMacbookLine } from "react-icons/ri";

type Platform = 'ios' | 'android' | 'desktop' | 'mac';

export function InstallDialog() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setSelectedPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setSelectedPlatform('android');
    } else if (/macintosh|mac os x/.test(userAgent)) {
      setSelectedPlatform('mac');
    } else {
      setSelectedPlatform('desktop');
    }
  }, []);

  const getPlatformInstructions = (platform: Platform) => {
    switch (platform) {
      case 'ios':
        return {
          title: "iOS Installation",
          icon: RiAppleLine,
          steps: [
            { icon: null, text: "Open Safari browser on your iPhone or iPad" },
            { icon: null, text: "Visit Clutchly website (clutchly.vercel.app)" },
            { icon: Share2, text: "Tap the Share button at the bottom" },
            { icon: Plus, text: "Scroll and tap Add to Home Screen" },
            { icon: Smartphone, text: "Tap Add to install the app" }
          ]
        };
      case 'android':
        return {
          title: "Android Installation",
          icon: Chrome,
          steps: [
            { icon: null, text: "Open Chrome browser on your Android device" },
            { icon: null, text: "Visit Clutchly website (clutchly.vercel.app)" },
            { icon: Share2, text: "Tap the three dots menu (⋮) in the top-right" },
            { icon: Plus, text: "Select Install app from the menu" },
            { icon: Smartphone, text: "Tap Install in the prompt" }
          ]
        };
      case 'mac':
        return {
          title: "Mac Installation",
          icon: RiMacbookLine,
          steps: [
            { icon: null, text: "Open Safari browser on your Mac" },
            { icon: null, text: "Visit Clutchly website (clutchly.vercel.app)" },
            { icon: Share2, text: "Click File in the menu bar" },
            { icon: Plus, text: "Select Add to Dock" },
            { icon: Laptop, text: "The app will appear in your Dock" }
          ]
        };
      default:
        return {
          title: "Windows Installation",
          icon: Laptop,
          steps: [
            { icon: null, text: "Open Chrome, Edge, Brave, or Firefox browser on your PC" },
            { icon: null, text: "Visit Clutchly website (clutchly.vercel.app)" },
            { icon: MonitorDown, text: "Look for the install icon in the URL bar" },
            { icon: Plus, text: "Click the install icon" },
            { icon: Laptop, text: "Click Install in the prompt" }
          ]
        };
    }
  };

  const instructions = selectedPlatform ? getPlatformInstructions(selectedPlatform) : null;
  const Icon = instructions?.icon as LucideIcon;

  return (
    <Dialog>
      <DialogTrigger className="text-[0.8rem] 3xl:text-sm text-muted-foreground hover:text-primary transition">
        Install
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] 2xl:max-w-[900px] overflow-y-auto max-h-[90vh] p-4 sm:p-6">
        <DialogHeader className="sm:space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl md:text-2xl font-bold">Install {APP_NAME}</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground text-start">
            Install {APP_NAME} on your device for the best experience. Choose your platform below:
          </p>
        </DialogHeader>
        
        <div className="grid gap-4 sm:gap-6">
          {/* Platform Selection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Card 
              className={`relative overflow-hidden border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${selectedPlatform === 'ios' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPlatform('ios')}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                    <RiAppleLine className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold">iOS</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Install on iPhone or iPad using Safari</p>
              </CardContent>
            </Card>

            <Card 
              className={`relative overflow-hidden border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${selectedPlatform === 'android' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPlatform('android')}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                    <Chrome className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold">Android</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Install on Android using Chrome</p>
              </CardContent>
            </Card>

            <Card 
              className={`relative overflow-hidden border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${selectedPlatform === 'mac' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPlatform('mac')}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                    <RiMacbookLine className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold">Mac</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Install on Mac using Safari</p>
              </CardContent>
            </Card>

            <Card 
              className={`relative overflow-hidden border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${selectedPlatform === 'desktop' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPlatform('desktop')}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                    <Laptop className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold">Windows</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Install on Windows using Chrome</p>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          {instructions && (
            <Card className="relative overflow-hidden border bg-card hover:bg-accent/50 transition-colors">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-5">
                  <div className="p-2 rounded-full bg-primary/10">
                    {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{instructions.title}</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-6">
                  <p className="text-sm text-muted-foreground">Follow these steps on your device:</p>
                  <div className="space-y-3 sm:space-y-5">
                    {instructions.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3">
                        <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          {step.icon && <step.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />}
                          <span>{step.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}