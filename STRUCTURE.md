# 📁 GymTracker Project Structure

Complete directory structure and file organization for the GymTracker project.

## 🏗️ Root Directory Structure

```
gymtracker/
├── 📄 server.js                    # Main Express.js server
├── 📄 package.json                 # NPM dependencies and scripts
├── 📄 package-lock.json            # NPM lockfile (auto-generated)
├── 📄 .env                         # Environment variables (DO NOT COMMIT)
├── 📄 .env.example                 # Environment template
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Main documentation
├── 📄 INSTALL.md                   # Installation guide
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 STRUCTURE.md                 # This file
├── 📄 LICENSE                      # MIT License
├── 📄 apache_implementation_guide.md # Original implementation guide
├── 📄 apache-config-example.conf   # Apache configuration example
├── 📄 start_gymtracker.bat         # Windows startup script
│
├── 📂 config/                      # Configuration files
│   └── database.js                 # SQLite database configuration
│
├── 📂 middleware/                  # Express middleware
│   └── auth.js                     # JWT authentication middleware
│
├── 📂 routes/                      # API route handlers
│   ├── auth.js                     # Authentication endpoints
│   └── users.js                    # User management endpoints
│
├── 📂 database/                    # Database files (auto-created, git-ignored)
│   └── gymtracker.db               # SQLite database file
│
├── 📂 logs/                        # Log files (git-ignored)
│   ├── access.log
│   └── error.log
│
├── 📂 backups/                     # Database backups (git-ignored)
│   └── gymtracker-YYYY-MM-DD.db
│
├── 📂 public/                      # Frontend static files
│   ├── 📄 index.html               # Main entry point (redirects)
│   ├── 📄 .htaccess                # Apache rewrite rules
│   │
│   ├── 📂 shared/                  # Shared frontend components
│   │   ├── 📂 css/
│   │   │   └── shared.css          # Base styles and components
│   │   ├── 📂 js/
│   │   │   └── core/
│   │   │       ├── api.js          # JavaScript API client
│   │   │       └── utils.js        # Utility functions
│   │   └── 📂 components/          # Shared HTML components (future)
│   │
│   ├── 📂 utente/                  # Client interface
│   │   ├── 📄 index.html           # Login/Register page
│   │   ├── 📄 dashboard.html       # Client dashboard
│   │   ├── 📄 profilo.html         # Profile management
│   │   ├── 📄 calendario.html      # Workout calendar
│   │   ├── 📄 report.html          # Progress reports
│   │   └── 📂 css/
│   │       └── utente.css          # Client-specific styles
│   │
│   └── 📂 trainer/                 # Trainer/Admin interface
│       ├── 📄 dashboard.html       # Trainer dashboard
│       ├── 📄 clienti.html         # Client management (to be created)
│       ├── 📄 schede.html          # Workout programs (to be created)
│       ├── 📄 calendario.html      # Schedule planning (to be created)
│       ├── 📄 report.html          # Analytics (to be created)
│       └── 📂 css/
│           ├── trainer.css         # Trainer-specific styles
│           └── gestione-clienti.css # Client management styles
│
└── 📂 node_modules/                # NPM packages (git-ignored)
    └── [various packages...]
```

## 📊 Database Schema

### Tables Overview
```
users
├── id (PRIMARY KEY)
├── email (UNIQUE)
├── password_hash
├── full_name
├── user_type (standard/admin)
├── created_at
├── updated_at
├── last_login
└── is_active

user_profiles
├── id (PRIMARY KEY)
├── user_id (FOREIGN KEY → users.id)
├── phone
├── date_of_birth
├── gender
├── height_cm
├── weight_kg
├── fitness_goal
├── experience_level
├── medical_notes
├── emergency_contact
├── profile_picture_url
├── created_at
└── updated_at

user_sessions
├── id (PRIMARY KEY)
├── user_id (FOREIGN KEY → users.id)
├── session_token (UNIQUE)
├── expires_at
├── created_at
├── last_used
├── ip_address
├── user_agent
└── is_active

workout_programs
├── id (PRIMARY KEY)
├── name
├── description
├── created_by (FOREIGN KEY → users.id)
├── difficulty_level
├── duration_weeks
├── is_template
├── created_at
└── updated_at

exercises
├── id (PRIMARY KEY)
├── name
├── category
├── muscle_groups
├── equipment
├── instructions
├── difficulty_level
└── created_at

workout_sessions
├── id (PRIMARY KEY)
├── user_id (FOREIGN KEY → users.id)
├── program_id (FOREIGN KEY → workout_programs.id)
├── scheduled_date
├── actual_date
├── status (scheduled/in_progress/completed/skipped)
├── duration_minutes
├── notes
├── trainer_notes
├── created_at
└── updated_at

workout_logs
├── id (PRIMARY KEY)
├── session_id (FOREIGN KEY → workout_sessions.id)
├── exercise_id (FOREIGN KEY → exercises.id)
├── set_number
├── reps
├── weight_kg
├── duration_seconds
├── rest_seconds
├── notes
├── completed
└── created_at
```

