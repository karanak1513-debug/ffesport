import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Tournaments from './pages/Tournaments';
import Leaderboard from './pages/Leaderboard';
import TournamentDetails from './pages/TournamentDetails';
import MatchRoom from './pages/MatchRoom';
import AdminPanel from './pages/AdminPanel';
import AdminTutorial from './pages/AdminTutorial';
import HowToPlay from './pages/HowToPlay';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreatorPanel from './pages/CreatorPanel';
import SocialPromo from './components/SocialPromo';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { useAuth } from './context/AuthContext';
import './App.css';

// Protected Route for any authenticated user
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

// Protected Route for Admin only
const AdminRoute = ({ children }) => {
  const { isAdmin, isLoading, currentUser } = useAuth();
  if (isLoading) return <div className="loading-screen text-center p-5">Loading Admin Access...</div>;
  if (!currentUser || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};


function App() {
  return (
    <Router>
      <div className="app-container">
        <SocialPromo />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/tournament/:id" element={<TournamentDetails />} />
            <Route path="/match-room/:id" element={<MatchRoom />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/how-to-play" element={<HowToPlay />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Creator Panel — any logged-in user can manage their own tournaments */}
            <Route path="/creator" element={
              <ProtectedRoute>
                <CreatorPanel />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            <Route path="/admin/tutorial" element={
              <AdminRoute>
                <AdminTutorial />
              </AdminRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
