import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'churnsense.db')

def get_db():
    """Get a database connection."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # rows behave like dicts
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Create all tables if they don't exist."""
    conn = get_db()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT    NOT NULL,
            email         TEXT    NOT NULL UNIQUE,
            password_hash TEXT    NOT NULL,
            created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            token      TEXT    NOT NULL,
            user_id    INTEGER NOT NULL,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS datasets (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            filename    TEXT    NOT NULL,
            user_id     INTEGER NOT NULL,
            upload_date TEXT    NOT NULL DEFAULT (datetime('now')),
            status      TEXT    NOT NULL DEFAULT 'Uploaded',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ml_models (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL,
            algorithm  TEXT    NOT NULL,
            accuracy   REAL,
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS prediction_results (
            id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id               INTEGER NOT NULL,
            customer_data_summary TEXT    NOT NULL,
            churn_probability     REAL    NOT NULL,
            risk_level            TEXT    NOT NULL,
            recommendation        TEXT    NOT NULL,
            prediction_date       TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    """)

    conn.commit()
    conn.close()
