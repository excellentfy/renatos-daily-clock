import React, { useState, useEffect, useRef } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, MapPin } from 'lucide-react';
import gsap from 'gsap';

interface WeatherData {
  temp: number;
  description: string;
  city: string;
  humidity: number;
  windSpeed: string;
  conditionSlug: string;
  currently: string;
  isExactLocation?: boolean;
}

export const WeatherWidget3D: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 26,
    description: 'Ensolarado',
    city: 'Rio de Janeiro',
    humidity: 65,
    windSpeed: '14 km/h',
    conditionSlug: 'clear_day',
    currently: 'dia',
    isExactLocation: false,
  });
  const iconRef = useRef<HTMLDivElement>(null);

  const fetchWeatherData = async (coords?: { lat: number; lon: number }) => {
    const apiKey = import.meta.env.VITE_HG_WEATHER_KEY || '627daf6b';
    const endpoint = coords
      ? `https://api.hgbrasil.com/weather?format=json-cors&key=${apiKey}&lat=${coords.lat}&lon=${coords.lon}`
      : `https://api.hgbrasil.com/weather?format=json-cors&key=${apiKey}&user_ip=remote`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Falha ao buscar clima');
      const data = await response.json();
      
      if (data.results) {
        const r = data.results;
        setWeather({
          temp: r.temp || 26,
          description: r.description || 'Tempo Bom',
          city: r.city || 'Rio de Janeiro, RJ',
          humidity: r.humidity || 60,
          windSpeed: r.wind_speedy || '12 km/h',
          conditionSlug: r.condition_slug || 'clear_day',
          currently: r.currently || 'dia',
          isExactLocation: !!coords,
        });
      }
    } catch (err) {
      console.warn('Usando dados de clima de contingência:', err);
    }
  };

  useEffect(() => {
    // 3D continuous floating animation for weather icon
    if (iconRef.current) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(iconRef.current, {
        y: -3,
        rotateZ: 6,
        rotateX: 10,
        duration: 2,
        ease: 'sine.inOut',
      });
    }

    // 1. Initial quick fetch via IP
    fetchWeatherData();

    // 2. Request browser precise geolocation for 100% location accuracy if permitted
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData({ lat: latitude, lon: longitude });
        },
        (error) => {
          // Geolocation was denied or unavailable - keep IP based weather
          console.info('Geolocalização não concedida pelo usuário. Mantendo clima por IP:', error.message);
        },
        { timeout: 8000, maximumAge: 600000 }
      );
    }

    const interval = setInterval(() => fetchWeatherData(), 10 * 60 * 1000); // 10 minutes refresh
    return () => clearInterval(interval);
  }, []);

  const renderWeatherIcon = () => {
    const slug = weather.conditionSlug;
    if (slug.includes('rain') || slug.includes('storm')) {
      return <CloudRain className="w-5 h-5 text-blue-500 drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]" />;
    }
    if (slug.includes('cloud')) {
      return <Cloud className="w-5 h-5 text-slate-500 drop-shadow-[0_2px_8px_rgba(100,116,139,0.5)]" />;
    }
    if (slug.includes('storm')) {
      return <CloudLightning className="w-5 h-5 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]" />;
    }
    return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />;
  };

  return (
    <div
      style={{ perspective: '600px' }}
      title={weather.isExactLocation ? 'Localização exata via GPS do dispositivo' : 'Localização estimada via rede/IP'}
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow select-none"
    >
      {/* 3D Animated Weather Icon */}
      <div
        ref={iconRef}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shadow-inner"
      >
        {renderWeatherIcon()}
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className="text-sm font-black text-slate-900 font-mono">
            {weather.temp}°C
          </span>
          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[90px]">
            {weather.description}
          </span>
        </div>
        <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[120px] flex items-center gap-0.5">
          {weather.isExactLocation && <MapPin className="w-2.5 h-2.5 text-cyan-600 inline" />}
          {weather.city.split(',')[0]} • {weather.humidity}% umid.
        </span>
      </div>
    </div>
  );
};

export default WeatherWidget3D;
