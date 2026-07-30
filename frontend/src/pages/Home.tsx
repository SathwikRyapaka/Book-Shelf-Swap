import { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, User } from '../types';
import { API_BASE_URL } from '../App';

interface HomeProps {
  currentUser: User;
}

export default function Home({ currentUser }: HomeProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/books`);
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch available books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleClaim = async (bookId: number) => {
    try {
      setError(null);
      await axios.post(`${API_BASE_URL}/books/${bookId}/claim`, { user_id: currentUser.id });
      // Remove the claimed book from the available list
      setBooks(books.filter(b => b.id !== bookId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to claim the book.');
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading books...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Textbooks</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {books.length === 0 ? (
        <p className="text-gray-500">No books available at the moment. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
              <div className="px-4 py-5 sm:p-6 flex-grow">
                <h3 className="text-lg leading-6 font-medium text-gray-900 truncate" title={book.title}>{book.title}</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p><strong>Subject:</strong> {book.subject}</p>
                  <p><strong>Condition:</strong> {book.condition}</p>
                  <p><strong>Offered by:</strong> {book.owner_name || book.owner_id}</p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <button
                  onClick={() => handleClaim(book.id)}
                  disabled={book.owner_id === currentUser.id}
                  className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    book.owner_id === currentUser.id
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {book.owner_id === currentUser.id ? 'Your Listing' : 'Claim Book'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
