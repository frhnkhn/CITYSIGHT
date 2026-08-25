import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

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

  return (
    <AdvancedMarker
      position={{ lat: camera.latitude, lng: camera.longitude }}
      onClick={onClick}
      title={camera.name}
    >
      <Pin background={bgColor} borderColor={borderColor} glyphColor="#fff" />
    </AdvancedMarker>
  );
}
