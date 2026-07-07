import { auth } from '@/lib/auth';
import { MongoClient, ObjectId } from 'mongodb';

async function getAdmin(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) return { error: 'Please sign in.', status: 401 };
  if (user.role !== 'admin') return { error: 'Admin access only.', status: 403 };
  return { user };
}

export async function PATCH(request, { params }) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ success: false, message: 'Invalid user.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const authDb = client.db(process.env.AUTH_DB_NAME);

    const update = {};
    if (typeof body?.name === 'string') update.name = body.name;
    if (typeof body?.email === 'string') update.email = body.email;
    if (typeof body?.role === 'string') update.role = body.role;
    if (typeof body?.phoneNumber === 'string') update.phoneNumber = body.phoneNumber;
    if (typeof body?.location === 'string') update.location = body.location;
    if (typeof body?.staus === 'string') update.staus = body.staus;

    const result = await authDb.collection('user').updateOne({ _id: new ObjectId(id) }, { $set: update });
    await client.close();

    if (result.matchedCount === 0) {
      return Response.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'User updated.' });
  } catch (error) {
    console.error('Unable to update user:', error);
    return Response.json({ success: false, message: 'User could not be updated.' }, { status: 500 });
  }
}
