import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import Donations from "./components/Donations";
import HomePage from "./components/HomePage";
import NavigationBar from "./components/NavigationBar";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/home" element={<HomePage />}/>
          <Route path="/login-register" element={<LoginRegister />}></Route>
          <Route path="/donations" element={<Donations />}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
