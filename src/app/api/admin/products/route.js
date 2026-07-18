import { auth } from '@/lib/auth';
import { getResellhubDatabase } from '@/lib/mongodb';

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
    const database = await getResellhubDatabase();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim().toLowerCase() || '';
    const status = url.searchParams.get('status')?.trim().toLowerCase() || '';
    const approvalStatus = url.searchParams.get('approvalStatus')?.trim().toLowerCase() || '';

    const query = {};

    if (status) {
      query.status = status;
    }

    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    }

    let products = await database.collection('products').find(query).sort({ _id: -1 }).toArray();

    if (search) {
      products = products.filter((product) => {
        const haystack = [
          product.title,
          product.category,
          product.condition,
          product.status,
          product.approvalStatus,
          product.description,
          product.price,
          product.sellerInfo?.name,
          product.sellerInfo?.email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    return Response.json({
      success: true,
      data: products.map((product) => ({
        _id: product._id?.toString?.() || String(product._id),
        title: product.title,
        category: product.category,
        condition: product.condition,
        price: product.price,
        quantity: Number.isInteger(product.quantity) && product.quantity >= 0 ? product.quantity : 0,
        images: Array.isArray(product.images) ? product.images : [],
        description: product.description,
        sellerInfo: product.sellerInfo,
        status: product.status,
        approvalStatus: product.approvalStatus || 'approved',
        approvalReviewedAt: product.approvalReviewedAt || null,
        approvalReviewedBy: product.approvalReviewedBy || null,
        createdAt: product.createdAt || null,
        updatedAt: product.updatedAt || null,
      })),
    });
  } catch (error) {
    console.error('Unable to load products for admin:', error);
    return Response.json({ success: false, message: 'Products could not be loaded.' }, { status: 500 });
  }
}
