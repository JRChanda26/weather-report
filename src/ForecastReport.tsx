import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function ForecastReport() {
    const [forecastData, setForecastData] = useState([]);
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

    const location = useLocation();
    const { lat, lon } = location.state || {};

    const now = new Date();

    const upcomingForecasts = forecastData.filter((item: any) => {
        const itemDate = new Date(item.dt_txt);
        return itemDate >= now;
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
                );
                setForecastData(response.data.list); // This is the array of 3-hour intervals
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchData();
    }, []);

    console.log(forecastData)

    // const formatDate = (dt_txt: string) => {
    //     const date = new Date(dt_txt);

    //     const dayOfWeek = date.toLocaleDateString(undefined, { weekday: 'long' });
    //     const datePart = date.toLocaleDateString(undefined, {
    //         month: 'long',
    //         day: 'numeric',
    //     });
    //     const timePart = date.toLocaleTimeString(undefined, {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: true,
    //     });

    //     return `${dayOfWeek}, ${datePart} ${timePart}`;
    // };

    const [page, setPage] = useState(0);
    const rowsPerPage = 6;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    return (
        <>
            <Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Date & Time</strong></TableCell>
                                <TableCell align="center"><strong>Temp (°C)</strong></TableCell>
                                <TableCell align="center"><strong>Humidity (%)</strong></TableCell>
                                <TableCell align="center"><strong>Visibility (km)</strong></TableCell>
                                <TableCell align="center"><strong>Main</strong></TableCell>
                                <TableCell align="center"><strong>Wind Speed (km/h)</strong></TableCell>
                                <TableCell align="center"><strong>Icon</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {upcomingForecasts.slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                            ).map((item: any, index: number) => (
                                <TableRow key={index}>
                                    {/* <TableCell>{formatDate(item.dt_txt)}</TableCell> */}
                                    <TableCell>{dayjs(item.dt_txt).format('ddd, MMM D, h:mm A')}</TableCell>
                                    <TableCell align="center">{Math.round(item.main.temp || 0)}</TableCell>
                                    <TableCell align="center">{Math.round(item.main.humidity || 0)}</TableCell>
                                    <TableCell align="center">{Math.round((item.visibility || 0) / 1000)}</TableCell>
                                    <TableCell align="center">{item.weather[0].main}</TableCell>
                                    <TableCell align="center">{Math.round(item.wind.speed || 0)}</TableCell>
                                    <TableCell align="center">
                                        <img
                                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                            alt="Weather Icon"
                                            style={{ width: '50px', height: '50px' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={upcomingForecasts.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[6]}
                    />
                </TableContainer>
            </Box>
        </>
    )
}

export default ForecastReport;