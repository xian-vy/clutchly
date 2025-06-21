'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Copy, Check } from "lucide-react";
import { PiDiscordLogo, PiMessengerLogo } from "react-icons/pi";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ContactDialog() {
  const [copiedStates, setCopiedStates] = useState({
    email: false,
    messenger: false,
    discord: false
  });

  const handleCopy = async (text: string, type: 'email' | 'messenger' | 'discord') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [type]: true });
      toast.success("Copied to clipboard!");
      
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [type]: false });
      }, 1000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="text-[0.8rem] 3xl:text-sm text-muted-foreground hover:text-primary transition">
        Contact
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] xl:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold">Contact Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 ">
          <div className="flex items-start gap-3">
            <Mail strokeWidth={1.5} className="w-5 h-5 mt-1 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Email</h3>
              <p className="text-muted-foreground">clutchlyreptilehusbandry@gmail.com</p>
            </div>
            <Button 
              onClick={() => handleCopy("clutchlyreptilehusbandry@gmail.com", "email")} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              {copiedStates.email ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-start gap-3">
            <PiMessengerLogo className="w-5 h-5 mt-1 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Facebook Messenger</h3>
              <p className="text-muted-foreground">facebook.com/xzyian.vy</p>
            </div>
            <Button 
              onClick={() => handleCopy("facebook.com/xzyian.vy", "messenger")} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              {copiedStates.messenger ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-start gap-3">
            <PiDiscordLogo className="w-5 h-5 mt-1 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Discord</h3>
              <p className="text-muted-foreground">discord.gg/crispysnowflake.</p>
            </div>
            <Button 
              onClick={() => handleCopy("discord.gg/crispysnowflake.", "discord")} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              {copiedStates.discord ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}