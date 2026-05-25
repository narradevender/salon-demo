import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { hasOwnerSession, OWNER_USERNAME } from "@/lib/owner-auth";

export const metadata = {
  title: "Salon Dashboard | Salon Demo",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isOwner = await hasOwnerSession();

  if (!isOwner) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <Sidebar ownerEmail={OWNER_USERNAME} />
        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
