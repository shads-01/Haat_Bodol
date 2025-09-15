import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import LoginRegister from "./LoginRegister";
import Donations from "./components/Donations";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import ItemsPostingPage from "./components/ItemsPostingPage";
import ItemDetails from "./components/ItemDetails";
import { Toaster } from "react-hot-toast";
import NavigationBar from "./components/NavigationBar";

// Protected Route Component
const ProtectedRoute = ({ children, message }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!token && !toastShown.current) {
      if (message) {
        toast.error(message);
      } else {
        toast.error("You must be logged in to access this page");
      }
      toastShown.current = true;
    }
    if (token) {
      toastShown.current = false;
    }
  }, [token, message]);

  if (!token) {
    return <Navigate to="/login-register" state={{ from: location }} replace />;
  }
  return children;
};

const ConditionalNavbar = () => {
  const location = useLocation();
  
  const hideNavbarRoutes = ['/', '/home', '/login-register'];
  
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }
  return <NavigationBar />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <ConditionalNavbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login-register" element={<LoginRegister />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          
          {/* Protected routes */}
          <Route 
            path="/post-item" 
            element={
              <ProtectedRoute message="You must be logged in to post items">
                <ItemsPostingPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute message="You must be logged in to view your profile">
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}
export default App;