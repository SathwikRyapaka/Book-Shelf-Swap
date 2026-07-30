import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, UserCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentUser } from './store/authSlice';
import Home from './pages/Home.jsx';
import MyListings from './pages/MyListings.jsx';
import MyClaims from './pages/MyClaims.jsx';

export const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const dispatch = useDispatch();
  const { currentUser, users } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-indigo-600 font-bold text-xl">
                  <BookOpen className="h-6 w-6" />
                  Book Swap
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                    All Books
                  </Link>
                  <Link to="/my-listings" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                    My Listings
                  </Link>
                  <Link to="/my-claims" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                    My Claims
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCircle className="h-5 w-5" />
                  <span>Viewing as:</span>
                  <select 
                    className="ml-2 block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-50"
                    value={currentUser.id}
                    onChange={(e) => {
                      dispatch(setCurrentUser(e.target.value));
                    }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-claims" element={<MyClaims />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
