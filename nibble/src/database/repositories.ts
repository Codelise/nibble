import { getDatabase } from "./db";

// ==================== USER PROFILE ====================
export async function getUserProfile() {
  const db = await getDatabase();
  // A single object representing the first matching row, or null if no rows match
  const profile = await db.getFirstAsync(
    "SELECT * FROM user_profile WHERE id =1;",
  );
  return profile;
}

// INSERT / UPDATE PROFILE
export async function upsertUserProfile(profile: {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activity_level: number;
  goal_type: string;
  calorie_target: number;
  profile_picture_uri?: string;
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  // runAsync = execute queries to modify data
  await db.runAsync(
    `
        INSERT OR REPLACE INTO user_profile(id, name, age, weight, height, gender, activity_level, goal_type, calorie_target, profile_picture_uri, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
    [
      profile.name,
      profile.age,
      profile.weight,
      profile.height,
      profile.gender,
      profile.activity_level,
      profile.goal_type,
      profile.calorie_target,
      profile.profile_picture_uri || null,
      now,
    ],
  );
}

// ==================== FOODS & CACHING ====================
export async function insertFood(food: {
  id: string;
  name: string;
  brand?: string;
  source: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT OR REPLACE INTO foods (id, name, brand, source, serving_size, serving_unit, calories, protein, carbs, fat, created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?);
        `,
    [
      food.id,
      food.name,
      food.brand || null,
      food.source,
      food.serving_size,
      food.serving_unit,
      food.calories,
      food.protein,
      food.carbs,
      food.fat,
      now,
    ],
  );
}

// Search local foods
export async function searchLocalFoods(query: string) {
  const db = await getDatabase();
  const results = await db.getAllAsync(
    `SELECT * FROM foods WHERE name LIKE ? OR brand LIKE ? LIMIT 20`,
    [`%${query}`, `%${query}`],
    //It fills the two ? placeholders with your search term, adding % wildcards so the database can find matches that contain your text anywhere in the name or brand.
  );
  return results;
}

// ==================== FOOD LOGS ====================
export async function logFoodItem(log: {
  id: string;
  food_id: string;
  meal_type: string;
  servings_consumed: number;
  logged_date: string; // YYYY-MM-DD
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `
        INSERT INTO food_logs (id, food_id, meal_type, servings_consumed, logged_date, logged_at)
        VALUES(?, ?, ? , ?, ? ,?)
        `,
    [
      log.id,
      log.food_id,
      log.meal_type,
      log.servings_consumed,
      log.logged_date,
      now,
    ],
  );
}

export async function getFoodLogsByDate(date: string) {
  const db = await getDatabase();
  const logs = await db.getAllAsync(
    `SELECT fl.*, f.name, f.brand, f.calories, f.protein, f.carbs, f.fat, f.serving_size, f.serving_unit
        FROM food_logs fl
        JOIN foods f ON fl.food_id = f.id
        WHERE fl.logged_date = ?;
        `,
    [date],
  );
  return logs;
}

// ==================== WEIGHT LOGS ====================

export async function logWeight(
  weight: number,
  logged_date: string,
  notes?: string,
) {
  const db = await getDatabase();
  await db.runAsync(
    `
        INSERT INTO weight_logs (weight, logged_date, notes) VALUES (?,?,?);
        `,
    [weight, logged_date, notes || null],
  );
}

export async function getWeightHistory() {
  const db = await getDatabase();
  const history = await db.getAllAsync(
    `SELECT * FROM weight_logs ORDER BY logged_date DESC`,
  );
  return history;
}

// SAMPLE DATA FOR TESTING
// ==================== SAMPLE DATA SEEDER ====================

export async function insertSampleData() {
  const db = await getDatabase();
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
  const now = new Date().toISOString();

  // 1. Seed User Profile (Aeryun)
  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile (id, name, age, weight, height, gender, activity_level, goal_type, calorie_target, profile_picture_uri, updated_at)
     VALUES (1, 'Aeryun', 21, 79.0, 170.0, 'male', 1.375, 'deficit', 2000, NULL, ?);`,
    [now],
  );

  // 2. Seed Master Foods (Cache/Custom items)
  const sampleFoods = [
    [
      "f_oatmeal",
      "Oatmeal with Banana",
      "Home Prep",
      "custom",
      1,
      "bowl",
      350,
      10,
      60,
      5,
    ],
    [
      "f_chicken",
      "Grilled Chicken Breast",
      "USDA Whole Foods",
      "usda",
      100,
      "g",
      165,
      31,
      0,
      3.6,
    ],
    [
      "f_rice",
      "White Rice (Cooked)",
      "USDA Whole Foods",
      "usda",
      150,
      "g",
      195,
      4,
      42,
      0.4,
    ],
  ];

  for (const f of sampleFoods) {
    await db.runAsync(
      `INSERT OR REPLACE INTO foods (id, name, brand, source, serving_size, serving_unit, calories, protein, carbs, fat, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7], f[8], f[9], now],
    );
  }

  // 3. Seed Today's Food Logs (Breakfast & Lunch)
  const sampleLogs = [
    ["log_1", "f_oatmeal", "breakfast", 1, today], // 350 kcal
    ["log_2", "f_chicken", "lunch", 1.5, today], // ~247 kcal
    ["log_3", "f_rice", "lunch", 1.0, today], // 195 kcal
  ]; // Total Consumed = ~792 kcal

  for (const l of sampleLogs) {
    await db.runAsync(
      `INSERT OR REPLACE INTO food_logs (id, food_id, meal_type, servings_consumed, logged_date, logged_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [l[0], l[1], l[2], l[3], l[4], now],
    );
  }

  // 4. Seed Weight History
  await db.runAsync(
    `INSERT INTO weight_logs (weight, logged_date, notes) VALUES (?, ?, ?);`,
    [79.5, "2026-11-03", "Starting weight check"],
  );
  await db.runAsync(
    `INSERT INTO weight_logs (weight, logged_date, notes) VALUES (?, ?, ?);`,
    [79.0, today, "Weekly weigh-in progress"],
  );

  // 5. Seed Exercise Logs (Manual / Workout burn)
  await db.runAsync(
    `INSERT OR REPLACE INTO exercise_logs (id, source, activity_name, calories_burned, logged_date, synced_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    ["ex_1", "manual", "Morning Tempo Run", 260, today, now],
  );

  console.log("🌱 Sample test data seeded across all tables successfully!");
}
