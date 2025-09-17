import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  NavLink,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "react-bootstrap";
import LoginRegister from "./LoginRegister";
import Donations from "./components/Donations";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import ItemsPostingPage from "./components/ItemsPostingPage";
import ItemDetails from "./components/ItemDetails";
import ChatPage from "./components/ChatPage";
import NavigationBar from "./components/NavigationBar";
import DonorProfile from "./components/DonorProfile";
import { NotificationProvider } from "./context/NotificationContext";

// 404 Error Page
const NotFoundPage = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      padding: "20px",
    }}
  >
    <h1 style={{ fontSize: "4rem", color: "tomato", marginBottom: "20px" }}>
      404
    </h1>
    <h2 style={{ fontSize: "2rem", marginBottom: "20px", color: "#333" }}>
      Page Not Found
    </h2>
    <p style={{ fontSize: "1.2rem", marginBottom: "30px", color: "#666" }}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div>
      <Button
        as={NavLink}
        to="/"
        variant="warning"
        className="p-3 fw-600 fs-6 me-2"
      >
        Go to Home
      </Button>
      <Button
        as={NavLink}
        onClick={() => window.history.back()}
        variant="secondary"
        className="p-3 fw-600 fs-6 me-2"
      >
        Go Back
      </Button>
    </div>
  </div>
);

// Protected Route
const ProtectedRoute = ({ children, message }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!token && !toastShown.current) {
      toast.error(message || "You must be logged in to access this page");
      toastShown.current = true;
    }
    if (token) toastShown.current = false;
  }, [token, message]);

  if (!token)
    return <Navigate to="/login-register" state={{ from: location }} replace />;
  return children;
};

// Conditional Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Routes where navbar should be hidden
  const hideRoutes = ["/", "/home", "/login-register"];
  const isItemRoute = pathname.startsWith("/item/");
  const isDonorRoute = pathname.startsWith("/donor/");

  // Hide navbar if exact hide route OR 404
  if (hideRoutes.includes(pathname)) return null;
  if (
    !["/donations", "/chat", "/post-item", "/profile"].includes(pathname) &&
    !isItemRoute &&
    !isDonorRoute
  ) {
    return null;
  }
  return <NavigationBar />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <NotificationProvider>
          <ConditionalNavbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login-register" element={<LoginRegister />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/chat" element={<ChatPage />} />

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
            <Route
              path="/donor/:id"
              element={
                <ProtectedRoute message="You must be logged in to view the donor profile">
                  <DonorProfile />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
