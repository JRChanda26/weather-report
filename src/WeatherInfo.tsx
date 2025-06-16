import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import axios from 'axios';
import { Button, createTheme, Divider, Drawer, FormControl, FormControlLabel, IconButton, InputBase, InputLabel, Menu, MenuItem, Paper, Radio, RadioGroup, Select, Switch, TextField, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MaterialUISwitch from './MaterialUISwitch';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import dayjs from 'dayjs';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import WbCloudyIcon from '@mui/icons-material/WbCloudy';
import InfoIcon from '@mui/icons-material/Info';

interface WeatherInfoProps {
  mode: 'light' | 'dark';
  handleToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Set default icon paths manually without touching _getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Weather {
  weather: { description: string; icon: string; main: string }[];
  main: { temp: number, feels_like: number, temp_min: number, temp_max: number, humidity: number };
  wind: { speed: number };
  name: string;
  dt: number;
  coord: { lon: number, lat: number };
}

function WeatherInfo({ mode, handleToggle }: WeatherInfoProps) {
  const [weatherData, setWeatherData] = useState<Weather | null>(null);
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  const theme = useTheme();
  const navigate = useNavigate();

  const [locationName, setLocationName] = useState('');
  const [clicked, setClicked] = useState(false);

  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry);
      setStates(countryStates);
      setSelectedState("");
      setCities([]);
      setSelectedCity("");
    } else {
      setStates([]);
      setSelectedState("");
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);
      setSelectedCity("");
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedState, selectedCountry]);

  const [searchLocation, setSearchLocation] = useState('');
  const [searchedLocationValue, setSearchedLocationValue] = useState('');
  const [locationTyped, setLocationTyped] = useState(false)

  const handleLocationSubmit = () => {
    setSearchedLocationValue(searchLocation);
    // setSearchedZipValue('');
    setLocationTyped(true)
  };

  const [searchZip, setSearchZip] = useState('');
  const [searchedZipValue, setSearchedZipValue] = useState('');
  const [zipTyped, setZipTyped] = useState(false);

  const [errors, setErrors] = useState<{ location?: string; zip?: string; country?: string }>({});

  const validateZipForm = () => {
    const newErrors: { zip?: string; country?: string } = {};

    if (!searchZip.trim()) {
      newErrors.zip = 'ZIP code is required';
    } else if (!/^\d{4,10}$/.test(searchZip.trim())) {
      newErrors.zip = 'Enter a valid ZIP code';
    }

    if (!selectedCountry) {
      newErrors.country = 'Please select a country';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // valid if no errors
  };

  const validateLocationForm = () => {
    const newErrors: { location?: string } = {};

    if (!searchLocation.trim()) {
      newErrors.location = 'Location name is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleZipSubmit = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?zip=${searchZip},${selectedCountry}&appid=${apiKey}`
      );
      const cityName = response.data.name;
      // setLocationName(cityName);
      setSearchedZipValue(cityName);
      setZipTyped(true)
      setClicked(false);
      setLocationTyped(false);
    } catch (error) {
      console.error("Invalid ZIP or Country", error);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json',
            },
            headers: {
              'Accept-Language': 'en',
            }
          });

          const address = response.data.address;
          console.log(address)

          // if (clicked) {
          //   setLocationName(selectedCity)
          // } else {
          //   setLocationName(address.suburb)
          // }

          if (clicked) {
            setLocationName(selectedCity);
            return;
          } else if (locationTyped) {
            setLocationName(searchedLocationValue)
            return;
          } else if (zipTyped) {
            setLocationName(searchedZipValue)
            return;
          } else if (address.suburb) {
            setLocationName(address.suburb);
            return;
          } else if (address.state_district) {
            setLocationName(address.state_district.split(" ")[0]);
            return;
          }

        } catch (err) {
          console.log('Error')
        }
      },
    );
  }, [clicked, selectedCity, locationTyped, searchedLocationValue, zipTyped, searchedZipValue]);

  const [weatherVideo, setWeatherVideo] = useState('');

  useEffect(() => {
    if (!locationName) return;
    
    const fetchWeatherReport = async () => {
      try {
        const result = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}&units=metric`
        );
        setWeatherData(result.data);

        // const mainWeather = result.data.weather[0].main;

        // switch (mainWeather.toLowerCase()) {
        //   case 'clear':
        //     setWeatherVideo('/sunny.mp4');
        //     break;

        //   case 'clouds':
        //     setWeatherVideo('/cloudy.mp4');
        //     break;

        //   case 'rain':
        //   case 'drizzle':
        //     setWeatherVideo('/rainy.mp4');
        //     break;

        //   case 'thunderstorm':
        //   case 'squall':
        //   case 'tornado':
        //     setWeatherVideo('/stormy.mp4');
        //     break;

        //   case 'snow':
        //     setWeatherVideo('/snowy.mp4');
        //     break;

        //   case 'mist':
        //   case 'fog':
        //   case 'haze':
        //   case 'smoke':
        //     setWeatherVideo('/foggy.mp4');
        //     break;

        //   case 'dust':
        //   case 'sand':
        //   case 'ash':
        //     setWeatherVideo('/dusty.mp4');
        //     break;

        //   default:
        //     setWeatherVideo('');
        //     break;
        // }

      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        alert('Too Many Requests')
      }
    };

    fetchWeatherReport();
  }, [locationName]);

  // useEffect(() => {
  //   const fetchWeatherReport = async () => {
  //     try {
  //       const result = await axios.get(
  //         `https://api.openweathermap.org/data/2.5/weather?zip=${searchedZipValue},${selectedCountry}&appid=${apiKey}`
  //       );
  //       // setWeatherData(result.data);
  //       console.log('getttttttt',result.data.name)
  //       setLocationName(result.data.name)
  //     } catch (error) {
  //       console.error('Failed to fetch weather data:', error);
  //     }
  //   };

  //   fetchWeatherReport();
  // }, [searchedZipValue, selectedCountry]);

  //   useEffect(() => {
  //   const fetchWeatherReport = async () => {
  //     try {
  //       // Reset before fetching
  //       // setWeatherData(null);

  //       let url = '';

  //       if (searchedZipValue && selectedCountry) {
  //         url = `https://api.openweathermap.org/data/2.5/weather?zip=${searchedZipValue},${selectedCountry}&appid=${apiKey}`;
  //       } else if (locationName) {
  //         url = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}&units=metric`;
  //       } else {
  //         return; // No data to fetch
  //       }

  //       const result = await axios.get(url);
  //       setWeatherData(result.data);
  //     } catch (error) {
  //       console.error('Failed to fetch weather data:', error);
  //     }
  //   };

  //   fetchWeatherReport();
  // }, [searchedZipValue, selectedCountry, locationName]);

  // if (!weatherData) return <p />;

  // const date = new Date(weatherData.dt * 1000);
  // const dayOfWeek = date.toLocaleDateString(undefined, { weekday: 'long' });
  // const datePart = date.toLocaleDateString(undefined, {
  //   // year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  // });
  // const timePart = date.toLocaleTimeString(undefined, {
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   hour12: true,
  // });
  // const formattedDate = `${datePart}`;

  const textColor = theme.palette.mode === 'dark' ? '#F2F2F7' : '#1C1C1E';
  const toggleButtonColor = theme.palette.mode === 'dark' ? '#1C1C1E' : '#F2F2F7';

  const latitude = weatherData?.coord?.lat || 0;
  const longitude = weatherData?.coord?.lon || 0;
  // console.log(latitude, longitude)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [selectedOption, setSelectedOption] = useState(0);

  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [searchMode, setSearchMode] = useState<'location' | 'zip' | 'dropdown' | ''>('');

  const maxTemp = Math.round(weatherData?.main.temp_max || 0)
  const minTemp = Math.round(weatherData?.main.temp_min || 0)
  const windSpeed = Math.round(weatherData?.wind.speed || 0)
  const humidity = Math.round(weatherData?.main.humidity || 0)
  const feelsTemp = Math.round(weatherData?.main.feels_like || 0)

  const currentData = [
    { label: 'Max', value: maxTemp, icon: '°C' },
    { label: 'Min', value: minTemp, icon: '°C' },
    { label: 'Humidity', value: humidity, icon: '%' },
    { label: 'Wind', value: windSpeed, icon: 'km/h' },
    { label: 'Feels', value: feelsTemp, icon: '°C' },
  ]
  
  return (
    <Box>
      {weatherData ? (
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            backgroundImage: darkMode
              ? 'url("sky-background.jpg?dark")'
              : 'url("sky-background.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
              zIndex: 1,
            }}
          />

          {/* === Top Bar === */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
            }}
          >
            {/* Theme Switch */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1
            }}>
              {/* <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                color="default"
              /> */}
              <LightModeIcon sx={{ color: toggleButtonColor }} />
              <MaterialUISwitch
                sx={{ m: 1 }}
                checked={mode === 'dark'}
                // onChange={handleToggle}
                onChange={(e) => {
                  handleToggle(e);
                  setDarkMode(!darkMode);
                }}
              />
              <DarkModeIcon sx={{ color: toggleButtonColor }} />
            </Box>

            {/* Menu Icon */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: textColor }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* === Drawer === */}
          <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box sx={{ width: 320, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Search Location
              </Typography>

              {/* Step 1: Choose method */}
              <RadioGroup
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value as any)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="location" control={<Radio />} label="Search by Location" onClick={() => {
                  setSelectedCountry("")
                  setSelectedState("")
                  setSelectedCity("")
                  setSearchZip("")
                  setSearchLocation("")
                }} />
                <FormControlLabel value="zip" control={<Radio />} label="Search by ZIP + Select Country" onClick={() => {
                  setSelectedCountry("")
                  setSelectedState("")
                  setSelectedCity("")
                  setSearchZip("")
                  setSearchLocation("")
                }} />
                <FormControlLabel value="dropdown" control={<Radio />} label="Select Country, State, City" onClick={() => {
                  setSelectedCountry("")
                  setSelectedState("")
                  setSelectedCity("")
                  setSearchZip("")
                  setSearchLocation("")
                }} />
              </RadioGroup>

              {/* Step 2: Show relevant inputs */}
              {searchMode === 'location' && (
                <Box>
                  <TextField
                    fullWidth
                    label="Location Name"
                    margin="normal"
                    value={searchLocation}
                    onChange={(event: any) => {
                      setSearchLocation(event.target.value)
                    }}
                    error={!!errors.location}
                    helperText={errors.location}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    // onClick={() => {
                    //   handleLocationSubmit()
                    //   setDrawerOpen(false);
                    // }}
                    onClick={() => {
                      if (validateLocationForm()) {
                        handleLocationSubmit();
                        setDrawerOpen(false);
                      }
                    }}
                    sx={{ mt: 2 }}
                  >
                    Search
                  </Button>
                </Box>
              )}

              {searchMode === 'zip' && (
                <Box>
                  {/* <TextField
                    fullWidth
                    label="ZIP Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    margin="normal"
                  /> */}
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    margin="normal"
                    value={searchZip}
                    onChange={(event) => setSearchZip(event.target.value)}
                    error={!!errors.zip}
                    helperText={errors.zip}
                  />

                  <FormControl fullWidth margin="normal" error={!!errors.country}>
                    <Select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      displayEmpty
                      sx={{
                        // '& .MuiOutlinedInput-notchedOutline': {
                        //   border: 'none',
                        // },
                        background: 'transparent',
                      }}
                    >
                      <MenuItem value="">Select Country</MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.country && (
                      <Typography variant="caption" color="error">
                        {errors.country}
                      </Typography>
                    )}
                  </FormControl>

                  <Button
                    variant="contained"
                    fullWidth
                    // onClick={() => {
                    //   handleZipSubmit()
                    //   setDrawerOpen(false);
                    // }}
                    onClick={() => {
                      if (validateZipForm()) {
                        handleZipSubmit();
                        setDrawerOpen(false);
                      }
                    }}
                    sx={{ mt: 2 }}
                  >
                    Search
                  </Button>
                </Box>
              )}

              {searchMode === 'dropdown' && (
                <Box>
                  <FormControl fullWidth margin="normal">
                    <Select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      displayEmpty
                      sx={{
                        // '& .MuiOutlinedInput-notchedOutline': {
                        //   border: 'none',
                        // },
                        background: 'transparent',
                      }}
                    >
                      <MenuItem value="">Select Country</MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    {states.length > 0 && (
                      <Select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        displayEmpty
                        sx={{
                          // '& .MuiOutlinedInput-notchedOutline': {
                          //   border: 'none',
                          // },
                          background: 'transparent',
                        }}
                      >
                        <MenuItem value="">Select State</MenuItem>
                        {states.map((state) => (
                          <MenuItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    {cities.length > 0 && (
                      <Select
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value)
                          setClicked(true)
                          setDrawerOpen(false);
                        }}
                        displayEmpty
                        sx={{
                          // '& .MuiOutlinedInput-notchedOutline': {
                          //   border: 'none',
                          // },
                          background: 'transparent',
                        }}
                      >
                        <MenuItem value="">Select City</MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city.name} value={city.name}>
                            {city.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </FormControl>
                </Box>
              )}
            </Box>
          </Drawer>

          {/* === Centered Content === */}
          <Box
            sx={{
              zIndex: 2,
              textAlign: 'center',
              px: { xs: 2, sm: 4 },
              width: '100%',
              maxWidth: 600,
            }}
          >
            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, mb: 2, color: textColor }}>
              {dayjs(weatherData.dt * 1000).format('dddd, MMMM D')} | {weatherData.name}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h1" sx={{ fontSize: { xs: '4rem', sm: '6rem' }, fontWeight: 300, color: textColor }}>
                  {Math.round(weatherData.main.temp)}°
                </Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.3rem' }, color: textColor }}>
                  {weatherData.weather[0].description}
                </Typography>
              </Box>

              {/* <WbCloudyIcon sx={{ fontSize: { xs: 80, sm: 100 }, color: '#ffeb3b' }} /> */}
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="Weather Icon"
                style={{ width: '100px', height: '100px' }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                textAlign: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              {currentData.map((item, idx) => (
                <Box key={idx}>
                  <Typography sx={{ color: textColor }}>{item.value} {item.icon}</Typography>
                  <Typography variant="caption" sx={{ color: textColor }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <IconButton onClick={() => navigate('/details', { state: locationName })}>
              <InfoIcon />
            </IconButton>

          </Box>

        </Box>
      ) : ('')}
    </Box>
  );
}

export default WeatherInfo;
