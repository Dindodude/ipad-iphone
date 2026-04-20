import { AICopilot } from "@/components/ai-copilot";
import { AppStateProvider } from "@/components/app-state-provider";
import { Sidebar } from "@/components/sidebar";
import { buildAppSnapshot } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const initialSnapshot = await buildAppSnapshot();

  return (
    <AppStateProvider initialSnapshot={initialSnapshot}>
      <main className="app-main">
        <div className="app-shell app-layout">
          <Sidebar />
          <div className="app-content">{children}</div>
          <AICopilot />
        </div>
      </main>
    </AppStateProvider>
  );
}
