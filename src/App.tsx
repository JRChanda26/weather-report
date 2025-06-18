import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeatherInfo from './WeatherInfo';
import SeeDetails from './SeeDetails';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MaterialUISwitch from './MaterialUISwitch';
import ForecastReport from './ForecastReport';
import AnalyticsReport from './AnalyticsReport';
import { Helmet } from 'react-helmet';
import SeoMeta from './SeoMeta';
import Signup from './Signup';
import Login from './Login';

function App() {
  // const [mode, setMode] = useState<'light' | 'dark'>('light');

  // const theme = useMemo(() =>
  //   createTheme({
  //     palette: { mode },
  //   }), [mode]
  // );

  // const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setMode(event.target.checked ? 'dark' : 'light');
  // };

  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
  });

  useEffect(() => {
    // Save to localStorage whenever mode changes
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(() =>
    createTheme({
      palette: { mode },
    }), [mode]
  );

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.checked ? 'dark' : 'light');
  };

  return (
    <>
      {/* SEO */}
      <SeoMeta />

      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            p: 2,
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          <LightModeIcon />
          <MaterialUISwitch
            sx={{ m: 1 }}
            checked={mode === 'dark'}
            onChange={handleToggle}
          />
          <DarkModeIcon />
        </Box> */}
        <Router>
          <Routes>
            {/* <Route path="/" element={<WeatherInfo />} /> */}
            <Route path="/" element={<WeatherInfo mode={mode} handleToggle={handleToggle} />} />
            <Route path="/details" element={<SeeDetails />} />
            <Route path="/forecast" element={<ForecastReport />} />
            <Route path="/analytic" element={<AnalyticsReport />} />
            {/* <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} /> */}
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;


// const [user, setUser] = useState(null);

//   useEffect(() => {
//     onAuthStateChanged(auth, (u) => setUser(u));
//   }, []);

//   return user ? <WeatherDashboard /> : <Login />;