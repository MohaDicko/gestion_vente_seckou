"use client"

import { useActionState } from "react"
import { authenticate } from "@/lib/actions"
import { Home, ShoppingBag, ShieldCheck, ChevronRight, Lock, Mail, Loader2 } from "lucide-react"
import { SekouLogo } from "@/components/SekouLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Decorative Patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl" />

            <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-0 overflow-hidden bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 mx-4">

                {/* Left Side: Professional Identity */}
                <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white relative">
                    <div className="space-y-6">
                        <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md">
                            <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold leading-tight">
                            Gérez votre boutique de rideaux et draps avec simplicité.
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Le système Sekou Draperie vous aide à optimiser vos stocks de tissus, gérer vos dimensions et sécuriser vos ventes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <ShieldCheck className="h-6 w-6 text-accent" />
                            <div className="text-sm">
                                <p className="font-bold text-white tracking-wide uppercase text-[10px]">Espace Sécurisé</p>
                                <p className="text-white/60 text-[11px]">Accès restreint au personnel autorisé.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-14 flex flex-col justify-center">
                    <div className="mb-10 text-center md:text-left">
                        <div className="flex justify-center md:justify-start mb-6">
                            <div className="bg-slate-100 p-4 rounded-3xl">
                                <SekouLogo className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Connexion</h2>
                        <p className="text-slate-500 mt-2 font-medium">Portail de gestion Sekou Draperie</p>
                    </div>

                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Identifiant</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="email ou identifiant"
                                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Mot de passe</Label>
                                <button type="button" className="text-xs text-primary font-semibold hover:underline">Oublié ?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                                <p className="font-medium">{errorMessage}</p>
                            </div>
                        )}

                        <Button
                            className="w-full h-14 text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            disabled={isPending}
                            type="submit"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    ACCÉDER AU SYSTÈME
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center space-y-2">
                        <p className="text-xs text-slate-400 font-medium tracking-wider">
                            SEKOU DRAPERIE — SYSTÈME DE GESTION V1.0
                        </p>
                        <p className="text-[10px] text-slate-400">
                            Propulsé par <a href="https://sahelmultiservices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Sahel Multiservices</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
