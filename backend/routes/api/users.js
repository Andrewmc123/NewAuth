// backend/routes/api/users.js
const express = require('express');
const router = express.Router();

// Add your user routes here
router.get('/', (req, res) => {
  res.json({ message: 'Users route' });
});

module.exports = router;