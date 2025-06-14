import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import * as sqlite from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sqliteConnect = async () => {
    const db = await sqlite.open({
        filename: path.resolve(__dirname, "..", "data.db"),
        driver: sqlite3.Database
    });
    return db;
}