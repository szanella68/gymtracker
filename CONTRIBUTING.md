# 🤝 Contributing to GymTracker

Thank you for your interest in contributing to GymTracker! This document provides guidelines for contributing to the project.

## 📋 Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- Git
- Apache HTTP Server (for full testing)
- Basic knowledge of JavaScript, HTML/CSS, SQL

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gymtracker.git
   cd gymtracker
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment file:
   ```bash
   cp .env.example .env
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## 📝 Contributing Guidelines

### Types of Contributions
We welcome these types of contributions:

- **🐛 Bug Fixes**: Fix existing issues
- **✨ New Features**: Add new functionality
- **📚 Documentation**: Improve docs, comments, guides
- **🎨 UI/UX**: Improve user interface and experience
- **⚡ Performance**: Optimize code performance
- **🔒 Security**: Security improvements
- **♿ Accessibility**: Make app more accessible
- **🌍 Internationalization**: Add language support

### Before You Start
1. Check existing [issues](https://github.com/szanella68/gymtracker/issues)
2. Look for `good first issue` or `help wanted` labels
3. Comment on the issue if you want to work on it
4. For major changes, open a discussion first

## 💻 Code Standards

### JavaScript
- Use ES6+ features
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Handle errors properly

**Example:**
```javascript
// Good
async function getUserProfile(userId) {
  try {
    const user = await database.getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Avoid
function getUser(id) {
  return database.getQuery('SELECT * FROM users WHERE id = ?', [id]);
}
```

### HTML/CSS
- Use semantic HTML5 elements
- Follow existing CSS class naming conventions
- Mobile-first responsive design
- Accessibility attributes (alt, aria-label, etc.)

### Database
- Use prepared statements
- Add proper indexes
- Include migration scripts for schema changes
- Document database changes

## 🧪 Testing

### Manual Testing
Before submitting:
1. Test authentication flow
2. Test both client and trainer interfaces
3. Verify mobile responsiveness
4. Test with different user roles
5. Check error handling

### Future: Automated Testing
We plan to add automated tests. Contributors are welcome to help set up:
- Unit tests for API endpoints
- Integration tests for database operations
- Frontend tests for user interactions

## 🔀 Pull Request Process

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number-description
```

### 2. Make Your Changes
- Follow code standards
- Add/update documentation
- Test your changes thoroughly
- Keep commits atomic and well-described

### 3. Commit Guidelines
Use conventional commits:
```bash
git commit -m "feat: add workout calendar for clients"
git commit -m "fix: resolve authentication token expiry issue"
git commit -m "docs: update installation guide"
git commit -m "style: improve mobile responsiveness"
```

Types:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Create a pull request with:
- Clear title and description
- Reference related issues
- Screenshots for UI changes
- Testing notes

### 5. PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other: ___

## Testing
- [ ] Tested locally
- [ ] Manual testing completed
- [ ] No breaking changes

## Screenshots (if applicable)

## Additional Notes
```

## 🏗️ Project Structure

Understanding the codebase:
```
gymtracker/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env.example           # Environment template
├── 
├── config/
│   └── database.js        # SQLite configuration
├── routes/
│   ├── auth.js           # Authentication API
│   └── users.js          # User management API
├── middleware/
│   └── auth.js           # JWT middleware
├── public/               # Frontend files
│   ├── utente/          # Client interface
│   ├── trainer/         # Trainer interface
│   └── shared/          # Shared components
└── database/            # SQLite database (auto-created)
```

## 🎯 Priority Areas

We especially welcome contributions in:

1. **📱 Mobile Optimization**
   - Better mobile navigation
   - Touch-friendly interactions
   - Progressive Web App features

2. **📊 Analytics & Reporting**
   - Advanced progress charts
   - Export functionality
   - Data visualization

3. **🔔 Notifications**
   - Workout reminders
   - Goal achievements
   - Trainer-client messaging

4. **🌍 Internationalization**
   - Multi-language support
   - Date/number formatting
   - RTL language support

5. **♿ Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast themes

## 🚫 What Not to Contribute

Please avoid:
- Breaking changes without discussion
- Adding large dependencies without justification
- Copying code from other projects without proper licensing
- Changes that compromise security
- Features that significantly increase complexity

## 📞 Getting Help

Need help contributing?

- **Discord**: [Join our Discord](#) (coming soon)
- **Issues**: Ask questions in GitHub Issues
- **Email**: Contact maintainers directly for sensitive matters

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Invited to become maintainers (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License as the project.

---

**Thank you for making GymTracker better! 🏋️‍♀️💪**