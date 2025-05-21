import { APP_URL } from '@/lib/constants/app';
import {
    FacebookIcon,
    FacebookShareButton,
    TwitterIcon,
    TwitterShareButton,
    ViberIcon,
    ViberShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from "react-share";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Separator } from '@/components/ui/separator';

interface Props {
    profileName: string;
    open: boolean;
    onClose: () => void;
}

const ShareURLDialog = ({profileName, open, onClose} : Props) => {
    const URL = `${APP_URL}/catalog/${profileName}`;
    const [isCopied, setIsCopied] = useState(false);
    
    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(URL);
            setIsCopied(true);
            toast.success("URL copied to clipboard!");
            
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to copy URL:", error);
            toast.error("Failed to copy URL. Please try again.");
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="p-5 sm:p-6 sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl font-semibold text-start capitalize">
                        Share {profileName}
                    </DialogTitle>
                    <DialogDescription className="text-start">
                        Share {profileName} with friends and followers on your favorite platforms
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col justify-center items-center space-y-4 mt-2 w-full">
                    <div className="flex w-full items-center space-x-2">
                        <Input 
                            value={`clutchly.vercel.app/catalog/${profileName}`} 
                            readOnly 
                            className="text-sm font-medium"
                        />
                        <Button 
                            onClick={handleCopyUrl} 
                            variant="outline" 
                            size="icon"
                            autoFocus
                            className={isCopied ? "bg-green-100 dark:bg-green-900" : ""}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    
                      <Separator />                    
                    
                    <div className="grid grid-cols-1 gap-3 w-full">
                        <div className="flex flex-row items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-sm"> Share on Twitter</span>
                            <TwitterShareButton url={URL}>
                                <TwitterIcon size={24} round={true} />
                            </TwitterShareButton>
                        </div>
                        
                        <div className="flex flex-row items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-sm"> Share on Facebook</span>
                            <FacebookShareButton url={URL}>
                                <FacebookIcon size={24} round={true} />
                            </FacebookShareButton>
                        </div>
                        
                        <div className="flex flex-row items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-sm"> Share via WhatsApp</span>
                            <WhatsappShareButton url={URL}>
                                <WhatsappIcon size={24} round={true} />
                            </WhatsappShareButton>
                        </div>
                        
                        <div className="flex flex-row items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-sm"> Share via Viber</span>
                            <ViberShareButton url={URL}>
                                <ViberIcon size={24} round={true} />
                            </ViberShareButton>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareURLDialog;