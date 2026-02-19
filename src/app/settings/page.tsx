import { auth, signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { User } from "@/entities/User";
import { ApiKey } from "@/entities/ApiKey";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import CreateKeyForm from "./create-key-form";
import Link from "next/link";
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Key, 
  Shield, 
  Trash2, 
  Clock,
  LayoutDashboard,
  LogOut,
  Terminal as TerminalIcon
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email: session.user.email! });
  if (!user) redirect("/login");

  const apiKeys = await db.getRepository(ApiKey).find({
    where: { userId: user.id },
    order: { createdAt: "DESC" },
  });

  async function createApiKey(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name) return { rawKey: "" };

    const db = await getDb();
    const user = await db.getRepository(User).findOneBy({ email: session?.user?.email! });
    
    const rawKey = "sk-" + randomBytes(32).toString("hex");
    const hashedKey = await hash(rawKey, 10);
    const prefix = rawKey.substring(0, 10) + "...";

    const apiKey = new ApiKey();
    apiKey.name = name;
    apiKey.keyHash = hashedKey;
    apiKey.keyPrefix = prefix;
    apiKey.user = user!;
    apiKey.userId = user!.id;
    
    await db.getRepository(ApiKey).save(apiKey);
    revalidatePath("/settings");
    
    return { rawKey };
  }

  async function revokeApiKey(id: string) {
    "use server";
    const db = await getDb();
    await db.getRepository(ApiKey).delete({ id, userId: user!.id });
    revalidatePath("/settings");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-secondary/30 hidden lg:flex flex-col glass">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TerminalIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-mono font-bold tracking-tighter text-lg">MF_FLOW</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-lg transition-colors">
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border/50">
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <button className="flex items-center gap-3 px-4 py-2 w-full text-muted-foreground hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors text-sm">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-border mx-1" />
            <h2 className="font-semibold text-lg">System Settings</h2>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">Access Management</h1>
            <p className="text-muted-foreground">Configure API access and security credentials for bots.</p>
          </div>

          <div className="grid gap-8">
            {/* Create Section */}
            <section className="bg-secondary/20 border border-border/50 rounded-2xl p-8 glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Generate Secret Key</h3>
                  <p className="text-sm text-muted-foreground">Bot instances use these keys to upload documentation.</p>
                </div>
              </div>
              
              <div className="max-w-md">
                <CreateKeyForm onCreate={createApiKey} />
              </div>
            </section>

            {/* List Section */}
            <section>
              <div className="flex items-center gap-2 mb-6 px-2 text-muted-foreground font-mono text-xs uppercase tracking-widest font-bold">
                <Shield className="w-3 h-3" />
                <span>Provisioned Keys [{apiKeys.length}]</span>
              </div>

              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex justify-between items-center p-6 bg-secondary/10 border border-border/30 rounded-2xl glass hover:border-border/60 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Key className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="font-bold text-white mb-1 group-hover:text-primary transition-colors">{key.name}</div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded border border-border/50">
                            {key.keyPrefix}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 font-mono uppercase tracking-tight">
                            <Clock className="w-2.5 h-2.5" />
                            Provisioned {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <form action={revokeApiKey.bind(null, key.id)}>
                      <button 
                        type="submit" 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="py-16 border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center opacity-50">
                    <Key className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No API keys active.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
