import { Marker } from 'react-leaflet';
import L from 'leaflet';

interface CameraMarkerProps {
  camera: any;
  onClick?: () => void;
}

export default function CameraMarker({ camera, onClick }: CameraMarkerProps) {
  // Determine pin color based on status/traffic
  let bgColor = '#64748b'; // GREY (OFFLINE)
  let borderColor = '#475569';

  if (camera.status === 'ONLINE') {
    if (camera.traffic === 'HIGH') {
      bgColor = '#b91c1c'; // RED
      borderColor = '#991b1b';
    } else if (camera.traffic === 'MODERATE') {
      bgColor = '#b45309'; // ORANGE
      borderColor = '#92400e';
    } else {
      bgColor = '#15803d'; // GREEN
      borderColor = '#166534';
    }
  } else if (camera.status === 'WARNING') {
    bgColor = '#f59e0b'; // YELLOW
    borderColor = '#d97706';
  }

  const icon = L.divIcon({
    className: 'custom-camera-marker',
    html: `<div style="background-color: ${bgColor}; border: 2px solid ${borderColor}; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <Marker
      position={[camera.latitude, camera.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          if (onClick) onClick();
        }
      }}
    />
  );
}
