import { auth } from '@/lib/auth';
import { updateAdminProduct } from '@/lib/product-service';
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
    const result = await updateAdminProduct(id, body);

    if (result.error) {
      return Response.json({ success: false, message: result.error }, { status: result.status || 422 });
    }

    return Response.json({ success: true, message: result.message || 'Product updated.' });
  } catch (error) {
    console.error('Unable to update product:', error);
    return Response.json({ success: false, message: 'Product could not be updated.' }, { status: 500 });
  }
}
