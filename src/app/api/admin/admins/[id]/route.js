import { auth } from '@/lib/auth';
import { getResellhubDatabase } from '@/lib/mongodb';
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

async function openAuthDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return {
    client,
    authDb: client.db(process.env.AUTH_DB_NAME),
  };
}

async function findAuthUser(authDb, userId) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  return authDb.collection('user').findOne({ _id: new ObjectId(userId) });
}

export async function PATCH(request, { params }) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ success: false, message: 'Invalid admin member.' }, { status: 400 });
  }

  const connection = await openAuthDatabase();

  try {
    const database = await getResellhubDatabase();
    const adminsCollection = database.collection('admins');
    const adminRecord = await adminsCollection.findOne({ _id: new ObjectId(id) });

    if (!adminRecord) {
      return Response.json({ success: false, message: 'Admin member not found.' }, { status: 404 });
    }

    if (request.method === 'PATCH') {
      const body = await request.json();

      if (body?.makePrime !== true) {
        return Response.json({ success: false, message: 'Unsupported admin update.' }, { status: 400 });
      }

      const authUser = await findAuthUser(connection.authDb, adminRecord.userId);
      if (!authUser) {
        return Response.json({ success: false, message: 'Linked user not found.' }, { status: 404 });
      }

      await adminsCollection.updateMany(
        { status: 'active' },
        {
          $set: {
            isPrime: false,
            updatedAt: new Date(),
          },
        },
      );

      await adminsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            isPrime: true,
            status: 'active',
            updatedAt: new Date(),
          },
        },
      );

      await connection.authDb.collection('user').updateOne(
        { _id: authUser._id },
        { $set: { role: 'admin' } },
      );

      return Response.json({
        success: true,
        message: 'Prime admin updated successfully.',
      });
    }

    return Response.json({ success: false, message: 'Unsupported method.' }, { status: 405 });
  } catch (error) {
    console.error('Failed to update admin member:', error);
    return Response.json({ success: false, message: 'Failed to update admin member.' }, { status: 500 });
  } finally {
    await connection.client.close();
  }
}

export async function DELETE(request, { params }) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ success: false, message: 'Invalid admin member.' }, { status: 400 });
  }

  const connection = await openAuthDatabase();

  try {
    const database = await getResellhubDatabase();
    const adminsCollection = database.collection('admins');
    const adminRecord = await adminsCollection.findOne({ _id: new ObjectId(id) });

    if (!adminRecord) {
      return Response.json({ success: false, message: 'Admin member not found.' }, { status: 404 });
    }

    if (adminRecord.isPrime) {
      return Response.json(
        { success: false, message: 'Transfer prime adminship before revoking this admin.' },
        { status: 409 },
      );
    }

    const authUser = await findAuthUser(connection.authDb, adminRecord.userId);

    await adminsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'revoked',
          isPrime: false,
          revokedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    if (authUser) {
      const restoredRole = normalizeRole(adminRecord.previousRole || authUser.role || 'buyer');
      await connection.authDb.collection('user').updateOne(
        { _id: authUser._id },
        {
          $set: {
            role: restoredRole === 'admin' ? 'buyer' : restoredRole,
          },
        },
      );
    }

    return Response.json({ success: true, message: 'Adminship revoked successfully.' });
  } catch (error) {
    console.error('Failed to revoke admin member:', error);
    return Response.json({ success: false, message: 'Failed to revoke admin member.' }, { status: 500 });
  } finally {
    await connection.client.close();
  }
}
