const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { setUserAdmin, getUserAdmin, listAdminUsers } = require('../utils/admin');

const router = express.Router();

// List all admin users
router.get('/admins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const admins = await listAdminUsers();
    res.json({ admins });
  } catch (error) {
    console.error('List admins error:', error);
    res.status(500).json({ error: 'Failed to list admins' });
  }
});

// Set admin status for a user
router.put('/users/:userId/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { admin } = req.body;
    
    if (typeof admin !== 'boolean') {
      return res.status(400).json({ error: 'admin field must be boolean' });
    }

    // Prevent users from removing their own admin status
    if (!admin && userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove your own admin privileges' });
    }

    const success = await setUserAdmin(userId, admin);
    if (success) {
      res.json({ 
        message: `User ${admin ? 'promoted to' : 'demoted from'} admin successfully`,
        userId,
        admin
      });
    } else {
      res.status(500).json({ error: 'Failed to update admin status' });
    }
  } catch (error) {
    console.error('Set admin error:', error);
    res.status(500).json({ error: 'Failed to set admin status' });
  }
});

// Get admin status for a user
router.get('/users/:userId/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminStatus = await getUserAdmin(userId);
    
    if (adminStatus === null) {
      return res.status(500).json({ error: 'Failed to get admin status' });
    }
    
    res.json({ userId, admin: adminStatus });
  } catch (error) {
    console.error('Get admin status error:', error);
    res.status(500).json({ error: 'Failed to get admin status' });
  }
});

module.exports = router;