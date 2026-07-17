export function ProductServiceNotice({ title = "Products are temporarily unavailable" }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-4xl px-5">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-800">
            Backend offline
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The product data comes from the Express API on port <code>5000</code>.
            If that server is stopped, this page cannot fetch fresh products.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
            <span className="font-semibold text-amber-300">Next step:</span> start the
            server again with <code>npm run dev:server</code> from the project root,
            then refresh this page.
          </div>
        </div>
      </div>
    </section>
  );
}
