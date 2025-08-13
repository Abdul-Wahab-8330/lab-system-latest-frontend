import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth-view/Login";
import AuthLayout from "./pages/Auth-view/AuthLayout";
import UserLayout from "./pages/User-view/UserLayout";
import UserHome from "./pages/User-view/Home";
import AdminLayout from "./pages/Admin-view/AdminLayout";
import AdminDashboard from "./pages/Admin-view/AdminDashboard";
import NotFound from "./pages/not-found/NotFound";
import UnauthPage from "./pages/unauth-page/UnauthPage";
import { Toaster } from "react-hot-toast";
import { useContext, useState } from "react";
import CheckAuth from "./Authentication/CheckAuth";
import { AuthContext } from "./context/AuthProvider";



function App() {

  const {isAuthenticated, user} = useContext(AuthContext)

  
  return (
    <>
      <Routes>


        <Route path='/' element={<Navigate to="/auth/login" replace />} />

        <Route path="/auth" element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <AuthLayout />
          </CheckAuth>
        }>
          <Route path="login" element={<Login />} />
        </Route>

        <Route path='/admin' element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <AdminLayout />
          </CheckAuth>
        }>
          <Route path='dashboard' element={<AdminDashboard />} />
        </Route >

        <Route path='/user' element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <UserLayout />
          </CheckAuth>
        }>
          <Route path='home' element={<UserHome />} />
        </Route >

        <Route path='*' element={<NotFound />} />
        <Route path='/unauth-page' element={<UnauthPage />} />


      </Routes>

        <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
