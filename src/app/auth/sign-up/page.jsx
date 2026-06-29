import Link from "next/link";

export default function SignUpPage() {
  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-950">Create an account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Join ResellHub to start buying and reselling products.
        </p>

        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-semibold text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
