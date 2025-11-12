
import './App.css';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom" 
import LandingPage from './pages/landing';

function App() {
  return (
    <div className='app'>
      <Router>


        <Routes>
          <Route path="/" element={<LandingPage />}/>
        </Routes>

      </Router>


    </div>


  );
};

export default App;
