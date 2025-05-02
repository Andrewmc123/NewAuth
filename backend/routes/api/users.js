const express = require('express');
const bcrypt = require('bcryptjs');              // For password hashing

const { setTokenCookie, requireAuth } = require('../../utils/auth');  // Auth utilities
const { User } = require('../../db/models');     // User model

const router = express.Router();

// Sign up
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;  // Extract new fields
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({ 
      email, 
      username, 
      hashedPassword,
      firstName,                                 // Include firstName
      lastName                                   // Include lastName
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,                 // Include in response
      lastName: user.lastName                    // Include in response
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

module.exports = router;