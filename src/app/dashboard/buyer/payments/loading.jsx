export default function LoadingBuyerPaymentsPage() {
  return (
    <section className="bg-slate-50 px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-10 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-100" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-white" />
          <div className="h-28 animate-pulse rounded-2xl bg-white" />
          <div className="h-28 animate-pulse rounded-2xl bg-white" />
        </div>
        <div className="mt-6 h-96 animate-pulse rounded-3xl bg-white" />
      </div>
    </section>
  );
}
