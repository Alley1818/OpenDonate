import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";
import AuthLayout from "./layout/AuthLayout.jsx";
import ProtectedRoute from "./layout/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Creator from "./pages/Creator.jsx";
import Saved from "./pages/Saved.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Home search />} />
          <Route path="author" element={<Creator />} />
          <Route path="creators/:username" element={<Creator />} />
          <Route path="posts/:id" element={<PostDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="subscriptions" element={<Navigate to="/author" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route path="saved" element={<Saved />} />
            <Route path="new" element={<CreatePost />} />
            <Route path="posts/:id/edit" element={<CreatePost />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
