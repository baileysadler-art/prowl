export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Clean background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-rose-50/30" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Prowl</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Competitor Intelligence Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
