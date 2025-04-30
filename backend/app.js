const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    return console.error('Database connection error:', err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create tables and insert sample data
function initializeDatabase() {
  db.serialize(() => {
    // Create Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating Users table:', err);
      } else {
        console.log('Users table created/verified');
        
        // Insert sample users (only if table was empty)
        db.get("SELECT COUNT(*) as count FROM Users", (err, row) => {
          if (err) {
            console.error('Error checking Users table:', err);
            return;
          }
          
          if (row.count === 0) {
            const sampleUsers = [
              ['john_doe', 'john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H9Q.rX5Z8X.E3F/6Z7JYQ8TjWOW'], // password: "password123"
              ['jane_smith', 'jane@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H9Q.rX5Z8X.E3F/6Z7JYQ8TjWOW']  // password: "password123"
            ];
            
            const stmt = db.prepare("INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)");
            
            sampleUsers.forEach(user => {
              stmt.run(user, (err) => {
                if (err) {
                  console.error('Error inserting user:', err);
                }
              });
            });
            
            stmt.finalize();
            console.log('Inserted sample users');
          }
        });
      }
    });
  });
}

// Initialize database
initializeDatabase();

// Middleware
app.use(express.json());

// Basic route to test users
app.get('/users', (req, res) => {
  db.all("SELECT id, username, email FROM Users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close database connection when app exits
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});