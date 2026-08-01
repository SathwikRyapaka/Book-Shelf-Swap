import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setListings, setLoading, setError, addListing, removeListing } from '../store/listingsSlice';
import { API_BASE_URL } from '../App.jsx';

export default function MyListings() {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state) => state.listings);
  const { currentUser } = useSelector((state) => state.auth);

  // Local state for the form inputs
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [condition, setCondition] = useState('Good');

  useEffect(() => {
    const fetchListings = async () => {
      dispatch(setLoading(true));
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${currentUser.id}/listings`);
        dispatch(setListings(response.data));
        dispatch(setLoading(false));
      } catch (err) {
        dispatch(setError('Failed to fetch your listings.'));
        dispatch(setLoading(false));
      }
    };

    fetchListings();
  }, [dispatch, currentUser.id]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      dispatch(setError(null));
      const response = await axios.post(`${API_BASE_URL}/books`, {
        title,
        subject,
        condition,
        owner_id: currentUser.id
      });
      dispatch(addListing(response.data));
      setTitle('');
      setSubject('');
      setCondition('Good');
    } catch (err) {
      dispatch(setError(err.response?.data?.error || 'Failed to add book.'));
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(setError(null));
      await axios.delete(`${API_BASE_URL}/books/${id}?user_id=${currentUser.id}`);
      dispatch(removeListing(id));
    } catch (err) {
      dispatch(setError(err.response?.data?.error || 'Failed to delete book.'));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add New Book Form */}
      <div className="bg-white shadow rounded-lg mb-8 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">List a New Textbook</h2>
        <form onSubmit={handleAddBook} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition</label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Listing
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center mt-10">Loading your listings...</div>
      ) : books.length === 0 ? (
        <p className="text-gray-500">You haven't listed any books yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
              <div className="px-4 py-5 sm:p-6 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 truncate" title={book.title}>{book.title}</h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {book.status}
                  </span>
                </div>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p><strong>Subject:</strong> {book.subject}</p>
                  <p><strong>Condition:</strong> {book.condition}</p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <button
                  onClick={() => handleDelete(book.id)}
                  disabled={book.status === 'claimed'}
                  className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    book.status === 'claimed'
                      ? 'bg-red-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {book.status === 'claimed' ? 'Cannot Delete (Claimed)' : 'Delete Listing'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
