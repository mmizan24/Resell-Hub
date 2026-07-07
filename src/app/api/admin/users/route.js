import { auth } from '@/lib/auth';
import { MongoClient } from 'mongodb';

async function getAdmin(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) return { error: 'Please sign in.', status: 401 };
  if (user.role !== 'admin') return { error: 'Admin access only.', status: 403 };
  return { user };
}

export async function GET(request) {
  const admin = await getAdmin(request);
  if (admin.error)
    return Response.json({ success: false, message: admin.error }, { status: admin.status });

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const authDb = client.db(process.env.AUTH_DB_NAME);
    const users = await authDb
      .collection('user')
      .find()
      .sort({ _id: -1 })
      .limit(500)
      .toArray();
    await client.close();

    return Response.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        id: u._id?.toString?.() || String(u._id),
        role: typeof u.role === 'string' && u.role.trim() ? u.role.toLowerCase() : 'buyer',
      })),
    });
  } catch (error) {
    console.error('Unable to load users:', error);
    return Response.json({ success: false, message: 'Users could not be loaded.' }, { status: 500 });
  }
}
