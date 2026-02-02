// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Mainpage from './component/Mainpage';
import Result from './component/Result';
import Subpage from './component/Subpage';
import './App.css';



const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Mainpage />} />
          <Route path="/result" element={<Result />} />
          <Route path="/subpage" element={<Subpage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

