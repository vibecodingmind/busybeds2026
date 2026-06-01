'use client';

import { useEffect, useRef } from 'react';

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  className?: string;
}

export default function GoogleMap({ lat, lng, zoom = 14, title, className = '' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // If no API key, use simple iframe embed
  if (!apiKey) {
    return (
      <div className={`rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
        <iframe
          width="100%"
          height="200"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=&q=${lat},${lng}&zoom=${zoom}`}
          allowFullScreen
          title={title || 'Hotel location'}
        />
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-2 text-xs text-[#0E5C3B] dark:text-[#10b981] hover:underline bg-gray-50 dark:bg-gray-800/50"
        >
          View on Google Maps
        </a>
      </div>
    );
  }

  // With API key - use interactive map
  useEffect(() => {
    if (!mapRef.current || !(window as any).google) return;

    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom,
      disableDefaultUI: true,
      zoomControl: true,
    });

    new (window as any).google.maps.Marker({
      position: { lat, lng },
      map,
      title: title || 'Hotel',
    });
  }, [lat, lng, zoom, title]);

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
      <div ref={mapRef} style={{ width: '100%', height: '200px' }} />
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center py-2 text-xs text-[#0E5C3B] dark:text-[#10b981] hover:underline bg-gray-50 dark:bg-gray-800/50"
      >
        Open in Google Maps
      </a>
    </div>
  );
}
