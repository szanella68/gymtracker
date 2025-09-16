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

### 3. Environment Configuration (Supabase)
Copy and edit the environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings (Supabase mode):
```env
# Server
PORT=3010
NODE_ENV=production
AUTH_PROVIDER=supabase
DB_PROVIDER=supabase

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional for schema bootstrap (service role connection string)
# DATABASE_URL=postgresql://postgres:password@HOST:PORT/postgres?options=project%3Dyourproject

# Frontend
FRONTEND_URL=https://your-domain.com
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
ProxyPass /gymtracker/api/ http://localhost:3010/api/
ProxyPassReverse /gymtracker/api/ http://localhost:3010/api/
```

### 5. Database Setup (Supabase)
If `DATABASE_URL` is provided, the server ensures the `user_profiles` table exists on Supabase. Admin accounts are managed via Supabase (e.g., set user metadata `user_type=admin`).

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
start_server.bat
```

This script will open two windows:
1. Apache (if available)
2. GymTracker backend (auto-install dependencies if missing)
Then it opens the browser to the app.

## 🔗 Access URLs

After successful installation:

| Interface | URL | Description |
|-----------|-----|-------------|
| **Main Login** | `https://your-domain.com/gymtracker/` | Unified login page |
| **Client Dashboard** | `https://your-domain.com/gymtracker/utente/dashboard.html` | Client interface |
| **Trainer Dashboard** | `https://your-domain.com/gymtracker/trainer/dashboard.html` | Admin interface |
| **API Health** | `http://localhost:3010/api/health` | Backend status |

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
Non applicabile in modalità Supabase.

## 👥 User Management

### Admin Accounts
- Gli admin sono gestiti da Supabase: imposta `user_type=admin` nei metadata dell'utente.
- I nuovi utenti sono `standard` per impostazione predefinita.

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
- Test API directly: `curl http://localhost:3010/api/health`

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
# Backup configuration
cp .env backups/.env-backup-$(date +%Y%m%d)
```

---

**🎉 Installation Complete!**

Your GymTracker installation should now be ready. Visit the main URL to start using the application.
