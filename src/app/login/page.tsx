import LoginForm from "@/components/LoginForm";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-secondary border border-border rounded-2xl flex items-center justify-center mb-6 shadow-2xl glass">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight font-mono text-white mb-2">
            MARKDOWN_FLOW
          </h1>
          <p className="text-muted-foreground text-center text-sm uppercase tracking-[0.2em]">
            Authentication Required
          </p>
        </div>

        <div className="glass p-8 rounded-3xl shadow-2xl border border-border/50">
          <LoginForm />
        </div>
        
        <p className="mt-8 text-center text-xs text-muted-foreground/50 font-mono uppercase tracking-widest">
          Secure Single-Tenant Instance v1.0
        </p>
      </div>
    </div>
  );
}
