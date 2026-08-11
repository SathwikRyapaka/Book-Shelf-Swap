const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookshelf';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log(`Successfully connected to MongoDB at ${MONGO_URI}`))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Mongoose Schema and Model
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  condition: { type: String, required: true },
  owner_id: { type: String, required: true },
  claimed_by_id: { type: String, default: null },
  status: { type: String, enum: ['available', 'claimed'], default: 'available' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Virtual for id mapping since frontend expects 'id' and Mongo uses '_id'
bookSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Book = mongoose.model('Book', bookSchema);

// In our mocked system, we don't have a real users table, so we just pass names from the frontend.
const MOCK_USERS = {
  'user1': 'Sathwik',
  'user2': 'Revan',
  'user3': 'Rohit'
};

// -- Endpoints --

// Get all available books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find({ status: 'available' }).sort({ created_at: -1 });
    
    // Attach owner_name from mock
    const booksWithNames = books.map(book => {
      const bookObj = book.toJSON();
      bookObj.owner_name = MOCK_USERS[bookObj.owner_id] || bookObj.owner_id;
      return bookObj;
    });
    
    res.json(booksWithNames);
  } catch (error) {
    console.error('Error fetching books:', error);
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
    const newBook = await Book.create({
      title,
      subject,
      condition,
      owner_id,
      claimed_by_id: null,
      status: 'available'
    });
    
    const bookObj = newBook.toJSON();
    bookObj.owner_name = MOCK_USERS[owner_id] || owner_id;
    
    res.status(201).json(bookObj);
  } catch (error) {
    console.error('Error creating book:', error);
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
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.status === 'claimed') return res.status(400).json({ error: 'Book is already claimed' });
    if (book.owner_id === user_id) return res.status(400).json({ error: 'You cannot claim your own book' });
    
    // Use findOneAndUpdate with status condition to ensure atomicity and prevent race conditions
    const updatedBook = await Book.findOneAndUpdate(
      { _id: id, status: 'available' },
      { status: 'claimed', claimed_by_id: user_id },
      { new: true }
    );
    
    if (!updatedBook) {
      return res.status(400).json({ error: 'Failed to claim book. It may have just been claimed by someone else.' });
    }
    
    res.json(updatedBook.toJSON());
  } catch (error) {
    console.error('Error claiming book:', error);
    res.status(500).json({ error: 'Failed to claim book' });
  }
});

// Get "My Listings"
app.get('/api/users/:userId/listings', async (req, res) => {
  const { userId } = req.params;
  try {
    const listings = await Book.find({ owner_id: userId }).sort({ created_at: -1 });
    res.json(listings.map(l => l.toJSON()));
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get "My Claims"
app.get('/api/users/:userId/claims', async (req, res) => {
  const { userId } = req.params;
  try {
    const claims = await Book.find({ claimed_by_id: userId }).sort({ created_at: -1 });
    
    const claimsWithNames = claims.map(book => {
      const bookObj = book.toJSON();
      bookObj.owner_name = MOCK_USERS[bookObj.owner_id] || bookObj.owner_id;
      return bookObj;
    });
    
    res.json(claimsWithNames);
  } catch (error) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Delete a book listing (only if available)
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const user_id = req.query.user_id; 

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.owner_id !== user_id) return res.status(403).json({ error: 'Unauthorized to delete this listing' });
    if (book.status === 'claimed') return res.status(400).json({ error: 'Cannot delete a claimed book' });
    
    await Book.findByIdAndDelete(id);
    res.json({ message: 'Book listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
