import { Alert, Box, Button, Card, CardContent, Grid, SelectChangeEvent, Snackbar, styled, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoIcon from '@mui/icons-material/Info';
import NavigationIcon from '@mui/icons-material/Navigation';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLocation, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import LinearProgress from '@mui/material/LinearProgress';
// import ReactSpeedometer from 'react-d3-speedometer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import CloudIcon from '@mui/icons-material/Cloud';
// import { color } from 'html2canvas/dist/types/css/types/color';
import { Skeleton } from '@mui/material';


// Set default icon paths manually without touching _getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Weather {
  weather: { description: string; icon: string; main: string }[];
  main: { temp: number, pressure: number, humidity: number };
  name: string;
  dt: number;
  wind: { speed: number, deg: number };
  sys: { country: string, sunrise: number, sunset: number };
  coord: { lon: number, lat: number };
  visibility: number;
}

function SeeDetails() {
  const [weatherData, setWeatherData] = useState<Weather | null>(null);
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  const location = useLocation();
  const locationName = location.state;

  const navigate = useNavigate();

  const printRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const [uvIndex, setUvIndex] = useState(0);

  const [airQuality, setAirQuality] = useState(0)
  const [components, setComponents] = useState<any>(null);

  const [position, setPosition] = useState(0);
  // console.log(position)

  const latitude = weatherData?.coord?.lat || 0;
  const longitude = weatherData?.coord?.lon || 0;
  // console.log(latitude, longitude)

  // const [aqiDetails, setAqiDetails] = useState('chart');

  // const handleChange = (event: SelectChangeEvent) => {
  //   setAqiDetails(event.target.value as string);
  // };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherReport = async () => {
      try {
        const result = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}&units=metric`
        );
        setWeatherData(result.data);

        const mainWeather = result.data.weather[0]?.main;

        if (mainWeather && mainWeather.toLowerCase() === 'rain') {
          toast.info("🌧️ It's currently raining!", {
            position: "top-center",
            autoClose: 5000,
          });
        }

      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherReport();
  }, [locationName]);

  // const [geoLocation, setGeoLocation] = useState('')

  // useEffect(() => {
  //   if (weatherData) {
  //     const { name } = weatherData;
  //   const fetchGeoLocation = async () => {
  //     try {
  //       const result = await axios.get(
  //         `https://api.openweathermap.org/data/2.5/direct?q=${name}&limit=1&appid=${apiKey}&units=metric`
  //       );
  //       console.log('GEO Location', result.data.name)
  //       setGeoLocation(result.data.location_name);
  //     } catch (error) {
  //       console.error('Failed to fetch geo location data:', error);
  //     }
  //   };
  //   fetchGeoLocation();
  // }
  // }, []);

  useEffect(() => {
    if (weatherData) {
      const { lat, lon } = weatherData.coord;

      const fetchAQI = async () => {
        try {
          const result = await axios.get(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
          );
          const aqi = result.data.list[0]?.main.aqi;
          const component = result.data.list[0]?.components;
          // console.log('Air Quality Index:', aqi);
          setAirQuality(aqi);
          setComponents(component);
        } catch (error) {
          console.error('Failed to fetch AQI data:', error);
        }
      };

      const fetchUvIndex = async () => {
        try {
          const result = await axios.get(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
          );
          const uv = result.data.value;
          // console.log('UV Index:', uv);
          setUvIndex(uv);
        } catch (error) {
          console.error('Failed to fetch UV Index:', error);
        }
      };

      fetchAQI();
      fetchUvIndex();
    }
  }, [weatherData]);


  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const isVerticalScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleDownloadPdf = async () => {

    if (isVerticalScreen) {
      setSnackbarOpen(true);
      return;
    }

    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 3,
      useCORS: true,
    });
    const imageData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imageData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Weather Report.pdf');
  };

  // Example times (replace with actual API data)
  const sunriseTimes = new Date();
  // const sunriseTimes = new Date(weatherData?.sys?.sunrise || 0 * 1000)
  sunriseTimes.setHours(6, 0, 0); // 6:00 AM

  const sunsetTimes = new Date();
  // const sunsetTimes = new Date(weatherData?.sys?.sunset || 0 * 1000)
  sunsetTimes.setHours(18, 0, 0); // 6:00 PM

  const updateSunPosition = () => {
    const now = new Date();

    const sunrise = sunriseTimes.getTime();
    const sunset = sunsetTimes.getTime();
    const current = now.getTime();

    if (current < sunrise) {
      setPosition(0); // Before sunrise
    } else if (current > sunset) {
      setPosition(100); // After sunset
    } else {
      const percentage = ((current - sunrise) / (sunset - sunrise)) * 100;
      setPosition(percentage);
    }
  };

  useEffect(() => {
    updateSunPosition();
    const interval = setInterval(updateSunPosition, 60 * 1000); // Update every 1 min
    return () => clearInterval(interval);
  }, []);

  const showToast = () => {
    toast.warning("🌧️ Rain is expected within the next few hours.", {
      position: "top-center",
      // autoClose: false,
      autoClose: 5000,
    });
  };

  const getUpcomingForecasts = (data: any[]) => {
    const now = new Date();

    return data.filter((item: any) => {
      const itemDate = new Date(item.dt_txt);
      return itemDate >= now;
    });
  };

  useEffect(() => {
    if (!latitude || !longitude) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
        const data = response.data.list;

        setForecastData(data);

        const upcomingForecasts = getUpcomingForecasts(data);

        const now = new Date();
        const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); // now + 3 hours

        let rainFound = false;

        upcomingForecasts.forEach((e: any, idx: number) => {
          const forecastTime = new Date(e.dt_txt);
          const isRain = e.weather?.[0]?.main.toLowerCase() === 'rain';

          if (!rainFound && isRain && forecastTime <= threeHoursLater) {
            rainFound = true;
            console.log(`🌧️ Rain at index ${idx}: ${e.dt_txt} - ${e.weather?.[0]?.main}`);
            showToast(); // 🔔 Call it only once
          }
        });

      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchData();

    // Optional: re-check every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);

  }, [latitude, longitude]);


  const [forecastData, setForecastData] = useState([]);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
  //       );
  //       setForecastData(response.data.list); // This is the array of 3-hour intervals
  //     } catch (error) {
  //       console.error('Error fetching weather data:', error);
  //     }
  //   };

  //   fetchData();
  // }, [latitude, longitude]);

  // console.log(forecastData)

  //  const today = new Date();
  //  today.setHours(21, 0, 0);

  //     const todayForecasts = forecastData.filter((item: any) => {
  //         const itemDate = new Date(item.dt_txt);
  //         return itemDate < today;
  //     });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create slots using map
  const todayForecasts = Array(8).fill(null).map((_, i) => {
    const slotTime = new Date(today);
    slotTime.setHours(i * 3);

    const forecast: any = forecastData.find((item: any) => {
      const forecastTime = new Date(item.dt_txt);
      return (
        forecastTime.getHours() === slotTime.getHours() &&
        forecastTime.getDate() === slotTime.getDate()
      );
    });

    return {
      time: slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: forecast ? `${Math.round(forecast.main.temp)}°C` : 'N/A',
      icon: forecast?.weather?.[0]?.icon || '',
      main: forecast?.weather?.[0]?.main || '',
      description: forecast?.weather?.[0]?.description || '',
    };
  });


  // if (!weatherData) return <p />;

  // const sunriseTime = new Date(weatherData.sys.sunrise * 1000);
  // const sunsetTime = new Date(weatherData.sys.sunset * 1000);
  // const sunriseTimePart = sunriseTime.toLocaleTimeString(undefined, {
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   hour12: true,
  // });
  // const sunsetTimePart = sunsetTime.toLocaleTimeString(undefined, {
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   hour12: true,
  // });
  // const formattedSunriseTime = `${sunriseTimePart}`;
  // const formattedSunsetTime = `${sunsetTimePart}`;

  // const date = new Date(weatherData.dt * 1000);
  // const dayOfWeek = date.toLocaleDateString(undefined, { weekday: 'long' });
  // const datePart = date.toLocaleDateString(undefined, {
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  // });
  // const formattedDate = `${datePart}`;

  // const currentReport = [{
  //   icon: <AirIcon />,
  //   value: `${Math.round(weatherData?.wind.speed || 0)}km/h (${getWindDirection(weatherData?.wind?.deg || 0)})`,
  //   label: 'Wind'
  // }, {
  //   icon: <DeviceThermostatIcon />,
  //   value: `${Math.round(weatherData?.main.temp || 0)}°C`,
  //   label: 'Temperature'
  // }, {
  //   icon: <WaterDropIcon />,
  //   value: `${Math.round(weatherData?.main.humidity || 0)}%`,
  //   label: 'Humidity'
  // }, {
  //   icon: <SouthIcon />,
  //   value: `${Math.round(weatherData?.main.pressure || 0)}mb`,
  //   label: 'Pressure'
  // }, {
  //   icon: <VisibilityIcon />,
  //   value: `${Math.round((weatherData?.visibility || 0) / 1000)} km`,
  //   label: 'Visibility'
  // }, {
  //   icon: <WbSunnyIcon />,
  //   value: `${uvIndex} mW/m2`,
  //   label: 'UV'
  // }
  // ]

  function getWindDirection(deg: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  }

  const getVisibilityRange = (value: number | string) => {
    const visibility = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(visibility)) return 'N/A';
    if (visibility >= 10000) return 'Excellent';
    if (visibility >= 6000) return 'Good';
    if (visibility >= 4000) return 'Moderate';
    if (visibility >= 1000) return 'Poor';
    return 'Very Poor';
  };

  const getHumidityLevel = (value: number | string) => {
    const humidity = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(humidity)) return 'N/A';
    if (humidity < 30) return 'Low';
    if (humidity <= 60) return 'Moderate';
    return 'High';
  };

  const getAirQuality = (value: number | string) => {
    const aqi = typeof value === 'string' ? parseInt(value, 10) : value;
    if (aqi === 1) return 'Good';
    if (aqi === 2) return 'Fair';
    if (aqi === 3) return 'Moderate';
    if (aqi === 4) return 'Poor';
    if (aqi === 5) return 'Very Poor';
    return 'N/A';
  };

  const getUVIndexLevel = (value: number | string): string => {
    const uv = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(uv) || uv < 0) return 'N/A';
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };


  // const CustomLinearProgress = styled(LinearProgress)<{ barColor: string }>(({ barColor }) => ({
  //   height: 10,
  //   borderRadius: 5,
  //   [`&.${linearProgressClasses.colorPrimary}`]: {
  //     backgroundColor: '#e0e0e0',
  //   },
  //   [`& .${linearProgressClasses.bar}`]: {
  //     borderRadius: 5,
  //     backgroundColor: barColor,
  //   },
  // }));

  const CustomLinearProgress = styled('div')<{ value: number }>(({ value }) => ({
    height: 10,
    borderRadius: 5,
    backgroundImage: `linear-gradient(to right,
    #20b806 0%,
    #f1f51b 25%,
    #fca10d 50%,
    #e30e0e 75%,
    #ed1ce6 100%
  )`,
    position: 'relative',
    overflow: 'hidden',

    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: `${100 - value}%`,
      backgroundColor: '#e0e0e0',
      transition: 'width 0.3s ease-in-out',
    },
  }));

  // const normalizedUVValue = (Math.min(uvIndex, 20) / 20) * 100;

  const uvIndexValue = (Math.round(uvIndex * 9.09));
  // const uvDetails = getUVIndexLevel(uvIndex);

  const leftBackgroundColor = theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0';
  const rightBackgroundColor = theme.palette.mode === 'dark' ? '#37474f' : '#6d97a3';
  const textColor = theme.palette.mode === 'dark' ? '#F2F2F7' : '#1C1C1E';

  const now = Date.now();
  const sunrise = (weatherData?.sys?.sunrise || 0) * 1000;
  const sunset = (weatherData?.sys?.sunset || 0) * 1000;
  const isDay = now >= sunrise && now <= sunset;

  return (
    <Box>
      {weatherData ? (
        <Grid container ref={printRef}>
          <ToastContainer />
          <Grid item xs={12} sm={4} md={3} sx={{
            background: leftBackgroundColor,
            width: '100%',
            height: 'auto',
            display: 'flex',
            // justifyContent: 'space-between',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {/* Weather Details */}
            <Box textAlign='center'>
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="Weather Icon"
                style={{
                  width: '50%',
                  filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.6))'
                }}
              />

              <Typography sx={{
                fontSize: '15px',
                fontWeight: 500,
              }}>
                {weatherData.weather[0].description}
              </Typography>
              <Typography sx={{
                display: 'flex', alignItems: 'center', gap: 1, fontSize: '30px',
                fontWeight: 700,
              }}>
                <LocationOnIcon /> {weatherData.name}
              </Typography>
              {/* <Typography>{dayOfWeek} {formattedDate}</Typography> */}
              <Typography sx={{
                fontSize: '70px',
                filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.6))'
              }}>
                {Math.round(weatherData.main.temp || 0)}°
              </Typography>
              <Typography sx={{
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center'
              }}>{dayjs(weatherData.dt * 1000).format('dddd MMMM D, YYYY')}</Typography>
            </Box>

            {/* Sun Movement */}
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: 60,
              margin: '0px', //margin: '10px 0px',
              filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.7))',
            }}>
              {/* Sun & Moon Icon */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
                padding: {
                  xs: '5px 20px',
                  sm: '5px 10px',
                  md: '5px 10px',
                  xl: '5px 30px'
                } //padding: '0px 20px'
              }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1 }}>
                  {/* <WbSunnyIcon /> {formattedSunriseTime} */}
                  <WbSunnyIcon /> AM
                  {/* {dayjs(weatherData.sys.sunrise * 1000).format('hh:mm A')} */}
                </Typography>

                <Typography sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1 }}>
                  {/* <DarkModeIcon /> {formattedSunsetTime} */}
                  <DarkModeIcon /> PM
                  {/* {dayjs(weatherData.sys.sunset * 1000).format('hh:mm A')} */}
                </Typography>
              </Box>

              {/* Horizontal Line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 2, //4
                  margin: {
                    xs: '2px 60px',
                    sm: '2px 40px',
                    md: '2px 50px',
                    xl: '2px 70px',
                  }, // margin: '10px 20px',
                  background: '#0284C7', // 'linear-gradient(to right, #FF0000, #FFA500)',
                  transform: 'translateY(-50%)',
                  filter: 'blur(2px)',
                  opacity: 0.7,
                }}
              />

              {/* Sun Emoji */}
              <Box
                sx={{
                  position: 'absolute',
                  // left: `${20 + position * 0.6}%`,
                  left: isDay ? `${20 + position * 0.6}%` : `${20 + 100 * 0.6}%`,
                  transform: 'translateX(-50%)',
                  fontSize: 25, //35
                  top: '20%',
                  zIndex: 2,
                  transition: 'left 1s ease-in-out',
                }}
              >
                {/* 🌞 */}
                {isDay ? '🌞' : '🌝'}
              </Box>
            </Box>

            {/* Map Location */}
            <Box sx={{
              width: '100%',
              height: '30vh',
              filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.6))',
              p: 2
            }}>
              <MapContainer
                center={[latitude, longitude]}
                zoom={7}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={true}
                style={{ height: '100%', width: '100%', zIndex: 0, borderRadius: '12px', }}
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
            </Box>

            {/* Button */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 5,
              p: 2,
            }}>
              <Button sx={{
                background: '#6389a8',
                textTransform: 'none',
                color: textColor,
                fontSize: '12px',
                fontWeight: 700,
                '&:hover': { background: '#6389a8' },
              }}
                onClick={() => navigate('/forecast', { state: { lat: latitude, lon: longitude } })}
              >
                Forecast Report
              </Button>
              <Button sx={{
                background: '#6389a8',
                textTransform: 'none',
                color: textColor,
                fontSize: '12px',
                fontWeight: 700,
                '&:hover': { background: '#6389a8' },
              }}
                onClick={() => navigate('/analytic', { state: { lat: latitude, lon: longitude } })}
              >
                Analytics Report
              </Button>
            </Box>
          </Grid>


          <Grid item xs={12} sm={8} md={9} sx={{
            background: rightBackgroundColor,
            width: '100%',
            height: 'auto',
          }}>
            <Box p={2}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row'
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Today's Forecast
                </Typography>

                <Button
                  onClick={handleDownloadPdf}
                  disableRipple
                  size="small"
                  sx={{
                    background: '#6389a8',
                    color: textColor,
                    minWidth: '30px',
                    height: '30px',
                    padding: '4px',
                    borderRadius: '6px',
                    '&:hover': { background: '#6389a8' },
                  }}
                >
                  <FileDownloadIcon fontSize="small" />
                </Button>
              </Box>

              {/* Forecast */}
              <Grid
                container
                spacing={1}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  p: 0
                }}
              >
                {todayForecasts.map((item, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={1.5}
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Card
                      sx={{
                        width: '100%',
                        maxWidth: { xs: 500, sm: 250, md: 120 },
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #a0c4ff, #89affa)',
                        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.3)',
                        },
                      }}
                    >
                      <Typography fontWeight="bold">{item.time}</Typography>
                      {item.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                          alt={item.main}
                          style={{ width: '50px', height: '50px' }}
                        />
                      )}
                      <Typography variant="body2">{item.description}</Typography>
                      <Typography fontWeight="bold">{item.temp}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box p={2}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Today’s Highlights
              </Typography>

              <Grid container spacing={1} mt={1} mb={1}>
                {/* UV Index */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ minHeight: '100px' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        UV Index
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2} mt={1}>
                        <WbSunnyIcon fontSize="large" color="warning" />
                        <Box>
                          <Typography variant="h5" fontWeight="bold">{uvIndex}</Typography>
                          <Typography variant="body2" color="text.secondary">{getUVIndexLevel(uvIndex)}</Typography>
                        </Box>
                      </Box>
                      <Box mt={2}>
                        <CustomLinearProgress value={uvIndexValue} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Wind Status */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ minHeight: '100px' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Wind Status
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Typography variant="h5" fontWeight="bold">{weatherData?.wind?.speed || 0} km/h</Typography>
                        <AirIcon fontSize="large" color="primary" />
                      </Box>
                      <Box display="flex" flexDirection="row" alignItems="center" gap={2} mt={1}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            border: '2px solid #ccc',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <NavigationIcon
                            fontSize="small"
                            style={{
                              transform: `rotate(${weatherData?.wind?.deg || 0}deg)`,
                              transition: 'transform 0.3s ease-in-out',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">{getWindDirection(weatherData?.wind?.deg || 0)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Sunrise & Sunset */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ minHeight: '150px' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Sunrise & Sunset
                      </Typography>
                      <Box mt={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <WbSunnyIcon color="warning" />
                          <Typography variant="body2">{dayjs(weatherData.sys.sunrise * 1000).format('hh:mm A')}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <DarkModeIcon color="action" />
                          <Typography variant="body2">{dayjs(weatherData.sys.sunset * 1000).format('hh:mm A')}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Humidity */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ minHeight: '100px' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Humidity
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="h5" fontWeight="bold">{Math.round(weatherData?.main.humidity || 0)}%</Typography>
                        <WaterDropIcon fontSize="large" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{getHumidityLevel(Math.round(weatherData?.main.humidity || 0))}</Typography>
                      <Box mt={2}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.round(weatherData?.main.humidity || 0)}
                          sx={{ height: 8, borderRadius: 5 }}
                          color="primary"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Visibility */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ minHeight: '100px' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Visibility
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                        <Typography variant="h5" fontWeight="bold">{Math.round((weatherData?.visibility || 0) / 1000)} km</Typography>
                        <VisibilityIcon fontSize="large" color="action" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mt={1}>{getVisibilityRange(Math.round((weatherData?.visibility || 0)))}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Air Quality */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ minHeight: '100px' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" display="flex" alignItems="center" justifyContent="space-between">
                        Air Quality
                        <Tooltip
                          title={
                            <Box>
                              {components && (
                                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ textAlign: 'left', padding: '2px', borderBottom: '1px solid #ccc' }}>Component</th>
                                      <th style={{ textAlign: 'right', padding: '2px', borderBottom: '1px solid #ccc' }}>Value (μg/m³)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr><td style={{ padding: '2px', textAlign: 'left' }}>PM2.5</td><td style={{ padding: '2px', textAlign: 'right' }}>{components.pm2_5}</td></tr>
                                    <tr><td style={{ padding: '2px', textAlign: 'left' }}>PM10</td><td style={{ padding: '2px', textAlign: 'right' }}>{components.pm10}</td></tr>
                                    <tr><td style={{ padding: '2px', textAlign: 'left' }}>NO₂</td><td style={{ padding: '2px', textAlign: 'right' }}>{components.no2}</td></tr>
                                    <tr><td style={{ padding: '2px', textAlign: 'left' }}>O₃</td><td style={{ padding: '2px', textAlign: 'right' }}>{components.o3}</td></tr>
                                    <tr><td style={{ padding: '2px', textAlign: 'left' }}>SO₂</td><td style={{ padding: '2px', textAlign: 'right' }}>{components.so2}</td></tr>
                                    <tr><td style={{ padding: '2px', textAlign: 'left' }}>CO</td><td style={{ padding: '2px', textAlign: 'right' }}>{components.co}</td></tr>
                                  </tbody>
                                </table>
                              )}
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <InfoIcon sx={{ cursor: 'pointer', ml: 1 }} />
                        </Tooltip>
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="h5" fontWeight="bold">{airQuality}</Typography>
                        <CloudIcon fontSize="medium" color="error" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{getAirQuality(airQuality)}</Typography>
                      <Box mt={2}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.round(airQuality * 20)}
                          sx={{ height: 8, borderRadius: 5 }}
                          color="warning"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={4000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
                Please use a laptop or desktop for better PDF experience.
              </Alert>
            </Snackbar>

          </Grid>
        </Grid>
      ) : (loading && (
        <Box>
          <Grid container>
            {/* Left Side */}
            <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              {/* Weather Details */}
              <Skeleton variant="circular" width={100} height={100} />
              <Skeleton width={120} height={20} sx={{ mt: 1 }} />
              <Skeleton width={160} height={30} sx={{ mt: 1 }} />
              <Skeleton width={120} height={60} sx={{ mt: 1 }} />
              <Skeleton width={200} height={20} sx={{ mt: 1 }} />

              {/* Sun Movement */}
              <Box sx={{ width: '100%', height: 60, mt: 3 }}>
                <Skeleton width="100%" height={20} />
              </Box>

              {/* Map */}
              <Skeleton variant="rectangular" width="100%" height="30vh" sx={{ mt: 2 }} />

              {/* Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Skeleton width={100} height={35} />
                <Skeleton width={100} height={35} />
              </Box>
            </Grid>

            {/* Right Side */}
            <Grid item xs={12} sm={8} md={9}>
              <Box p={2}>
                {/* Forecast Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Skeleton width={200} height={30} />
                  <Skeleton variant="circular" width={30} height={30} />
                </Box>

                {/* Forecast Cards */}
                <Grid container spacing={2}>
                  {[...Array(6)].map((_, idx) => (
                    <Grid item xs={12} sm={6} md={2} key={idx}>
                      <Skeleton variant="rectangular" width="100%" height={120} />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Highlights Section */}
              <Box p={2}>
                <Skeleton width={200} height={30} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[...Array(6)].map((_, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card>
                        <CardContent>
                          <Skeleton width={100} height={20} />
                          <Skeleton width={80} height={40} sx={{ mt: 2 }} />
                          <Skeleton width="100%" height={10} sx={{ mt: 2 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Snackbar open={true} autoHideDuration={4000}>
                <Alert severity="info">Loading data...</Alert>
              </Snackbar>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  )
}

export default SeeDetails;