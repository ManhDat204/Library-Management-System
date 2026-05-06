import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";


import HomePage from "./pages/user/HomePage";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Books from "./pages/admin/Books";
import Users from "./pages/admin/Users";
import Genres from "./pages/admin/Genres";
import Authors from "./pages/admin/Authors";
import Publishers from "./pages/admin/Publishers";
import Loans from "./pages/admin/Loans";
import Fines from "./pages/admin/Fines";
import Subscriptionplans from "./pages/admin/Subscriptionplans";
import Subscriptions from "./pages/admin/Subscriptions";
import Reports from "./pages/admin/Reports";

import Loan from "./pages/user/Loan";
import Profile from "./pages/user/Profile";
import Wishlist from "./pages/user/Wishlist";
import Checkout from "./pages/user/Checkout";
import LoanDetail from "./pages/user/Loandetail";
import Book from "./pages/user/Book";
import Login from "./pages/Login";
import Register from "./pages/user/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import BookDetail from "./pages/user/BookDetail";
import Layout from "./pages/user/Layout";
import Subscription from "./pages/user/Subscription";
import PaymentSuccess from "./pages/user/PaymentSuccess";
import Wallet from "./pages/user/Wallet"; 




function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === "ROLE_ADMIN" || user?.role === "ROLE_STAFF") {
    return <Navigate to="/dashboard" />;
  }
  return <Navigate to="/home" />;
}



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard"         element={<Dashboard />} />
            <Route path="books"             element={<Books />} />
            <Route path="users"             element={<Users />} />
            <Route path="authors"           element={<Authors />} />
            <Route path="genres"            element={<Genres />} />
            <Route path="publishers"        element={<Publishers />} />
            <Route path="loans"             element={<Loans />} />
            <Route path="fines"             element={<Fines />} />
            <Route path="subscription-plans" element={<Subscriptionplans />} />
            <Route path="subscriptions"     element={<Subscriptions />} />
            <Route path="reports"           element={<Reports />} />
          </Route>

          
          <Route path="/home" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="books" element={<Book />} />
            <Route path="books/:id" element={<BookDetail />} />
            <Route path="books/:id/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="my-loans">
              <Route index element={<ProtectedRoute><Loan /></ProtectedRoute>} />
              <Route path=":id" element={<ProtectedRoute><LoanDetail /></ProtectedRoute>} />
            </Route>
            <Route path="wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;