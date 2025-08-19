import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import Donations from "./components/Donations";
import HomePage from "./components/HomePage";
import NavigationBar from "./components/NavigationBar";
import Profile from "./components/Profile";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginRegister />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login-register" element={<LoginRegister />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
