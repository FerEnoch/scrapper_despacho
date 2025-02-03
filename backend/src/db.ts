import Database from "better-sqlite3";

export function createDB(name: string = "my.db") {
  const db = new Database(name, {
    verbose: console.log,
  });
  db.pragma("journal_mode = WAL");
  db.pragma("synchonous = 1");

  return db;
}

export function createTables(db: Database.Database) {
  const createUsersTable = db.prepare(
    "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, user TEXT, pass TEXT)"
  );

  const createFilesTable = db.prepare(
    "CREATE TABLE IF NOT EXISTS auth (id TEXT PRIMARY KEY, accessToken TEXT, refreshToken TEXT)"
  );

  createUsersTable.run();
  createFilesTable.run();
}
