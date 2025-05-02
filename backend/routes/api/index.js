const router = require('express').Router();            // Create main API router
const sessionRouter = require('./session.js');         // Import session router
const usersRouter = require('./users.js');             // Import users router
const { restoreUser } = require("../../utils/auth.js"); // Import auth middleware

// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);                               // Apply restoreUser to all API routes

router.use('/session', sessionRouter);                 // Mount session router at /api/session
router.use('/users', usersRouter);                     // Mount users router at /api/users

router.post('/test', (req, res) => {                   // Test route (can be removed later)
  res.json({ requestBody: req.body });
});
// GET /api/set-token-cookie
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({                // Find the demo user
    where: {
      username: 'Demo-lition'
    }
  });
  setTokenCookie(res, user);                      // Set a JWT cookie for this user
  return res.json({ user: user });                // Return the user in the response
});

// GET /api/restore-user
const { restoreUser } = require('../../utils/auth.js');

router.use(restoreUser);                          // Apply restoreUser middleware to all routes

router.get(
  '/restore-user',
  (req, res) => {
    return res.json(req.user);                    // Return the current user from the request
  }
);

// GET /api/require-auth
const { requireAuth } = require('../../utils/auth.js');
router.get(
  '/require-auth',
  requireAuth,                                    // Apply requireAuth middleware to this route
  (req, res) => {
    return res.json(req.user);                    // Return the authenticated user
  }
);
module.exports = router;   