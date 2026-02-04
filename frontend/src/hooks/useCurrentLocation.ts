import { useState, useEffect } from 'react';

export function useCurrentLocation() {
  const [location, setLocation] = useState({
    city: 'Carregando local...',
    coords: { lat: -6.7612, lng: -38.5623 }, // Padrão Cajazeiras
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, city: 'Cajazeiras, PB', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // Reverse Geocoding: Coordenadas -> Nome da Cidade
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        
        // Tenta pegar a cidade ou vila ou município
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality || 'Local desconhecido';
        const state = data.address.state || '';

        setLocation({
          city: `${city}${state ? ', ' + state : ''}`,
          coords: { lat: latitude, lng: longitude },
          loading: false
        });
      } catch {
        setLocation(prev => ({ ...prev, city: 'Cajazeiras, PB', loading: false }));
      }
    }, () => {
      // Se o usuário negar a permissão
      setLocation(prev => ({ ...prev, city: 'Cajazeiras, PB', loading: false }));
    });
  }, []);

  return location;
}