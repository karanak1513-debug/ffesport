import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tournaments from './pages/Tournaments';
import Leaderboard from './pages/Leaderboard';
import TournamentDetails from './pages/TournamentDetails';
import MatchRoom from './pages/MatchRoom';
import AdminPanel from './pages/AdminPanel';
import AdminTutorial from './pages/AdminTutorial';
import HowToPlay from './pages/HowToPlay';
import Login from './pages/Login';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import './App.css';

// Protected Route Component for Admin Area
const AdminRoute = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <div className="loading-screen text-center p-5">Loading Admin Access...</div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/tournament/:id" element={<TournamentDetails />} />
            <Route path="/match-room/:id" element={<MatchRoom />} />
            <Route path="/login" element={<Login />} />

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

            <Route path="/how-to-play" element={<HowToPlay />} />
            {/* Other routes will be added here */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
