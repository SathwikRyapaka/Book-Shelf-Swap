const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      condition TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      claimed_by_id TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES users(id),
      FOREIGN KEY(claimed_by_id) REFERENCES users(id)
    );
  `);
  
  // Seed basic users for testing
  await db.exec(`
    INSERT OR IGNORE INTO users (id, name) VALUES ('user1', 'Alice');
    INSERT OR IGNORE INTO users (id, name) VALUES ('user2', 'Bob');
    INSERT OR IGNORE INTO users (id, name) VALUES ('user3', 'Charlie');
  `);
})();

// -- Endpoints --

// Get all available books
app.get('/api/books', async (req, res) => {
  try {
    // We want to fetch all books that are available, including owner's name
    const books = await db.all(`
      SELECT b.*, u.name as owner_name 
      FROM books b 
      JOIN users u ON b.owner_id = u.id 
      WHERE b.status = 'available'
      ORDER BY b.created_at DESC
    `);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Create a new book listing
app.post('/api/books', async (req, res) => {
  const { title, subject, condition, owner_id } = req.body;
  if (!title || !subject || !condition || !owner_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Ensure the user exists (just a safety check for our mock system)
    const user = await db.get('SELECT id FROM users WHERE id = ?', [owner_id]);
    if (!user) {
       // Auto-create user if they don't exist for ease of testing
       await db.run('INSERT INTO users (id, name) VALUES (?, ?)', [owner_id, owner_id]);
    }

    const result = await db.run(
      'INSERT INTO books (title, subject, condition, owner_id) VALUES (?, ?, ?, ?)',
      [title, subject, condition, owner_id]
    );
    const newBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create book listing' });
  }
});

// Claim a book
app.post('/api/books/:id/claim', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required to claim a book' });
  }

  try {
    // Basic ownership check & single-claim state transition lock
    // Fetch the current book state before trying to update.
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.status === 'claimed') return res.status(400).json({ error: 'Book is already claimed' });
    if (book.owner_id === user_id) return res.status(400).json({ error: 'You cannot claim your own book' });
    
    // We include 'status = "available"' in the WHERE clause for atomic update in case of concurrency
    const result = await db.run(
      'UPDATE books SET status = ?, claimed_by_id = ? WHERE id = ? AND status = ?',
      ['claimed', user_id, id, 'available']
    );
    
    if (result.changes === 0) {
      return res.status(400).json({ error: 'Failed to claim book. It may have just been claimed by someone else.' });
    }
    
    // Fetch the updated book
    const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim book' });
  }
});

// Get "My Listings"
app.get('/api/users/:userId/listings', async (req, res) => {
  const { userId } = req.params;
  try {
    const listings = await db.all(
      'SELECT * FROM books WHERE owner_id = ? ORDER BY created_at DESC', 
      [userId]
    );
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get "My Claims"
app.get('/api/users/:userId/claims', async (req, res) => {
  const { userId } = req.params;
  try {
    const claims = await db.all(
      'SELECT b.*, u.name as owner_name FROM books b JOIN users u ON b.owner_id = u.id WHERE b.claimed_by_id = ? ORDER BY b.created_at DESC', 
      [userId]
    );
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Delete a book listing (only if available)
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  // Use a query parameter for this simple app to simulate authentication
  const user_id = req.query.user_id; 

  try {
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.owner_id !== user_id) return res.status(403).json({ error: 'Unauthorized to delete this listing' });
    if (book.status === 'claimed') return res.status(400).json({ error: 'Cannot delete a claimed book' });
    
    await db.run('DELETE FROM books WHERE id = ?', [id]);
    res.json({ message: 'Book listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.listen(PORT, () => {
  // We keep one setup log message
  console.log(\`Server is running on port \${PORT}\`);
});
