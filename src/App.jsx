import React, { lazy, Suspense } from "react";
import "./App.css";
import AuthProvider from "./Context/AuthContext";
import FireProvider from "./Context/FireContext";
import Landing from "./components/body/Landing";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/body/footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";

const NewExpense = lazy(() => import("./components/body/Newexpense"));
const SplitExpense = lazy(() => import("./components/body/Splitexpense"));
const DetailedView = lazy(() => import("./components/body/Detailedviewcontainer"));

function ProtectedPage({ children }) {
    return (
        <ProtectedRoute>
            <Suspense fallback={<p className="statusMsg">Loading page…</p>}>
                {children}
            </Suspense>
        </ProtectedRoute>
    );
}

function App() {
    return (
        <>
            <div className="content-container">
                <BrowserRouter>
                    <AuthProvider>
                        <FireProvider>
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route path="/new" element={<ProtectedPage><NewExpense /></ProtectedPage>} />
                                <Route path="/split" element={<ProtectedPage><SplitExpense /></ProtectedPage>} />
                                <Route path="/detail" element={<ProtectedPage><DetailedView /></ProtectedPage>} />
                            </Routes>
                        </FireProvider>
                    </AuthProvider>
                </BrowserRouter>
            </div>
            <div className="footer--pin">
                <Footer />
            </div>
        </>
    );
}

export default App;
