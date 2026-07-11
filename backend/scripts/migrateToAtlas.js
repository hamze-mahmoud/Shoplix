// One-off data migration: copy every collection from a SOURCE MongoDB to a
// TARGET MongoDB, preserving _ids (so all cross-references stay intact).
// URIs are passed via env so no secrets live in this file.
//   MIGRATE_SRC=... MIGRATE_DST=... node scripts/migrateToAtlas.js
const { MongoClient } = require("mongodb");

(async () => {
  const src = process.env.MIGRATE_SRC;
  const dst = process.env.MIGRATE_DST;
  if (!src || !dst) throw new Error("set MIGRATE_SRC and MIGRATE_DST");

  const from = new MongoClient(src);
  const to = new MongoClient(dst, { serverSelectionTimeoutMS: 20000 });
  await from.connect();
  await to.connect();
  console.log("connected to both.");

  const srcDb = from.db();
  const dstDb = to.db();
  const collections = await srcDb.listCollections().toArray();

  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;
    const docs = await srcDb.collection(name).find({}).toArray();
    if (!docs.length) {
      console.log(`  ${name}: 0 docs (skipped)`);
      continue;
    }
    // fresh target: drop then insert so re-runs are idempotent
    await dstDb.collection(name).deleteMany({});
    await dstDb.collection(name).insertMany(docs, { ordered: false });
    console.log(`  ${name}: ${docs.length} docs → migrated`);
  }

  await from.close();
  await to.close();
  console.log("done.");
  process.exit(0);
})().catch((e) => { console.error("MIGRATION ERROR:", e.message); process.exit(1); });
