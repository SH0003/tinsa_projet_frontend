import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster'; // ✅ NOUVEAU
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Tag } from 'antd';

// Fix des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Icône pour le témoin sélectionné
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour recentrer la carte
const MapBounds = ({ temoins, selectedTemoin }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedTemoin && selectedTemoin.latitude && selectedTemoin.longitude) {
      // Si un témoin est sélectionné, centrer sur lui
      map.flyTo([selectedTemoin.latitude, selectedTemoin.longitude], 16, {
        duration: 1
      });
    } else if (temoins && temoins.length > 0) {
      // Sinon, adapter aux bounds de tous les témoins
      const validTemoins = temoins.filter(t => t.latitude && t.longitude);
      if (validTemoins.length > 0) {
        const bounds = validTemoins.map(t => [t.latitude, t.longitude]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [temoins, selectedTemoin, map]);

  return null;
};

const TemoinMap = ({ temoins, selectedTemoin, onMarkerClick, height = '500px', zoom = 12 }) => {
  const validTemoins = temoins.filter(t => t.latitude && t.longitude);

  const getMarkerIcon = (temoin) => {
    if (selectedTemoin && selectedTemoin.id === temoin.id) {
      return selectedIcon;
    }

    const colors = {
      'offre_vente': '#1890ff',
      'transaction_vente': '#52c41a',
      'location': '#fa8c16',
    };

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${colors[temoin.type_operation] || '#666'};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const typeOperationLabels = {
    'offre_vente': 'Offre Vente',
    'transaction_vente': 'Transaction Vente',
    'location': 'Location',
  };

  // Position par défaut (Casablanca)
  const defaultPosition = [33.5731, -7.5898];

  // ✅ NOUVEAU : Fonction pour créer des icônes de cluster personnalisées
  const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    let size = 'small';
    let color = '#1890ff';

    if (count > 10) {
      size = 'large';
      color = '#ff4d4f';
    } else if (count > 5) {
      size = 'medium';
      color = '#faad14';
    }

    const sizeMap = {
      small: 40,
      medium: 50,
      large: 60,
    };

    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: ${sizeMap[size]}px;
        height: ${sizeMap[size]}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size === 'large' ? '18px' : size === 'medium' ? '16px' : '14px'};
      ">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(sizeMap[size], sizeMap[size]),
    });
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={defaultPosition}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds temoins={validTemoins} selectedTemoin={selectedTemoin} />

        {/* ✅ NOUVEAU : MarkerClusterGroup pour regrouper les marqueurs */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={50} // Distance en pixels pour regrouper les marqueurs
          spiderfyOnMaxZoom={true} // Déployer les marqueurs quand on zoom au maximum
          showCoverageOnHover={false} // Ne pas afficher la zone de couverture au survol
          zoomToBoundsOnClick={true} // Zoomer sur le cluster au clic
        >
          {validTemoins.map((temoin) => (
            <Marker
              key={temoin.id}
              position={[temoin.latitude, temoin.longitude]}
              icon={getMarkerIcon(temoin)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(temoin),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    Témoin #{temoin.id}
                  </h4>
                  <div style={{ fontSize: '12px' }}>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Localisation:</strong> {temoin.commune || 'N/A'}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Type:</strong>{' '}
                      <Tag
                        color={
                          temoin.type_operation === 'offre_vente' ? 'blue' :
                          temoin.type_operation === 'transaction_vente' ? 'green' : 'orange'
                        }
                        style={{ fontSize: '11px' }}
                      >
                        {typeOperationLabels[temoin.type_operation] || temoin.type_operation}
                      </Tag>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Typologie:</strong> {temoin.typologie_bien || 'N/A'}
                    </p>
                    {temoin.valeur_offerte && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Prix:</strong>{' '}
                        {parseFloat(temoin.valeur_offerte).toLocaleString('fr-FR')} DH
                      </p>
                    )}
                    {temoin.surface_vendable && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Surface:</strong>{' '}
                        {parseFloat(temoin.surface_vendable).toLocaleString('fr-FR')} m²
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default TemoinMap;