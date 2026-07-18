export default function LoadingCheckoutPage() {
  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-5 h-9 w-2/3 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="mt-8 space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </section>
  );
}
