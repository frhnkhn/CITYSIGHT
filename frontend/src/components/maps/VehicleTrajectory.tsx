import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export default function VehicleTrajectory({ route }: { route: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !route || route.length === 0) return;

    // We rely on window.google being available from the APIProvider
    const w = window as any;
    if (!w.google) return;

    const path = route.map(stop => ({ lat: stop.latitude, lng: stop.longitude }));

    const newPolyline = new w.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#1e40af', // Accent Navy Blue
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    newPolyline.setMap(map);

    return () => {
      newPolyline.setMap(null);
    };
  }, [map, route]);

  return null; // The markers along the route can be rendered via AdvancedMarker in the parent or here
}
