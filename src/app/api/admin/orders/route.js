import { auth } from '@/lib/auth';
import { getResellhubDatabase } from '@/lib/mongodb';

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
    const orders = await database.collection('orders').find().sort({ _id: -1 }).limit(500).toArray();
    return Response.json({ success: true, data: orders });
  } catch (error) {
    console.error('Unable to load orders:', error);
    return Response.json({ success: false, message: 'Orders could not be loaded.' }, { status: 500 });
  }
}
