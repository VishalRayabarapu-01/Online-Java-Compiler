import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import Editor from './Editors'
import './App.css';
function App() {
  const [isDarkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode((prev)=>!prev)
  };
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}/>
      <Editor isDarkMode={isDarkMode} />
    </>
  );
}

export default App;
