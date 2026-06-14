import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import FullScreenLoading from "./components/FullScreenLoading";
import ScrollToTop from "./components/ScrollToTop";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MyLibraryPage from "./pages/MyLibraryPage";
import BookInfoInputPage from "./pages/BookInfoInputPage";
import BookInfoDetailPage from "./pages/BookInfoDetailPage";
import BookInfoEditPage from "./pages/BookInfoEditPage";
import AnalysisPage from "./pages/AnalysisPage";
import GoalsPage from "./pages/GoalsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { AuthContextProvider } from "../AuthContext";
import { MyLibraryContextProvider } from "../MyLibraryContext";
import { UserProfileContextProvider } from "../UserProfileContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return <FullScreenLoading />;
  }

  return (
    <>
      <AuthContextProvider>
        <MyLibraryContextProvider>
          <UserProfileContextProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mylibrary"
                  element={
                    <ProtectedRoute>
                      <MyLibraryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mylibrary/input"
                  element={
                    <ProtectedRoute>
                      <BookInfoInputPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mylibrary/edit/:id"
                  element={
                    <ProtectedRoute>
                      <BookInfoEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mylibrary/detail/:id"
                  element={
                    <ProtectedRoute>
                      <BookInfoDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analysis"
                  element={
                    <ProtectedRoute>
                      <AnalysisPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute>
                      <GoalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                {/* catch-all: 存在しないルートは NotFoundPage を表示 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </UserProfileContextProvider>
        </MyLibraryContextProvider>
      </AuthContextProvider>
    </>
  );
}

export default App;
