import './App.css';
import FireProvider from './Context/FireContext';
import Landing from './components/body/Landing';
import Navbar from "./components/navbar/Navbar";
import Newexpense from './components/body/Newexpense';
import Splitexpense from './components/body/Splitexpense';
import { BrowserRouter, Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
