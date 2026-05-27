import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Salon Owner Login | Salon Demo",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-10 text-white sm:px-8 sm:py-16 lg:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 backdrop-blur-xl transition hover:border-amber-200/60 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="mt-10 mb-10 space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Owner access</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Manage your salon bookings in one place.
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
            Secure login for salon owners and staff to review appointments, manage services, and update
            availability.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
