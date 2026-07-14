import { AdminSidebar } from '../../../../components/dashboard/AdminSidebar';
import { AdminUsersTable } from '../../../../components/dashboard/AdminUsersTable';
import { AdminProductsTable } from '../../../../components/dashboard/AdminProductsTable';
import { AdminOrdersTable } from '../../../../components/dashboard/AdminOrdersTable';
import { AdminSettingsPanel } from '../../../../components/dashboard/AdminSettingsPanel';
import { auth } from '@/lib/auth';
import { getResellhubDatabase } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';
import { headers } from 'next/headers';

import 'server-only';

export const dynamic = 'force-dynamic';

async function getOverview() {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });
    const user = session?.user;

    if (!user || (user.role || '').toLowerCase() !== 'admin') return null;

    const database = await getResellhubDatabase();
    const productsCount = await database.collection('products').countDocuments();
    const orders = await database.collection('orders').find({}).toArray();

    const mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    try {
      const authDb = mongoClient.db(process.env.AUTH_DB_NAME);
      const users = await authDb.collection('user').find({}).toArray();

      const totalUsers = users.length;
      const buyerCount = users.filter((entry) => (entry.role || 'buyer').toLowerCase() === 'buyer').length;
      const sellerCount = users.filter((entry) => (entry.role || 'seller').toLowerCase() === 'seller').length;
      const paidOrders = orders.filter((order) => (order.paymentStatus || '').toLowerCase() === 'paid').length;
      const pendingOrders = orders.filter((order) => (order.paymentStatus || '').toLowerCase() !== 'paid').length;
      const totalRevenue = orders.reduce((sum, order) => {
        const amount = Number(order.amountTotal ?? order.amount ?? 0);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);

      return {
        totalUsers,
        buyerCount,
        sellerCount,
        totalProducts: productsCount,
        totalOrders: orders.length,
        paidOrders,
        pendingOrders,
        totalRevenue,
      };
    } finally {
      await mongoClient.close();
    }
  } catch (error) {
    console.error('Unable to load admin overview:', error);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const overview = await getOverview();

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-800 p-4 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">Control center</p>
            <h2 className="mt-2 text-xl font-bold">Super Admin</h2>
            <p className="mt-2 text-sm text-blue-100">Monitor the marketplace, manage members, and oversee listings.</p>
            <div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-3">
              <AdminSidebar />
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <section id="overview" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Admin Dashboard</p>
                <h1 className="mt-2 text-3xl font-bold text-blue-950">Platform command center</h1>
                <p className="mt-2 text-sm text-slate-600">Full platform administration and moderation tools.</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Live operations
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                <p className="text-sm text-slate-500">Total users</p>
                <p className="mt-2 text-3xl font-bold text-blue-950">{overview?.totalUsers ?? '—'}</p>
                <p className="mt-1 text-xs text-slate-500">{overview?.buyerCount ?? 0} buyers • {overview?.sellerCount ?? 0} sellers</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                <p className="text-sm text-slate-500">Total products</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{overview?.totalProducts ?? '—'}</p>
                <p className="mt-1 text-xs text-slate-500">Marketplace listings</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5">
                <p className="text-sm text-slate-500">Total orders</p>
                <p className="mt-2 text-3xl font-bold text-amber-700">{overview?.totalOrders ?? '—'}</p>
                <p className="mt-1 text-xs text-slate-500">{overview?.paidOrders ?? 0} paid • {overview?.pendingOrders ?? 0} pending</p>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5">
                <p className="text-sm text-slate-500">Buyer activity</p>
                <p className="mt-2 text-3xl font-bold text-violet-700">{overview?.buyerCount ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Active buyer accounts</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5">
                <p className="text-sm text-slate-500">Sellers</p>
                <p className="mt-2 text-3xl font-bold text-sky-700">{overview?.sellerCount ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Selling accounts</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5">
                <p className="text-sm text-slate-500">Revenue</p>
                <p className="mt-2 text-3xl font-bold text-rose-700">{overview?.totalRevenue ? `${overview.totalRevenue}` : '—'}</p>
                <p className="mt-1 text-xs text-slate-500">Paid order value</p>
              </div>
            </div>
          </section>

          <AdminSettingsPanel />

          <section className="space-y-6">
            <AdminUsersTable />
            <AdminProductsTable />
            <AdminOrdersTable />
          </section>
        </main>
      </div>
    </div>
  );
}
