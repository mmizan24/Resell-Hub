import { auth } from '@/lib/auth';
import { getResellhubDatabase } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

async function getAdmin(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) return { error: 'Please sign in.', status: 401 };
  if ((user.role || '').toLowerCase() !== 'admin') return { error: 'Admin access only.', status: 403 };
  return { user };
}

export async function GET(request) {
  const admin = await getAdmin(request);
  if (admin.error)
    return Response.json({ success: false, message: admin.error }, { status: admin.status });

  try {
    const database = await getResellhubDatabase();
    const totalProducts = await database.collection('products').countDocuments();
    const totalOrders = await database.collection('orders').countDocuments();
    const paidOrders = await database.collection('orders').countDocuments({ paymentStatus: 'paid' });
    const pendingOrders = await database.collection('orders').countDocuments({ paymentStatus: { $ne: 'paid' } });

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const authDb = client.db(process.env.AUTH_DB_NAME);
    const users = await authDb.collection('user').find({}).toArray();
    const totalUsers = users.length;
    const buyerCount = users.filter((user) => (user.role || 'buyer').toLowerCase() === 'buyer').length;
    const sellerCount = users.filter((user) => (user.role || 'seller').toLowerCase() === 'seller').length;
    await client.close();

    return Response.json({
      success: true,
      data: {
        totalUsers,
        buyerCount,
        sellerCount,
        totalProducts,
        totalOrders,
        paidOrders,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error('Unable to load admin overview:', error);
    return Response.json({ success: false, message: 'Overview could not be loaded.' }, { status: 500 });
  }
}
