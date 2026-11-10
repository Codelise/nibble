// CREATES TABLE IF NOT EXISTS
import * as SQLite from "expo-sqlite";

// Open or create the local SQLite database file for Nibble
export async function getDatabase() {
  const db = await SQLite.openDatabaseAsync("nibble");
  return db;
}

// Initialize all 5 normalized tables for offline-first storage
export async function InitializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
        PRAGMA journal_mode = WAL;

        -- 1. User Profile & Settings Table
        CREATE TABLE IF NOT EXISTS user_profile(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        weight REAL NOT NULL,
        height REAL NOT NULL, 
        gender TEXT NOT NULL,
        activity_level REAL NOT NULL,
        goal_type TEXT NOT NULL,
        calorie_target INTEGER NOT NULL,
        profile_picture_uri TEXT,
        updated_at TEXT NOT NULL,
        CHECK (id = 1)
        );

        -- Master Foods Table (Cache & Custom Foods)
        CREATE TABLE IF NOT EXISTS foods(
        id TEXT PRIMARY KEY, 
        name TEXT NOT NULL,
        brand TEXT,
        source TEXT NOT NULL,
        serving_size REAL NOT NULL,
        serving_unit TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        created_at TEXT NOT NULL
        );

        -- 3. Daily Food Logs Table
        CREATE TABLE IF NOT EXISTS food_logs(
        id TEXT PRIMARY KEY,
        food_id TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        servings_consumed REAL NOT NULL,
        logged_date TEXT NOT NULL,
        logged_at TEXT NOT NULL,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
        );

        -- 4. Weight Tracking Logs Table
        CREATE TABLE IF NOT EXISTS weight_logs(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weight REAL NOT NULL,
        logged_date TEXT NOT NULL,
        notes TEXT
        );

        -- 5. Exercise Logs Table (Manual & Workout Tracking)
        CREATE TABLE IF NOT EXISTS exercise_logs (
            id TEXT PRIMARY KEY,
            source TEXT NOT NULL,
            activity_name TEXT NOT NULL,
            calories_burned INTEGER NOT NULL,
            logged_date TEXT NOT NULL,
            synced_at TEXT NOT NULL
        );

        `);
  console.log("✅ Nibble local database and tables initialized successfully.");
}
