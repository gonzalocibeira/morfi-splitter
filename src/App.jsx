import './App.css';
import FireProvider from './Context/FireContext';
import Landing from './components/body/Landing';
import Navbar from "./components/navbar/Navbar";
import Newexpense from './components/body/Newexpense';
import Splitexpense from './components/body/Splitexpense';
import Footer from './components/body/footer';
import { BrowserRouter, Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
      <div className="content-container">
        <BrowserRouter>
          <FireProvider>
            <Navbar/>
            <Routes>
              <Route path="/" element={<Landing/>}/>
              <Route path="/new" element={<Newexpense/>}/>
              <Route path="/split" element={<Splitexpense/>}/>
            </Routes>
          </FireProvider>
        </BrowserRouter>
      </div>
      <div className="footer--pin">
        <Footer/>
      </div>
    </>
  );
}

export default App;
