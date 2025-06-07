import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import axios from 'axios';
import { Button, createTheme, MenuItem, Select, Typography, useTheme } from '@mui/material';
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
  main: { temp: number, feels_like: number, temp_min: number, temp_max: number };
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
  }, [clicked, selectedCity]);

  useEffect(() => {
    const fetchWeatherReport = async () => {
      try {
        const result = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}&units=metric`
        );
        setWeatherData(result.data);
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      }
    };

    fetchWeatherReport();
  }, [locationName]);

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
  console.log(latitude, longitude)

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', }}>
      {/* Background Video */}
      {/* <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src="weather_video.mp4" type="video/mp4" />
      </video> */}
      <MapContainer
        center={[latitude, longitude]}
        zoom={2}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >

        {/* OpenStreetMap base layer */}
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* OpenWeather temperature overlay */}
        <TileLayer
          attribution=''
          url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`}
          opacity={2}
        />

        <Marker position={[latitude, longitude]}>
          <Popup>
            {weatherData?.name} <br />{Math.round(weatherData?.main?.temp || 0)}°C
          </Popup>
        </Marker>
      </MapContainer>

      {/* Overlay Content */}
      {weatherData ? (
        <Box>
          <Box sx={{
            position: 'absolute',
            top: '0%',
            left: '0%',
            zIndex: 1,
            color: '#fff',
            maxWidth: '90%',
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row'
          }}>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              displayEmpty
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
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

            {states.length > 0 && (
              <Select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                displayEmpty
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
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

            {cities.length > 0 && (
              <Select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setClicked(true)
                }}
                displayEmpty
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
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

            {/* Show selected location */}
            {/* {selectedCountry && selectedState && selectedCity && (
          <div style={{ marginTop: "1rem" }}>
            Selected Location: {selectedCountry} / {selectedState} / {selectedCity}
          </div>
        )} */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <LightModeIcon sx={{ color: toggleButtonColor }} />
              <MaterialUISwitch
                sx={{ m: 1 }}
                checked={mode === 'dark'}
                onChange={handleToggle}
              />
              <DarkModeIcon sx={{ color: toggleButtonColor }} />
            </Box>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '10%', sm: '15%', md: '20%' },
              left: { xs: '5%', sm: '8%', md: '10%' },
              zIndex: 1,
              color: '#fff',
              maxWidth: '90%',
            }}
          >
            {/* Location */}
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: { xs: '16px', sm: '18px', md: '20px' },
                fontWeight: 700,
                color: textColor
              }}
            >
              <LocationOnIcon /> {weatherData.name}
            </Typography>

            {/* Weather icon and temps */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="Weather Icon"
                style={{ width: '60px', height: '60px' }}
              />
              <Box ml={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: { xs: '14px' }, fontWeight: 700, color: textColor }}>
                    <NorthIcon sx={{ fontSize: '16px' }} />
                    {Math.round(weatherData.main.temp_max)}°
                  </Typography>
                  <hr
                    style={{
                      width: '20px',
                      transform: 'rotate(90deg)',
                      border: '1px solid #10aade',
                    }}
                  />
                  <Typography sx={{ fontSize: { xs: '14px' }, fontWeight: 700, color: textColor }}>
                    {Math.round(weatherData.main.temp_min)}°
                    <SouthIcon sx={{ fontSize: '16px' }} />
                  </Typography>
                </Box>

                {/* Feels like */}
                <Typography sx={{ mt: 1, fontSize: { xs: '14px' }, fontWeight: 700, color: textColor }}>
                  Feels Like: {Math.round(weatherData.main.feels_like)}°
                </Typography>
              </Box>
            </Box>

            {/* Weather Description */}
            <Typography
              sx={{
                mt: 1,
                fontSize: { xs: '14px' },
                fontWeight: 700,
                textTransform: 'capitalize',
                color: textColor
              }}
            >
              {weatherData.weather[0].description}
            </Typography>

            {/* Date */}
            <Typography sx={{ fontSize: '14px', mb: 1, color: textColor }}>
              {/* {dayOfWeek}, {formattedDate} */}
              {dayjs(weatherData.dt * 1000).format('dddd, MMMM D')}
            </Typography>

            {/* Temperature */}
            <Typography sx={{ fontSize: { xs: '20px' }, fontWeight: 700, color: textColor }}>
              {Math.round(weatherData.main.temp)}°C
            </Typography>

            {/* Button */}
            <Button
              onClick={() => navigate('/details', { state: locationName })}
              sx={{
                mt: 1,
                background: '#10aade',
                color: textColor,
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 2,
                '&:hover': {
                  background: '#10aade',
                },
              }}
            >
              See Details
            </Button>
          </Box>
        </Box>
      ) : ('')}
    </Box>
  );
}

export default WeatherInfo;
