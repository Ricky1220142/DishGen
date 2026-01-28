import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import GeneratePage from "./pages/GeneratePage";
import SavedRecipesPage from "./pages/SavedRecipesPage";
import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import SharedRecipePage from "./pages/SharedRecipePage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/shared/:recipeId" element={<SharedRecipePage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      
      {/* Protected Routes */}
      <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedRecipesPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
