import { Polyline } from 'react-leaflet';

export default function VehicleTrajectory({ route }: { route: any[] }) {
  if (!route || route.length === 0) return null;

  const positions: [number, number][] = route.map(stop => [stop.latitude, stop.longitude]);

  return (
    <Polyline 
      positions={positions} 
      pathOptions={{ color: '#1e40af', weight: 4, opacity: 0.8 }} 
    />
  );
}
