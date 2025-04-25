import { Route, Routes } from "react-router-dom";
import "./App.css";
import Signin from "./pages/auth/signin";
import SignUp from "./pages/auth/signup";
import Feed from "./pages/home/feed";
import ProfilePage from "./pages/profile/profilepage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
