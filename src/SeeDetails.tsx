import { Box, Button, Card, FormControl, Grid, MenuItem, Select, SelectChangeEvent, styled, Tab, Tabs, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SouthIcon from '@mui/icons-material/South';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CircleIcon from '@mui/icons-material/Circle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLocation, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import ReactSpeedometer from 'react-d3-speedometer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

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

  const [uvIndex, setUvIndex] = useState(0);

  const [airQuality, setAirQuality] = useState(0)
  const [components, setComponents] = useState<any>(null);

  const [position, setPosition] = useState(0);
  // console.log(position)

  const latitude = weatherData?.coord?.lat || 0;
  const longitude = weatherData?.coord?.lon || 0;
  // console.log(latitude, longitude)

  const [aqiDetails, setAqiDetails] = useState('chart');

  const handleChange = (event: SelectChangeEvent) => {
    setAqiDetails(event.target.value as string);
  };

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

  const handleDownloadPdf = async () => {

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

  const currentReport = [{
    icon: <AirIcon />,
    value: `${Math.round(weatherData?.wind.speed || 0)}km/h (${getWindDirection(weatherData?.wind?.deg || 0)})`,
    label: 'Wind'
  }, {
    icon: <DeviceThermostatIcon />,
    value: `${Math.round(weatherData?.main.temp || 0)}°C`,
    label: 'Temperature'
  }, {
    icon: <WaterDropIcon />,
    value: `${Math.round(weatherData?.main.humidity || 0)}%`,
    label: 'Humidity'
  }, {
    icon: <SouthIcon />,
    value: `${Math.round(weatherData?.main.pressure || 0)}mb`,
    label: 'Pressure'
  }, {
    icon: <VisibilityIcon />,
    value: `${Math.round((weatherData?.visibility || 0) / 1000)} km`,
    label: 'Visibility'
  },
  {
    icon: <WbSunnyIcon />,
    value: `${uvIndex} mW/m2`,
    label: 'UV'
  }
  ]

  function getWindDirection(deg: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  }

  const getAirQuality = (value: number | string) => {
    const aqi = typeof value === 'string' ? parseInt(value, 10) : value;
    if (aqi === 1) return 'Good';
    if (aqi === 2) return 'Fair';
    if (aqi === 3) return 'Moderate';
    if (aqi === 4) return 'Poor';
    if (aqi === 5) return 'Very Poor';
    return 'N/A';
  };

  // const getUVIndexLevel = (value: number | string): { label: string; color: string } => {
  //   const uv = typeof value === 'string' ? parseFloat(value) : value;
  //   if (uv >= 0 && uv <= 2) return { label: 'Low', color: '#20b806' };
  //   if (uv >= 3 && uv <= 5) return { label: 'Moderate', color: '#f1f51b' };
  //   if (uv >= 6 && uv <= 7) return { label: 'High', color: '#fca10d' };
  //   if (uv >= 8 && uv <= 10) return { label: 'Very High', color: '#e30e0e' };
  //   if (uv >= 11) return { label: 'Extreme', color: '#ed1ce6' };
  //   return { label: 'N/A', color: '#1cafed' };
  // };
  const getUVIndexLevel = (value: number | string): { label: string; color: string } => {
    const uv = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(uv) || uv < 0) return { label: 'N/A', color: '#1cafed' };
    if (uv <= 2) return { label: 'Low', color: '#20b806' };
    if (uv <= 5) return { label: 'Moderate', color: '#f1f51b' };
    if (uv <= 7) return { label: 'High', color: '#fca10d' };
    if (uv <= 10) return { label: 'Very High', color: '#e30e0e' };
    return { label: 'Extreme', color: '#ed1ce6' };
  };

  const CustomLinearProgress = styled(LinearProgress)<{ barColor: string }>(({ barColor }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: '#e0e0e0',
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: barColor,
    },
  }));

  const normalizedUVValue = (Math.min(uvIndex, 20) / 20) * 100;
  const uvColor = getUVIndexLevel(uvIndex).color;

  const [tabValue, setTabValue] = React.useState('today');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ background: '#091a33', width: '100%', height: '100%' }}>
      <Grid container spacing={0}
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        {weatherData ? (
          <Grid
            item xs={12} sm={12} md={12}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              // overflowY: 'auto',
              p: 2
            }}
            ref={printRef}
          >
            <ToastContainer />;
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2
            }}>
              <Card sx={{ mb: 2, background: '#254a94', width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                      alt="Weather Icon"
                    />
                    <Typography>
                      {weatherData?.weather[0].description}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon /> {weatherData.name}
                    </Typography>
                    {/* <Typography>{dayOfWeek} {formattedDate}</Typography> */}
                    <Typography>{dayjs(weatherData.dt * 1000).format('dddd MMMM D, YYYY')}</Typography>
                  </Box>
                </Box>
              </Card>

              <Card sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 55,
                background: 'linear-gradient(to right, #FF0000, #FFA500)',
                mb: 2,
                width: '100%',
                position: 'relative',
              }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* <WbSunnyIcon /> {formattedSunriseTime} */}
                  <WbSunnyIcon /> {dayjs(weatherData.sys.sunrise * 1000).format('hh:mm A')}
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '20%',
                    width: '60%',
                    height: 2,
                    backgroundColor: '#000000',
                    zIndex: 1
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    // left: `${position}%`,
                    left: `${46 + position * 0.6}%`,
                    transform: 'translateX(-50%)',
                    fontSize: 35,
                    zIndex: 2,
                    width: '60%',
                    transition: 'left 1s ease-in-out',
                  }}
                >
                  🌞
                </Box>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* <DarkModeIcon /> {formattedSunsetTime} */}
                  <CircleIcon /> {dayjs(weatherData.sys.sunset * 1000).format('hh:mm A')}
                </Typography>
              </Card>
            </Box>


            <Box sx={{ width: '100%' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                <Tab value={'today'} label="Today" />
                <Tab value={'week'} label="Week" />
              </Tabs>
            </Box>

            {tabValue === 'today' ? (
              <Box sx={{
                display: 'flex',
                justifycontent: 'space-between',
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: '100%',
                gap: 8,
                m: 2,
              }}>
                {todayForecasts.map((item, index) => (
                  <Box key={index} sx={{
                    padding: '10px',
                    borderRadius: '12px',
                    // minWidth: '100px',
                    // minHeight: '150px',
                    background: '#89affa',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Typography>{item.time}</Typography>
                    {item.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                        alt={item.main}
                        style={{ width: '50px', height: '50px' }}
                      />
                    )}
                    <Typography>{item.description}</Typography>
                    <Typography>{item.temp}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box m={2}>
                <Button sx={{
                  background: '#6389a8',
                  textTransform: 'none',
                  color: '#000000',
                  '&:hover': { background: '#6389a8' },
                }}
                  onClick={() => navigate('/forecast', { state: { lat: latitude, lon: longitude } })}
                >
                  One Week Forecast Report
                </Button>
              </Box>
            )}


            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              {currentReport.map(({ icon, value, label }, i) => (
                <Card
                  key={i}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    background: '#89affa',
                  }}
                >
                  {icon}
                  <Typography fontWeight={700} fontSize={14}>{value}</Typography>
                  <Typography fontWeight={700} fontSize={14}>{label}</Typography>
                </Card>
              ))}
            </Box>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
              gap: 2,
              mt: 2
            }}>
              <Card sx={{
                p: 2,
                width: '100%',
                height: '40vh',
                background: '#64b6fa',
              }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'row'
                }}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    AQI: {getAirQuality(airQuality)}
                  </Typography>
                  <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={aqiDetails}
                        onChange={handleChange}
                        sx={{
                          border: 'none',
                          boxShadow: 'none',
                          '& fieldset': { border: 'none' }
                        }}
                      >
                        <MenuItem value='chart'>AQI Chart</MenuItem>
                        <MenuItem value='report'>AQI Report</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                {aqiDetails === 'chart' && (
                  <Box height='30vh' width='100%' ml={10}>
                    <ReactSpeedometer
                      needleHeightRatio={0.7}
                      maxSegmentLabels={5}
                      minValue={1}
                      maxValue={5}
                      currentValueText={`${airQuality}`}
                      value={airQuality}
                      segments={1000}
                      startColor="green"
                      endColor="red"
                      textColor="black"
                    />
                  </Box>
                )}
                {components && aqiDetails === 'report' && (
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

              </Card>
              <Card sx={{
                width: '100%',
                height: '40vh',
                background: '#64b6fa',
              }}>
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={15}
                  zoomControl={false}
                  style={{ height: '100%', width: '100%', borderRadius: 4 }}
                >
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    attribution=''
                  />
                  <Marker position={[latitude, longitude]} />
                </MapContainer>
              </Card>
              <Card sx={{
                background: '#addff7',
                display: 'flex',
                justifyContent: 'space-around',
                flexDirection: 'column',
                width: '35%',
                p: 2
              }}>
                <Box>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    UV: {getUVIndexLevel(uvIndex).label}
                  </Typography>
                  <CustomLinearProgress
                    variant="determinate"
                    value={normalizedUVValue}
                    barColor={uvColor}
                  />
                </Box>
                <Button sx={{
                  background: '#6389a8',
                  textTransform: 'none',
                  color: '#000000',
                  '&:hover': { background: '#6389a8' },
                }}
                  onClick={() => navigate('/forecast', { state: { lat: latitude, lon: longitude } })}
                >
                  Forecast Report
                </Button>
                <Button sx={{
                  background: '#6389a8',
                  textTransform: 'none',
                  color: '#000000',
                  '&:hover': { background: '#6389a8' },
                }}
                  onClick={() => navigate('/analytic', { state: { lat: latitude, lon: longitude } })}
                >
                  Analytics Report
                </Button>
                <Button sx={{
                  background: '#6389a8',
                  textTransform: 'none',
                  color: '#000000',
                  '&:hover': { background: '#6389a8' },
                }}
                  disableRipple
                  onClick={handleDownloadPdf}
                >
                  Download PDF
                </Button>
              </Card>
            </Box>
          </Grid>
        ) : ('')}
      </Grid>
    </Box>
  )
}

export default SeeDetails;