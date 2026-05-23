import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Salon Owner Login | Salon Demo",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Owner access</p>
          <h1 className="text-4xl font-semibold tracking-tight">Manage your salon bookings in one place.</h1>
          <p className="max-w-2xl mx-auto text-sm leading-7 text-slate-400">
            Secure login for salon owners and staff to review appointments, manage services, and update availability.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
