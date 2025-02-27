"use client"

import type React from "react";
import { useState, useEffect } from "react";

const API_KEY = "a18fd9081f6c4f80b96183234252602";
const BASE_URL = "http://api.weatherapi.com/v1/current.json";

export default function Home() {
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});
  const [error, setError] = useState("");

  // Load cities on startup
  useEffect(() => {
    const saved = localStorage.getItem("cities");
    if (saved) setCities(JSON.parse(saved));
  }, []);

  useEffect(() => {
    cities.forEach((city) => {
      fetch(`${BASE_URL}?key=${API_KEY}&q=${city}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(`City not found: ${city}`);
          } else {
            setWeatherData((prevData) => ({ ...prevData, [city]: data }));
            setError("");
          }
        });
    });
  }, [cities]);

  // Add a city
  function addCity(e: React.FormEvent) {
    e.preventDefault();
    if (city && !cities.includes(city)) {
      fetch(`${BASE_URL}?key=${API_KEY}&q=${city}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(`City not found: ${city}`);
          } else {
            const newCities = [...cities, city];
            setCities(newCities);
            localStorage.setItem("cities", JSON.stringify(newCities));
            setCity("");
            setError("");
          }
        });
    }
  }

  // Remove a city
  function removeCity(cityToRemove: string) {
    const newCities = cities.filter((c) => c !== cityToRemove);
    setCities(newCities);
    setWeatherData((prevData) => {
      const newData = { ...prevData };
      delete newData[cityToRemove];
      return newData;
    });
    localStorage.setItem("cities", JSON.stringify(newCities));
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-center mb-4">Weather Dashboard</h1>

      {/* Search */}
      <form onSubmit={addCity} className="flex mb-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="border p-1 flex-1"
        />
        <button className="bg-blue-500 text-white p-1 px-2">Add</button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* City list */}
      {cities.length === 0 ? (
        <div className="text-center p-4 border">No cities added yet</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {cities.map((city) => (
            <div key={city} className="border p-3 relative">
              <button onClick={() => removeCity(city)} className="absolute right-2 top-1">
                ×
              </button>
              <div className="font-bold">{city}</div>
              {weatherData[city] ? (
                <div className="flex justify-between mt-2">
                  <div>
                    <span className="text-2xl mr-2">{weatherData[city].current.condition.text}</span>
                    <span className="text-xl">{weatherData[city].current.temp_c}°C</span>
                  </div>
                  <div className="text-sm text-gray-500">Humidity: {weatherData[city].current.humidity}%</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
