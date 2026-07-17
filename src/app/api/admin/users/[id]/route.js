import { auth } from '@/lib/auth';
import { MongoClient, ObjectId } from 'mongodb';

function normalizeRole(role) {
  return typeof role === 'string' && role.trim() ? role.trim().toLowerCase() : 'buyer';
}

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
    const marketplaceDb = client.db('resellhub');

    const existingUser = await authDb.collection('user').findOne({ _id: new ObjectId(id) });
    const existingAdminRecord = await marketplaceDb.collection('admins').findOne({
      userId: id,
      status: 'active',
    });

    const update = {};
    if (typeof body?.name === 'string') update.name = body.name;
    if (typeof body?.email === 'string') update.email = body.email;
    if (typeof body?.role === 'string') update.role = body.role;
    if (typeof body?.phoneNumber === 'string') update.phoneNumber = body.phoneNumber;
    if (typeof body?.location === 'string') update.location = body.location;
    if (typeof body?.staus === 'string') update.staus = body.staus;

    const nextRole = typeof body?.role === 'string' ? normalizeRole(body.role) : null;

    if (nextRole && nextRole !== 'admin' && existingAdminRecord?.isPrime) {
      await client.close();
      return Response.json(
        {
          success: false,
          message: 'Transfer prime adminship before changing this role.',
        },
        { status: 409 },
      );
    }

    const result = await authDb.collection('user').updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (nextRole === 'admin') {
      const activePrimeCount = await marketplaceDb.collection('admins').countDocuments({
        status: 'active',
        isPrime: true,
      });
      const shouldBePrime = existingAdminRecord?.isPrime === true || activePrimeCount === 0;

      if (shouldBePrime) {
        await marketplaceDb.collection('admins').updateMany(
          { status: 'active' },
          {
            $set: {
              isPrime: false,
              updatedAt: new Date(),
            },
          },
        );
      }

      await marketplaceDb.collection('admins').updateOne(
        { userId: id },
        {
          $set: {
            userId: id,
            name: update.name || existingUser?.name || '',
            email: update.email || existingUser?.email || '',
            phoneNumber: update.phoneNumber || existingUser?.phoneNumber || '',
            location: update.location || existingUser?.location || '',
            previousRole: normalizeRole(existingAdminRecord?.previousRole || existingUser?.role || 'buyer') === 'admin'
              ? 'buyer'
              : normalizeRole(existingAdminRecord?.previousRole || existingUser?.role || 'buyer'),
            status: 'active',
            isPrime: shouldBePrime,
            promotedBy: 'user-editor',
            promotedAt: new Date(),
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    } else if (existingAdminRecord) {
      await marketplaceDb.collection('admins').updateOne(
        { userId: id },
        {
          $set: {
            status: 'revoked',
            isPrime: false,
            revokedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      const restoredRole = normalizeRole(existingAdminRecord.previousRole || existingUser?.role || 'buyer');
      await authDb.collection('user').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            role: restoredRole === 'admin' ? 'buyer' : restoredRole,
          },
        },
      );
    }

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
