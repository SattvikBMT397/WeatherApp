import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import cities from './cities.json';
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import {SelectChangeEvent} from "@mui/material/Select"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Paper from "@mui/material/Paper";
import  {WeatherData} from './Interface/Interfaces';

const WeatherReport: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData|null>(null);
  const [error, setError] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const lastCity = localStorage.getItem('selectedCity');
    if (lastCity) {
      setSelectedCity(lastCity);
      fetchWeatherData(lastCity);
    }
  }, []);

  const fetchWeatherData = useCallback(async (cityName: string) => {
    setLoading(true);
    const city = cities.find(c => c.city.toLowerCase() === cityName.toLowerCase());
    if (!city) {
      setError('City not found');
      setWeatherData(null);
      setLoading(false);
      return;
    }
    const { lat, lng } = city;

    try {
      const response = await axios.get<{daily:WeatherData}>(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lng,
          daily: 'temperature_2m_min,temperature_2m_max',
          forecast_days: 1
        }
      });
      setWeatherData(response.data.daily);
      setError('');
    } catch (err) {
      setError('Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  const handleSearch = useCallback(() => {
    if (selectedCity) {
      fetchWeatherData(selectedCity);
    }
  }, [selectedCity, fetchWeatherData]);

  const handleDropdownChange = (e: SelectChangeEvent<string>) => {
    const city = e.target.value;
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
  };

  useEffect(() => {
    let intervalId=0;
    if (selectedCity) {
      intervalId = setInterval(() => {
        fetchWeatherData(selectedCity);
      }, 60000); 
    }
        clearInterval(intervalId);
  }, []);

  const averageTemperature = useMemo(() => {
    if (weatherData) {
      return ((weatherData.temperature_2m_min[0] + weatherData.temperature_2m_max[0]) / 2).toFixed(2);
    }
    return null;
  }, [weatherData]);

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h3" gutterBottom>Weather App</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select City</InputLabel>
          <Select
            value={selectedCity}
            onChange={handleDropdownChange}
            label="Select City"
          >
            <MenuItem value="">
              <em>Select City...</em>
            </MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.city} value={city.city}>
                {city.city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={!selectedCity || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {weatherData && (
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Weather Data:{selectedCity}</Typography>
            <Typography>Min Temperature: {weatherData.temperature_2m_min[0]}</Typography>
            <Typography>Max Temperature: {weatherData.temperature_2m_max[0]}</Typography>
            {averageTemperature && (
              <Typography>Average Temperature: {averageTemperature}</Typography>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default WeatherReport;
