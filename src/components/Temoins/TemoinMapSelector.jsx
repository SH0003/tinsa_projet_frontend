import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// IMPORTANT : Fix critique pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Icône personnalisée pour le pin sélectionné
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour invalider la taille de la carte
const MapInvalidator = () => {
  const map = useMap();
  
  useEffect(() => {
    // Invalide la taille après le montage et après un court délai
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  
  return null;
};

// Composant pour gérer les clics sur la carte
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};

const TemoinMapSelector = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);

  // Centre par défaut (Casablanca)
  const defaultCenter = [33.5731, -7.5898];
  const defaultZoom = 12;

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleLocationSelect = (location) => {
    setPosition(location);
    onLocationSelect(location);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* CARTE AVEC HAUTEUR FIXE ET Z-INDEX */}
      <div style={{ 
        height: '450px', 
        width: '100%', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '2px solid #e8e8e8',
        position: 'relative',
        zIndex: 1
      }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : defaultZoom}
          style={{ 
            height: '100%',
            width: '100%'
          }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Composant qui force le recalcul de la taille */}
          <MapInvalidator />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />

          {position && (
            <Marker position={[position.lat, position.lng]} icon={selectedIcon}>
              <Popup>
                <div>
                  <strong>📍 Localisation sélectionnée</strong>
                  <br />
                  <strong>Latitude:</strong> {position.lat.toFixed(6)}
                  <br />
                  <strong>Longitude:</strong> {position.lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      
    </div>
  );
};

export default TemoinMapSelector;