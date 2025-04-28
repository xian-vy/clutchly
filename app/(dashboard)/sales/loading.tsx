import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex-1 flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
} 