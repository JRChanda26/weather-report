import { Box } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function AnalyticsReport() {
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

    const location = useLocation();
    const { lat, lon } = location.state || {};

    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
                );
                // const formattedData = response.data.list.map((item: any) => ({
                //     time: dayjs(item.dt_txt).format('ddd, MMM D, h:mm A'),
                //     temp: Math.round(item.main.temp),
                // }));
                // setData(formattedData); // This is the chart of 3-hour intervals
                const now = new Date();

                const formattedData = response.data.list.map((item: any) => ({
                    dt_txt: item.dt_txt, // keep original datetime for filtering
                    time: dayjs(item.dt_txt).format('ddd, MMM D'), // For X-axis
                    fullTime: dayjs(item.dt_txt).format('ddd, MMM D, h:mm A'), // For Tooltip
                    temp: Math.round(item.main.temp),
                    icon: item.weather[0]?.icon,
                    main: item.weather[0]?.main,
                }));

                const upcomingForecasts = formattedData.filter((item: any) => {
                    const itemDate = new Date(item.dt_txt);
                    return itemDate >= now;
                });
                setData(upcomingForecasts);

            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchData();
    }, []);

    // 🧠 Custom Tooltip Component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { fullTime, temp, icon, main } = payload[0].payload;

            return (
                <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                    <p style={{ margin: 0 }}><strong>{fullTime}</strong></p>
                    <p style={{ margin: 0 }}>Temp: {temp}°C</p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <img
                            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                            alt="Weather Icon"
                            style={{ width: '50px', height: '50px' }}
                        />
                        <p style={{ margin: 0 }}>{main}</p>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <Box style={{ width: '100%', height: '100vh' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="time" interval={7} />
                    <YAxis unit="°C" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="temp" stroke="#2196f3" />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    )
}
export default AnalyticsReport;