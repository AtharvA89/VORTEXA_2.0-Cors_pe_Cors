import React from 'react';
import { IconCloud, IconSun, IconCloudRain, IconTemperature, IconWind, IconDroplet } from "@tabler/icons-react";

export function WeatherWidget() {
  // This would normally fetch real weather data from an API
  const weatherData = {
    current: {
      temp: 24,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: "12 km/h",
      location: "Farm Region"
    },
    forecast: [
      { day: "Tomorrow", high: 26, low: 18, condition: "Sunny" },
      { day: "Wed", high: 28, low: 19, condition: "Sunny" },
      { day: "Thu", high: 23, low: 17, condition: "Rain" }
    ]
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <IconSun className="text-yellow-500" />;
      case 'rain':
        return <IconCloudRain className="text-blue-500" />;
      default:
        return <IconCloud className="text-gray-500" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getWeatherIcon(weatherData.current.condition)}
          <div className="ml-3">
            <div className="text-2xl font-semibold">{weatherData.current.temp}°C</div>
            <div className="text-sm text-muted-foreground">{weatherData.current.location}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{weatherData.current.condition}</div>
          <div className="text-xs text-muted-foreground">Updated 10 min ago</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 border border-border rounded-md p-2">
        <div className="flex flex-col items-center text-center p-2">
          <IconDroplet className="h-5 w-5 text-blue-500 mb-1" />
          <span className="text-xs text-muted-foreground">Humidity</span>
          <span className="text-sm font-medium">{weatherData.current.humidity}%</span>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <IconWind className="h-5 w-5 text-slate-500 mb-1" />
          <span className="text-xs text-muted-foreground">Wind</span>
          <span className="text-sm font-medium">{weatherData.current.windSpeed}</span>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <IconSun className="h-5 w-5 text-amber-500 mb-1" />
          <span className="text-xs text-muted-foreground">UV Index</span>
          <span className="text-sm font-medium">Moderate</span>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">3-Day Forecast</h3>
        </div>
        <div className="flex justify-between">
          {weatherData.forecast.map((day, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-xs font-medium">{day.day}</span>
              <div className="my-1">{getWeatherIcon(day.condition)}</div>
              <div className="flex gap-1 text-xs">
                <span className="font-medium">{day.high}°</span>
                <span className="text-muted-foreground">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}