/* eslint-disable @typescript-eslint/no-var-requires */
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { Collection, Db, MongoClient } from 'mongodb';
import { config } from 'dotenv';
config();
const MongoUrl = process.env.SASINNET_MONGO_URL as string;
//===================================================

class ColoredError {
  constructor(
    public format: string,
    public msg: string,
  ) {}
}

async function up1File(filename: string, collection: Collection, db: Db) {
  const exists = existsSync(join(process.cwd(), 'migrations', filename));
  if (!exists) throw new ColoredError('\x1b[31m%s\x1b[0m', 'File not found');
  const module = require('./' + filename);
  const mig = await collection.findOne({ name: filename });
  if (mig) throw new ColoredError('\x1b[36m%s\x1b[0m', `Migration ${filename} has already executed`);
  await module.up(db);
  await collection.insertOne({ name: filename, date: new Date() });
  console.log('\x1b[32m%s\x1b[0m', `Migration ${filename} Successfully Executed`);
}

async function downFile(filename: string, collection: Collection, db: Db) {
  console.log(filename);
  const exists = existsSync(join(process.cwd(), 'migrations', filename));
  if (!exists) throw new ColoredError('\x1b[31m%s\x1b[0m', 'File not found');
  const module = require('./' + filename);
  const mig = await collection.findOne({ name: filename });
  if (!mig) throw new ColoredError('\x1b[36m%s\x1b[0m', `Migration ${filename} has not executed`);
  await module.down(db);
  await collection.deleteOne({ _id: mig._id });
  console.log('\x1b[32m%s\x1b[0m', `Migration ${filename} Successfully Reverted`);
}

async function upFiles(collection: Collection, db: Db) {
  const allModulesWithName: { name: string; module: any }[] = [];
  readdirSync(join(process.cwd(), 'migrations')).forEach(function (file) {
    if (file != 'index.ts') {
      if (!/^\d{2}-/.test(file)) throw new ColoredError('\x1b[35m%s\x1b[0m', `Invalid file name: ${file}`);
      const migfile = require('./' + file);
      allModulesWithName.push({ name: file, module: migfile });
    }
  });
  allModulesWithName.sort((a, b) => (a.name < b.name ? 1 : -1));

  let count = 0;
  for (let i = 0; i < allModulesWithName.length; i++) {
    const mig = await collection.findOne({ name: allModulesWithName[i].name });
    if (mig) break;
    await allModulesWithName[i].module.up(db);
    await collection.insertOne({ name: allModulesWithName[i].name, date: new Date() });
    console.log('\x1b[32m%s\x1b[0m', `Migration ${allModulesWithName[i].name} Successfully Executed`);
    count++;
  }
  console.log('\x1b[32m%s\x1b[0m', `==============================================> ${count} migration executed`);
}

async function main() {
  const client = new MongoClient(MongoUrl);
  try {
    await client.connect();
    const db = await client.db();
    const collection = db.collection('migrations');
    //-------------------------------------------------
    if (!['up', 'down'].includes(process.argv[2]))
      throw new ColoredError('\x1b[33m%s\x1b[0m', 'Operation type must be up|down');
    if (process.argv[2] === 'down' && !process.argv[3])
      throw new ColoredError('\x1b[33m%s\x1b[0m', 'File must be provided for down operaration');

    const Operation = process.argv[2];
    let filename = process.argv[3];
    if (process.argv[3] && !process.argv[3].endsWith('.ts')) filename = process.argv[3] + '.ts';

    if (Operation === 'up') {
      if (filename) await up1File(filename, collection, db);
      else await upFiles(collection, db);
    } else await downFile(filename, collection, db);
  } catch (err) {
    if (err instanceof ColoredError) {
      console.log(err.format, err.msg);
      throw new Error(err.msg);
    }
    throw err;
  } finally {
    client.close();
  }
}
main();
