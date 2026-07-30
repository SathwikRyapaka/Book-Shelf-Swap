import { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, User } from '../types';
import { API_BASE_URL } from '../App';

interface MyClaimsProps {
  currentUser: User;
}

export default function MyClaims({ currentUser }: MyClaimsProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/users/${currentUser.id}/claims`);
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch your claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClaims();
  }, [currentUser.id]);

  if (loading) {
    return <div className="text-center mt-10">Loading your claims...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Claimed Textbooks</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {books.length === 0 ? (
        <p className="text-gray-500">You haven't claimed any books yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
              <div className="px-4 py-5 sm:p-6 flex-grow">
                <h3 className="text-lg leading-6 font-medium text-gray-900 truncate" title={book.title}>{book.title}</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p><strong>Subject:</strong> {book.subject}</p>
                  <p><strong>Condition:</strong> {book.condition}</p>
                  <p><strong>Claimed from:</strong> {book.owner_name || book.owner_id}</p>
                </div>
              </div>
              <div className="bg-green-50 px-4 py-4 sm:px-6 flex items-center justify-center text-green-700 font-medium text-sm">
                Successfully Claimed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
