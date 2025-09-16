import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  NavLink,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import LoginRegister from "./LoginRegister";
import Donations from "./components/Donations";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import ItemsPostingPage from "./components/ItemsPostingPage";
import ItemDetails from "./components/ItemDetails";
import toast from "react-hot-toast";
import NavigationBar from "./components/NavigationBar";
import ChatPage from "./components/ChatPage";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext";
import { Button } from "react-bootstrap";

// 404 Error Page Component
const NotFoundPage = () => {
  return (
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
          to={"/"}
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
};

// Protected Route Component
const ProtectedRoute = ({ children, message }) => {
  const token = localStorage.getItem("token");
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

  const hideNavbarRoutes = ["/", "/home", "/login-register"];

  // Check if current path matches any of the defined routes
  const validRoutes = [
    "/",
    "/home",
    "/login-register",
    "/donations",
    "/chat",
    "/post-item",
    "/profile",
  ];
  const isDynamicItemRoute = location.pathname.startsWith("/item/");
  const isValidRoute =
    validRoutes.includes(location.pathname) || isDynamicItemRoute;

  // Hide navbar on specific routes OR if it's a 404 page
  if (hideNavbarRoutes.includes(location.pathname) || !isValidRoute) {
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

            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
