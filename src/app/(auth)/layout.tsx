export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background gradient mesh */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50" />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-200/40 to-purple-200/20 blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-blue-200/30 to-indigo-200/20 blur-3xl animate-float" />
        <div className="absolute -bottom-20 left-1/4 h-[350px] w-[350px] rounded-full bg-gradient-to-tr from-pink-200/30 to-rose-200/20 blur-3xl animate-float-reverse" />
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
