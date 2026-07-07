const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  const authDbName = process.env.AUTH_DB_NAME || 'resellhub';
  const argv = Object.fromEntries(process.argv.slice(2).map((arg) => arg.split('=')));
  const email = argv['--email'] || argv.email || process.env.ADMIN_EMAIL;
  const name = argv['--name'] || argv.name || 'Admin';

  if (!uri) {
    console.error('MONGODB_URI is required in environment.');
    process.exit(1);
  }

  if (!email) {
    console.error('Provide an email for the admin: node scripts/create-admin.js --email=you@example.com');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(authDbName);

    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      await db.collection('users').updateOne({ email }, { $set: { role: 'admin', name } });
      console.log(`Updated existing user ${email} to role=admin`);
    } else {
      await db.collection('users').insertOne({ email, name, role: 'admin', createdAt: new Date() });
      console.log(`Created admin user ${email} (no password set). Please ask the user to sign-up and then re-run to set role if needed.`);
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
