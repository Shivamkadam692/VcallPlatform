
import './App.css';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom" 
import LandingPage from './pages/landing';
import Authentication from './pages/authentication.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeetComponent from './pages/VideoMeet.jsx';

function App() {
  return (
    <div className='app'>
      <Router>


        <AuthProvider>

        <Routes>
          <Route path="/" element={<LandingPage />}/>
          <Route path="/auth" element={<Authentication />}/>
          <Route path="/:url" element={<VideoMeetComponent />}/>
        </Routes>
        </AuthProvider>



      </Router>


    </div>


  );
};

export default App;
