import { auth } from '@/lib/auth';
import { getResellhubDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getAdmin(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) return { error: 'Please sign in.', status: 401 };
  if ((user.role || '').toLowerCase() !== 'admin') return { error: 'Admin access only.', status: 403 };
  return { user };
}

export async function PATCH(request, { params }) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ success: false, message: 'Invalid order.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const database = await getResellhubDatabase();
    const update = {};

    if (typeof body?.orderStatus === 'string') update.orderStatus = body.orderStatus;
    if (typeof body?.paymentStatus === 'string') update.paymentStatus = body.paymentStatus;
    if (typeof body?.currency === 'string') update.currency = body.currency;
    if (typeof body?.amountTotal === 'number') update.amountTotal = body.amountTotal;

    const result = await database.collection('orders').updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return Response.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Order updated.' });
  } catch (error) {
    console.error('Unable to update order:', error);
    return Response.json({ success: false, message: 'Order could not be updated.' }, { status: 500 });
  }
}
