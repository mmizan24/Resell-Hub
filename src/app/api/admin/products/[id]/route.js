import { auth } from '@/lib/auth';
import { getResellhubDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    return Response.json({ success: false, message: 'Invalid product.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const database = await getResellhubDatabase();
    const update = {};

    if (typeof body?.title === 'string') update.title = body.title;
    if (typeof body?.category === 'string') update.category = body.category;
    if (typeof body?.condition === 'string') update.condition = body.condition;
    if (typeof body?.price === 'number') update.price = body.price;
    if (typeof body?.description === 'string') update.description = body.description;
    if (typeof body?.status === 'string') update.status = body.status;
    if (Array.isArray(body?.images)) update.images = body.images;

    const result = await database.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return Response.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Product updated.' });
  } catch (error) {
    console.error('Unable to update product:', error);
    return Response.json({ success: false, message: 'Product could not be updated.' }, { status: 500 });
  }
}
