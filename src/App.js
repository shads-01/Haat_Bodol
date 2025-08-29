import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import Donations from "./components/Donations";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import ItemsPostingPage from "./components/ItemsPostingPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login-register" element={<LoginRegister />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/post-item" element={<ItemsPostingPage />}/>
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
