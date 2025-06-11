import path from "path";
import sqlite3 from "sqlite3";
import sqlite from "sqlite";

export const sqliteConnect = async () => {
    const db = await sqlite.open({
        filename: path.resolve(__dirname, "..", "data.db"),
        driver: sqlite3.Database
    });
    return db;
}