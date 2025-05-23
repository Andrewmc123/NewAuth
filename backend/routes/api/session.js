const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

// Login validation middleware
const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

// Login route
router.post('/', validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  try {
    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: {
          username: credential,
          email: credential
        }
      }
    });

    // Validate credentials
    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      const err = new Error('Login failed');
      err.status = 401;
      err.title = 'Login failed';
      err.errors = { credential: 'The provided credentials were invalid.' };
      return next(err);
    }

    // Prepare safe user object
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    };

    // Set authentication cookie
    await setTokenCookie(res, safeUser);

    // Return user data
    return res.json({
      user: safeUser
    });

  } catch (error) {
    next(error);
  }
});

// Session restoration route
router.get('/', (req, res) => {
  const { user } = req;
  
  if (user) {
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    };
    return res.json({ user: safeUser });
  }
  
  return res.json({ user: null });
});

module.exports = router;