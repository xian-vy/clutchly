'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail,   } from "lucide-react";
import { PiDiscordLogo, PiMessengerLogo } from "react-icons/pi";

export function ContactDialog() {
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
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-muted-foreground">xianvy0000@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiMessengerLogo  className="w-5 h-5 mt-1 text-primary" />
            <div>
              <h3 className="font-semibold">Facebook Messenger</h3>
              <p className="text-muted-foreground">facebook.com/xzyian.vy</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiDiscordLogo className="w-5 h-5 mt-1 text-primary" />
            <div>
              <h3 className="font-semibold">Discord</h3>
              <p className="text-muted-foreground">discord.gg/crispysnowflake.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}