import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import User from "./pages/User";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. The unified landing page */}
        <Route path="/" element={<Home />} />

       {/* 2. The Player Route */}
        <Route path="/play" element={<User />} />

       {/* 3. The Host Route */}
        <Route path="/admin" element={<Admin />} />

        {/* Catch-all redirect back to home if they type a weird URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
