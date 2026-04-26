import Link from "next/link";
import { AppStateProvider } from "@/components/app-state-provider";
import { Sidebar } from "@/components/sidebar";
import { buildAppSnapshot } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const initialSnapshot = await buildAppSnapshot();

  return (
    <AppStateProvider initialSnapshot={initialSnapshot}>
      <main className="app-main">
        <div className="app-return-shell">
          <Link href="/" className="app-return-link">
            {"<- Back to Zentrixa"}
          </Link>
        </div>
        <div className="app-shell app-layout">
          <Sidebar />
          <div className="app-content">{children}</div>
        </div>
      </main>
    </AppStateProvider>
  );
}
