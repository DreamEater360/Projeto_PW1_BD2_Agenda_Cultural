import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone padrão do Leaflet (correção para o Vite)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  targetCoords?: { lat: number, lng: number } | null;
}

// Componente auxiliar para mover a câmera do mapa
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.flyTo(center, 15); // Efeito de deslizar até o local
  return null;
}

export function MapPicker({ onLocationSelect, targetCoords }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  // Se receber coordenadas externas (da busca), atualiza o marcador
  useEffect(() => {
    if (targetCoords) {
      setPosition([targetCoords.lat, targetCoords.lng]);
    }
  }, [targetCoords]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : <Marker position={position} />;
  }

  return (
    <MapContainer 
      center={[-6.7612, -38.5623]} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {targetCoords && <ChangeView center={[targetCoords.lat, targetCoords.lng]} />}
      <LocationMarker />
    </MapContainer>
  );
}