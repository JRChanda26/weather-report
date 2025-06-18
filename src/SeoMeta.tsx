import React from 'react'
import { Helmet } from 'react-helmet';

function SeoMeta() {
    return (
        <Helmet>
            {/* Basic */}
            <title>CheckWeather</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="UTF-8" />
            <meta name="theme-color" content="#0284C7" />
            <meta name="author" content="Jyoti Ranjan Chanda" />
            <meta name="description" content="CheckWeather helps you view current and upcoming weather conditions quickly and easily." />
            <meta name="keywords" content="weather, forecast, rain, temperature, CheckWeather, climate, real-time weather" />

            {/* Open Graph for social sharing */}
            <meta property="og:title" content="CheckWeather" />
            <meta property="og:description" content="Accurate weather updates in real-time." />
            <meta property="og:url" content="https://weather-report-142f.vercel.app/" />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="https://weather-report-142f.vercel.app/logo192.png" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="CheckWeather" />
            <meta name="twitter:description" content="Stay updated with accurate real-time weather forecasts." />
            <meta name="twitter:image" content="https://weather-report-142f.vercel.app/logo192.png" />

            {/* Favicon and App Icons */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/logo192.png" />
            <link rel="manifest" href="/manifest.json" />
        </Helmet>
    )
}
export default SeoMeta;