## 🌐 API Endpoints Structure

### Authentication Routes (`/api/auth/`)
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/logout        # Single device logout
POST   /api/auth/logout-all    # All devices logout
POST   /api/auth/refresh       # Refresh JWT token
GET    /api/auth/sessions      # List user sessions
```

### User Routes (`/api/users/`)
```
GET    /api/users/me           # Current user profile
PUT    /api/users/me           # Update current user
PUT    /api/users/me/password  # Change password
GET    /api/users/me/stats     # User statistics

# Admin only
GET    /api/users              # List all users
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user (admin)
```

### Future API Routes (Planned)
```
# Workouts
GET    /api/workouts           # List workouts
POST   /api/workouts           # Create workout
GET    /api/workouts/:id       # Get workout details
PUT    /api/workouts/:id       # Update workout
DELETE /api/workouts/:id       # Delete workout

# Calendar
GET    /api/calendar/:date     # Get day schedule
POST   /api/calendar/session   # Schedule session
PUT    /api/calendar/session/:id # Update session

# Progress
GET    /api/progress/stats     # Progress statistics
GET    /api/progress/charts    # Chart data
POST   /api/progress/weight    # Log weight
POST   /api/progress/measurement # Log measurements
```

## 🎨 Frontend Architecture

### Client Interface Flow
```
utente/index.html (Login/Register)
    ↓ (Successful auth)
utente/dashboard.html
    ├── utente/profilo.html
    ├── utente/calendario.html
    └── utente/report.html
```

### Trainer Interface Flow
```
trainer/dashboard.html (Admin only)
    ├── trainer/clienti.html
    ├── trainer/schede.html
    ├── trainer/calendario.html
    └── trainer/report.html
```

### Shared Components
```
shared/js/core/api.js          # Centralized API client
shared/js/core/utils.js        # Utility functions
shared/css/shared.css          # Base styles
```

## 🔧 Configuration Files

### Environment Configuration
```
.env                    # Runtime environment (git-ignored)
.env.example           # Template for .env
```

### Apache Configuration
```
public/.htaccess              # Directory-level Apache rules
apache-config-example.conf    # Full Apache configuration
```

### Node.js Configuration
```
package.json           # Project metadata and dependencies
server.js             # Express server setup
config/database.js    # Database connection and schema
```

## 📦 Build and Deployment

### Development Files
```
node_modules/         # NPM dependencies (git-ignored)
package-lock.json     # Dependency lockfile
.env                  # Local environment (git-ignored)
database/            # Local database (git-ignored)
logs/               # Application logs (git-ignored)
```

### Production Files
```
server.js           # Main application
config/            # Configuration modules
routes/            # API routes
middleware/        # Express middleware
public/            # Static frontend files
package.json       # Dependencies list
```

### Ignored Files (`.gitignore`)
```
node_modules/      # NPM packages
database/          # Database files
.env               # Environment variables
*.log              # Log files
*.tmp              # Temporary files
.DS_Store          # macOS files
Thumbs.db          # Windows files
```

## 🔄 Data Flow

### Authentication Flow
```
1. User → Frontend → POST /api/auth/login
2. Backend → Database (verify credentials)
3. Backend → JWT creation → Database (store session)
4. Backend → Frontend (JWT token)
5. Frontend → localStorage (store token)
6. Frontend → API requests (Authorization header)
```

### User Interface Flow
```
1. Authentication check (localStorage JWT)
2. API call to /api/users/me (verify + get user data)
3. Role check (user_type: standard/admin)
4. Redirect to appropriate interface
5. Load interface-specific data
```

---

This structure provides a clear separation of concerns, scalable architecture, and maintainable codebase for the GymTracker application.