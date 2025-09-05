# 🚀 GymTracker - Installation Guide

Complete installation guide for the GymTracker dual-interface fitness management system.

## 📋 Prerequisites

### Required Software
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **Apache HTTP Server** with modules:
  - `mod_rewrite`
  - `mod_proxy` 
  - `mod_proxy_http`
  - `mod_headers`
  - `mod_expires`
  - `mod_deflate`
- **Git** (for cloning repository)

### System Requirements
- **Windows** (primary), Linux/macOS (adaptable)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB for application + database
- **Network**: HTTPS-enabled web server (recommended)

## 📥 Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/szanella68/gymtracker.git
cd gymtracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy and edit the environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Server Configuration
PORT=3007
NODE_ENV=production

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Database
DATABASE_PATH=./database/gymtracker.db

# CORS Origins (adjust for your domain)
FRONTEND_URL=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Apache Configuration

#### Option A: Include Configuration
Add to your Apache `httpd.conf`:
```apache
Include "C:/path/to/gymtracker/apache-config-example.conf"
```

#### Option B: Manual Configuration
Add these lines to your Apache configuration:

```apache
# Load required modules
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
LoadModule expires_module modules/mod_expires.so

# GymTracker Alias
Alias /gymtracker "C:/path/to/gymtracker/public"

<Directory "C:/path/to/gymtracker/public">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

# API Reverse Proxy
ProxyPreserveHost On
ProxyPass /gymtracker/api/ http://localhost:3007/api/
ProxyPassReverse /gymtracker/api/ http://localhost:3007/api/
```

### 5. Database Setup
The database will be created automatically on first run with:
- Default admin user: `admin@gymtracker.local` / `admin123`
- Sample exercises and schema

### 6. File Permissions
Ensure proper permissions (Linux/macOS):
```bash
chmod +x start_gymtracker.bat  # If on Windows with WSL
chmod 755 public/
chmod 644 public/*
chmod 755 database/  # Will be created automatically
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Windows Quick Start
```cmd
start_gymtracker.bat
```

This script will:
1. Check Node.js installation
2. Install dependencies
3. Start Apache (if configured)
4. Launch Node.js backend
5. Open browser to the application

## 🔗 Access URLs

After successful installation:

| Interface | URL | Description |
|-----------|-----|-------------|
| **Main Login** | `https://your-domain.com/gymtracker/` | Unified login page |
| **Client Dashboard** | `https://your-domain.com/gymtracker/utente/dashboard.html` | Client interface |
| **Trainer Dashboard** | `https://your-domain.com/gymtracker/trainer/dashboard.html` | Admin interface |
| **API Health** | `http://localhost:3007/api/health` | Backend status |

## 🔧 Configuration Options

### SSL/HTTPS Setup
For production, configure HTTPS in Apache:

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot "C:/path/to/your/webroot"
    
    SSLEngine on
    SSLCertificateFile "path/to/certificate.crt"
    SSLCertificateKeyFile "path/to/private.key"
    
    # Include GymTracker configuration
    Include "C:/path/to/gymtracker/apache-config-example.conf"
</VirtualHost>
```

### Custom Port
To change the Node.js port, update both:
1. `.env` file: `PORT=3008`
2. Apache config: Update proxy URLs to match

### Database Location
To use a different database location:
```env
DATABASE_PATH=/custom/path/gymtracker.db
```

## 👥 User Management

### Default Accounts
- **Admin**: `admin@gymtracker.local` / `admin123`
  - Full access to trainer interface
  - Can manage all clients
  - Can create new users

### Creating Additional Admins
1. Register new user through interface (becomes standard client)
2. Manually update database:
```sql
UPDATE users SET user_type = 'admin' WHERE email = 'trainer@example.com';
```

Or use the admin interface to create new clients and then promote them.

## 🐛 Troubleshooting

### Common Issues

**Node.js not found**
```bash
# Install Node.js from https://nodejs.org/
node --version  # Should show v16+
```

**Apache modules missing**
```apache
# Enable in httpd.conf
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

**CORS errors**
- Check `FRONTEND_URL` in `.env` matches your domain
- Verify Apache CORS headers are configured
- Test with browser dev tools Network tab

**Database locked**
```bash
# Stop Node.js process and restart
pkill -f node
npm start
```

**API 404 errors**
- Verify Apache proxy configuration
- Check Node.js is running on correct port
- Test API directly: `curl http://localhost:3007/api/health`

### Debug Mode
Run with debug logging:
```bash
DEBUG=* npm run dev
```

### Log Files
Check logs in:
- Node.js console output
- Apache error logs
- Browser developer console

## 🔄 Updates

### Pulling Updates
```bash
git pull origin main
npm install  # Install any new dependencies
```

### Database Migrations
Future updates may require database migrations. Check release notes for any required SQL updates.

## 📞 Support

### Issues
Report issues at: [GitHub Issues](https://github.com/szanella68/gymtracker/issues)

### Documentation
Full documentation: [README.md](README.md)

### Community
- Discussions: GitHub Discussions
- Wiki: GitHub Wiki (coming soon)

## 🔐 Security Notes

### Production Checklist
- [ ] Change default JWT_SECRET
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Set up regular backups
- [ ] Configure firewall rules
- [ ] Update CORS origins
- [ ] Set NODE_ENV=production
- [ ] Regular security updates

### Backup Strategy
```bash
# Backup database
cp database/gymtracker.db backups/gymtracker-$(date +%Y%m%d).db

# Backup configuration
cp .env backups/.env-backup-$(date +%Y%m%d)
```

---

**🎉 Installation Complete!**

Your GymTracker installation should now be ready. Visit the main URL to start using the application.