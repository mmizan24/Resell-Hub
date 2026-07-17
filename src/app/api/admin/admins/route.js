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

async function findAuthUser(authDb, { userId, email }) {
  if (typeof userId === 'string' && ObjectId.isValid(userId)) {
    const byId = await authDb.collection('user').findOne({ _id: new ObjectId(userId) });
    if (byId) return byId;
  }

  if (typeof email === 'string' && email.trim()) {
    const normalizedEmail = email.trim();
    const byEmail = await authDb.collection('user').findOne({
      $or: [{ email: normalizedEmail }, { email: normalizedEmail.toLowerCase() }],
    });
    if (byEmail) return byEmail;
  }

  return null;
}

function adminDTO(adminRecord, authUser) {
  return {
    id: adminRecord._id.toString(),
    userId: adminRecord.userId,
    name: authUser?.name || adminRecord.name || '',
    email: authUser?.email || adminRecord.email || '',
    phoneNumber: authUser?.phoneNumber || adminRecord.phoneNumber || '',
    location: authUser?.location || adminRecord.location || '',
    role: normalizeRole(authUser?.role || 'buyer'),
    previousRole: normalizeRole(adminRecord.previousRole || authUser?.role || 'buyer'),
    status: adminRecord.status || 'active',
    isPrime: Boolean(adminRecord.isPrime),
    promotedBy: adminRecord.promotedBy || '',
    promotedAt: adminRecord.promotedAt || null,
    revokedAt: adminRecord.revokedAt || null,
    createdAt: adminRecord.createdAt || null,
    updatedAt: adminRecord.updatedAt || null,
  };
}

async function loadAdminMembers(authDb) {
  const database = await getResellhubDatabase();
  const records = await database
    .collection('admins')
    .find({})
    .sort({ isPrime: -1, status: 1, updatedAt: -1, createdAt: -1 })
    .toArray();

  const userIds = [
    ...new Set(
      records
        .map((record) => record.userId)
        .filter((value) => typeof value === 'string' && ObjectId.isValid(value)),
    ),
  ];

  const authUsers = userIds.length
    ? await authDb
        .collection('user')
        .find({ _id: { $in: userIds.map((value) => new ObjectId(value)) } })
        .toArray()
    : [];
  const authUserMap = new Map(authUsers.map((authUser) => [String(authUser._id), authUser]));

  return records.map((record) => adminDTO(record, authUserMap.get(record.userId)));
}

async function promoteToAdmin(authDb, authUser, options = {}) {
  const database = await getResellhubDatabase();
  const adminsCollection = database.collection('admins');
  const authUserId = String(authUser._id);
  const existingRecord = await adminsCollection.findOne({ userId: authUserId });
  const currentActivePrimeCount = await adminsCollection.countDocuments({
    status: 'active',
    isPrime: true,
  });
  const shouldBePrime =
    options.makePrime === true || existingRecord?.isPrime === true || currentActivePrimeCount === 0;

  if (shouldBePrime) {
    await adminsCollection.updateMany(
      { status: 'active' },
      {
        $set: {
          isPrime: false,
          updatedAt: new Date(),
        },
      },
    );
  }

  const previousRole = normalizeRole(existingRecord?.previousRole || authUser.role || 'buyer');
  const fallbackPreviousRole = previousRole === 'admin' ? 'buyer' : previousRole;

  await adminsCollection.updateOne(
    { userId: authUserId },
    {
      $set: {
        userId: authUserId,
        name: authUser.name || existingRecord?.name || '',
        email: authUser.email || existingRecord?.email || '',
        phoneNumber: authUser.phoneNumber || existingRecord?.phoneNumber || '',
        location: authUser.location || existingRecord?.location || '',
        previousRole: fallbackPreviousRole,
        status: 'active',
        isPrime: shouldBePrime,
        promotedBy: options.promotedBy || existingRecord?.promotedBy || 'admin-panel',
        promotedAt: new Date(),
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  await authDb.collection('user').updateOne(
    { _id: authUser._id },
    {
      $set: {
        role: 'admin',
      },
    },
  );

  const saved = await adminsCollection.findOne({ userId: authUserId });
  return adminDTO(saved, authUser);
}

export async function GET(request) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const connection = await openAuthDatabase();

  try {
    const members = await loadAdminMembers(connection.authDb);
    return Response.json({ success: true, data: members });
  } catch (error) {
    console.error('Failed to load admin members:', error);
    return Response.json({ success: false, message: 'Failed to load admin members.' }, { status: 500 });
  } finally {
    await connection.client.close();
  }
}

export async function POST(request) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const connection = await openAuthDatabase();

  try {
    const body = await request.json();
    const identifier = typeof body?.email === 'string' ? body.email : body?.userId;
    const authUser = await findAuthUser(connection.authDb, {
      userId: typeof body?.userId === 'string' ? body.userId.trim() : '',
      email: typeof identifier === 'string' ? identifier.trim() : '',
    });

    if (!authUser) {
      return Response.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const member = await promoteToAdmin(connection.authDb, authUser, {
      makePrime: Boolean(body?.makePrime),
      promotedBy: typeof body?.promotedBy === 'string' ? body.promotedBy : 'admin-panel',
    });

    return Response.json({
      success: true,
      message: member.isPrime ? 'Prime admin assigned successfully.' : 'Adminship granted successfully.',
      data: member,
    });
  } catch (error) {
    console.error('Failed to create admin member:', error);
    return Response.json({ success: false, message: 'Failed to create admin member.' }, { status: 500 });
  } finally {
    await connection.client.close();
  }
}
