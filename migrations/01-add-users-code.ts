import { randomInt } from 'crypto';
import { Db } from 'mongodb';

export async function up(db: Db) {
  const collection = db.collection('users');
  const users = await collection.find({ role: ['MARKETER'], code: { $exists: false } }).toArray();

  const set = new Set();
  while (set.size < users.length) set.add('sasin' + randomInt(99999999).toString().padStart(8, '0'));
  const uniqueCodes = Array.from(set);

  for (let i = 0; i < users.length; i++) {
    await collection.updateOne({ _id: users[i]._id }, { $set: { code: uniqueCodes[i] } });
  }
}

export async function down(db: Db) {
  const collection = db.collection('users');
  await collection.updateMany({ role: ['MARKETER'] }, { $unset: { code: 1 } });
}
