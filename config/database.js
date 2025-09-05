const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database', 'gymtracker.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

const database = new Database();

async function initDatabase() {
  await database.connect();

  // Enable foreign keys
  await database.runQuery('PRAGMA foreign_keys = ON');

  // Create users table
  await database.runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      user_type TEXT NOT NULL DEFAULT 'standard' CHECK (user_type IN ('standard', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active BOOLEAN DEFAULT 1
    )
  `);

  // Create user profiles table
  await database.runQuery(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      phone TEXT,
      date_of_birth DATE,
      gender TEXT CHECK (gender IN ('male', 'female', 'other')),
      height_cm INTEGER,
      weight_kg REAL,
      fitness_goal TEXT,
      experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
      medical_notes TEXT,
      emergency_contact TEXT,
      profile_picture_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create sessions table for JWT session management
  await database.runQuery(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create workout programs table
  await database.runQuery(`
    CREATE TABLE IF NOT EXISTS workout_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL,
      difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
      duration_weeks INTEGER,
      is_template BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Create exercises table
  await database.runQuery(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      muscle_groups TEXT NOT NULL,
      equipment TEXT,
      instructions TEXT,
      difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create workout sessions table
  await database.runQuery(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      program_id INTEGER,
      scheduled_date DATE NOT NULL,
      actual_date DATE,
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped')),
      duration_minutes INTEGER,
      notes TEXT,
      trainer_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (program_id) REFERENCES workout_programs (id)
    )
  `);

  // Create workout logs table for exercise tracking
  await database.runQuery(`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER,
      weight_kg REAL,
      duration_seconds INTEGER,
      rest_seconds INTEGER,
      notes TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    )
  `);

  // Create indexes for better performance
  await database.runQuery('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)');
  await database.runQuery('CREATE INDEX IF NOT EXISTS idx_users_type ON users (user_type)');
  await database.runQuery('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions (session_token)');
  await database.runQuery('CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions (user_id)');
  await database.runQuery('CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions (user_id)');
  await database.runQuery('CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions (scheduled_date)');

  // Insert default admin user if not exists
  const adminExists = await database.getQuery('SELECT id FROM users WHERE email = ?', ['admin@gymtracker.local']);
  
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const adminResult = await database.runQuery(
      'INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)',
      ['admin@gymtracker.local', adminPassword, 'Administrator', 'admin']
    );

    // Create admin profile
    await database.runQuery(
      'INSERT INTO user_profiles (user_id, fitness_goal, experience_level) VALUES (?, ?, ?)',
      [adminResult.id, 'Manage gym operations', 'advanced']
    );

    console.log('✅ Default admin user created: admin@gymtracker.local / admin123');
  }

  // Insert sample exercises
  const exerciseExists = await database.getQuery('SELECT id FROM exercises LIMIT 1');
  
  if (!exerciseExists) {
    const sampleExercises = [
      ['Push-ups', 'Bodyweight', 'Chest,Triceps,Shoulders', 'None', 'Start in plank position, lower body to ground, push back up', 'beginner'],
      ['Squats', 'Bodyweight', 'Quadriceps,Glutes,Hamstrings', 'None', 'Stand with feet shoulder-width apart, lower body as if sitting back', 'beginner'],
      ['Bench Press', 'Strength', 'Chest,Triceps,Shoulders', 'Barbell,Bench', 'Lie on bench, lower bar to chest, press up', 'intermediate'],
      ['Deadlift', 'Strength', 'Hamstrings,Glutes,Back,Traps', 'Barbell', 'Lift bar from ground to hip level, keep back straight', 'advanced'],
      ['Pull-ups', 'Bodyweight', 'Back,Biceps', 'Pull-up Bar', 'Hang from bar, pull body up until chin over bar', 'intermediate'],
      ['Plank', 'Core', 'Core,Shoulders', 'None', 'Hold push-up position, keep body straight', 'beginner']
    ];

    for (const exercise of sampleExercises) {
      await database.runQuery(
        'INSERT INTO exercises (name, category, muscle_groups, equipment, instructions, difficulty_level) VALUES (?, ?, ?, ?, ?, ?)',
        exercise
      );
    }

    console.log('✅ Sample exercises inserted');
  }

  console.log('✅ Database schema initialized');
}

module.exports = {
  database,
  initDatabase
};