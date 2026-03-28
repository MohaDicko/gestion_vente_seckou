import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={1} />
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
            </div>
            <p className="text-sm font-bold text-slate-400 animate-pulse tracking-widest uppercase">
                Chargement Rapide...
            </p>
        </div>
    )
}
