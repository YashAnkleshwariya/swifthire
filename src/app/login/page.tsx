import { Suspense } from "react";
import LoginForm from "./login-form";
import { ShiftHireLogo } from "@/components/shifthire-logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <ShiftHireLogo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Shift<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Hire</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">AI-powered recruitment, simplified</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your credentials to continue</p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
