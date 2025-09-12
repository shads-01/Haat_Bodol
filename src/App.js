import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import Donations from "./components/Donations";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import ItemsPostingPage from "./components/ItemsPostingPage";
import ItemDetails from "./components/ItemDetails";
import { Toaster } from "react-hot-toast";
import NavigationBar from "./components/NavigationBar";

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
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login-register" element={<LoginRegister />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/post-item" element={<ItemsPostingPage />}/>
          <Route path="/profile" element={<Profile />} />
          <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
