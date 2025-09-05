const express = require('express');
const bcrypt = require('bcryptjs');
const { database } = require('../config/database');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await database.getQuery(
      `SELECT u.id, u.email, u.full_name, u.user_type, u.created_at, u.last_login,
              p.phone, p.date_of_birth, p.gender, p.height_cm, p.weight_kg, 
              p.fitness_goal, p.experience_level, p.medical_notes, p.emergency_contact,
              p.profile_picture_url, p.updated_at as profile_updated_at
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Structure response to match expected format
    res.json({
      id: user.id,
      email: user.email,
      profile: {
        full_name: user.full_name,
        user_type: user.user_type,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        height_cm: user.height_cm,
        weight_kg: user.weight_kg,
        fitness_goal: user.fitness_goal,
        experience_level: user.experience_level,
        medical_notes: user.medical_notes,
        emergency_contact: user.emergency_contact,
        profile_picture_url: user.profile_picture_url
      },
      created_at: user.created_at,
      last_login: user.last_login,
      profile_updated_at: user.profile_updated_at
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const {
      full_name,
      phone,
      date_of_birth,
      gender,
      height_cm,
      weight_kg,
      fitness_goal,
      experience_level,
      medical_notes,
      emergency_contact
    } = req.body;

    // Update user basic info
    if (full_name) {
      await database.runQuery(
        'UPDATE users SET full_name = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [full_name, req.user.id]
      );
    }

    // Update profile info
    await database.runQuery(
      `UPDATE user_profiles SET 
        phone = COALESCE(?, phone),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        height_cm = COALESCE(?, height_cm),
        weight_kg = COALESCE(?, weight_kg),
        fitness_goal = COALESCE(?, fitness_goal),
        experience_level = COALESCE(?, experience_level),
        medical_notes = COALESCE(?, medical_notes),
        emergency_contact = COALESCE(?, emergency_contact),
        updated_at = datetime('now')
       WHERE user_id = ?`,
      [phone, date_of_birth, gender, height_cm, weight_kg, fitness_goal, 
       experience_level, medical_notes, emergency_contact, req.user.id]
    );

    // Get updated profile
    const updatedUser = await database.getQuery(
      `SELECT u.id, u.email, u.full_name, u.user_type, u.created_at, u.last_login,
              p.phone, p.date_of_birth, p.gender, p.height_cm, p.weight_kg, 
              p.fitness_goal, p.experience_level, p.medical_notes, p.emergency_contact,
              p.profile_picture_url, p.updated_at as profile_updated_at
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      profile: {
        full_name: updatedUser.full_name,
        user_type: updatedUser.user_type,
        phone: updatedUser.phone,
        date_of_birth: updatedUser.date_of_birth,
        gender: updatedUser.gender,
        height_cm: updatedUser.height_cm,
        weight_kg: updatedUser.weight_kg,
        fitness_goal: updatedUser.fitness_goal,
        experience_level: updatedUser.experience_level,
        medical_notes: updatedUser.medical_notes,
        emergency_contact: updatedUser.emergency_contact,
        profile_picture_url: updatedUser.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get current password hash
    const user = await database.getQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const new_password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await database.runQuery(
      'UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [new_password_hash, req.user.id]
    );

    // Optionally invalidate all other sessions for security
    const authHeader = req.headers['authorization'];
    const currentToken = authHeader && authHeader.split(' ')[1];
    
    await database.runQuery(
      'UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND session_token != ? AND is_active = 1',
      [req.user.id, currentToken]
    );

    res.json({ 
      message: 'Password updated successfully',
      info: 'All other sessions have been logged out for security'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user stats (for dashboard)
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    // Get basic stats for user dashboard
    const completedWorkouts = await database.getQuery(
      'SELECT COUNT(*) as count FROM workout_sessions WHERE user_id = ? AND status = "completed"',
      [req.user.id]
    );

    const thisMonthSessions = await database.allQuery(
      `SELECT status FROM workout_sessions 
       WHERE user_id = ? AND strftime('%Y-%m', scheduled_date) = strftime('%Y-%m', 'now')`,
      [req.user.id]
    );

    const totalThisMonth = thisMonthSessions.length;
    const completedThisMonth = thisMonthSessions.filter(s => s.status === 'completed').length;
    const adherenceRate = totalThisMonth > 0 ? Math.round((completedThisMonth / totalThisMonth) * 100) : 0;

    // Get upcoming sessions count
    const upcomingSessions = await database.getQuery(
      `SELECT COUNT(*) as count FROM workout_sessions 
       WHERE user_id = ? AND scheduled_date >= date('now') AND status = 'scheduled'`,
      [req.user.id]
    );

    res.json({
      completed_workouts: completedWorkouts.count,
      adherence_rate: adherenceRate,
      upcoming_sessions: upcomingSessions.count,
      total_sessions_this_month: totalThisMonth,
      completed_this_month: completedThisMonth
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Admin only: Get all users
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', user_type = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (u.email LIKE ? OR u.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (user_type) {
      whereClause += ' AND u.user_type = ?';
      params.push(user_type);
    }

    const users = await database.allQuery(
      `SELECT u.id, u.email, u.full_name, u.user_type, u.created_at, u.last_login, u.is_active,
              p.phone, p.experience_level, p.fitness_goal
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalUsers = await database.getQuery(
      `SELECT COUNT(*) as count FROM users u ${whereClause}`,
      params
    );

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers.count,
        pages: Math.ceil(totalUsers.count / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Admin only: Get user by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await database.getQuery(
      `SELECT u.id, u.email, u.full_name, u.user_type, u.created_at, u.last_login, u.is_active,
              p.phone, p.date_of_birth, p.gender, p.height_cm, p.weight_kg, 
              p.fitness_goal, p.experience_level, p.medical_notes, p.emergency_contact,
              p.profile_picture_url, p.updated_at as profile_updated_at
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Admin only: Update user
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_type, is_active, ...profileData } = req.body;

    // Update user basic info
    if (user_type !== undefined || is_active !== undefined) {
      await database.runQuery(
        `UPDATE users SET 
          user_type = COALESCE(?, user_type),
          is_active = COALESCE(?, is_active),
          updated_at = datetime('now')
         WHERE id = ?`,
        [user_type, is_active, req.params.id]
      );
    }

    // Update profile if provided
    if (Object.keys(profileData).length > 0) {
      const fields = Object.keys(profileData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(profileData);
      
      await database.runQuery(
        `UPDATE user_profiles SET ${fields}, updated_at = datetime('now') WHERE user_id = ?`,
        [...values, req.params.id]
      );
    }

    res.json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;