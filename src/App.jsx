import './App.css';
import AuthProvider from './Context/AuthContext';
import FireProvider from './Context/FireContext';
import Landing from './components/body/Landing';
import Navbar from "./components/navbar/Navbar";
import Newexpense from './components/body/Newexpense';
import Splitexpense from './components/body/Splitexpense';
import Detailedview from './components/body/Detailedviewcontainer'
import Footer from './components/body/footer';
import { BrowserRouter, Routes, Route} from "react-router-dom";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";

function App() {
  return (
    <>
      <div className="content-container">
        <BrowserRouter>
          <AuthProvider>
            <FireProvider>
              <Navbar/>
              <Routes>
                <Route path="/" element={<Landing/>}/>
                <Route path="/new" element={<ProtectedRoute><Newexpense/></ProtectedRoute>}/>
                <Route path="/split" element={<ProtectedRoute><Splitexpense/></ProtectedRoute>}/>
                <Route path="/detail" element={<ProtectedRoute><Detailedview/></ProtectedRoute>}/>
              </Routes>
            </FireProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
      <div className="footer--pin">
        <Footer/>
      </div>
    </>
  );
}

export default App;
