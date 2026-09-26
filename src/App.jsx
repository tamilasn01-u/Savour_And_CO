import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Stats from "./components/Stats";
import WAButton from "./components/WAButton";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ChefsPage from "./pages/ChefsPage";
import ChefDetailPage from "./pages/ChefDetailPage";
import MenusPage from "./pages/MenusPage";
import BookingPage from "./pages/BookingPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminPanel from "./pages/AdminPanel";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #FDFAF5; font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; }
  input, select, textarea, button { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fade-up { animation: fadeUp 0.7s ease forwards; }
  .fade-in { animation: fadeIn 0.5s ease forwards; }
`;


// ── App ──
export default function App() {
  return (
    <Router>
      <style>{globalStyles}</style>
      <Nav />
      <Routes>
        <Route path="/" element={<><HomePage /><Stats /></>} />
        <Route path="/how" element={<HowItWorksPage />} />
        <Route path="/chefs" element={<ChefsPage />} />
        <Route path="/chef/:chefId" element={<ChefDetailPage />} />
        <Route path="/menus" element={<MenusPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
      <WAButton />
    </Router>
  );
}
