'use client';

import { useEffect, useRef } from 'react';
import styles from './LocationMap.module.scss';

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  city?: string;
  className?: string;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };

    return entities[char];
  });
}

export default function LocationMap({ lat, lng, zoom = 5, city, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (typeof window === 'undefined') return;

    async function init() {
      const leaflet = await import('leaflet');
      const L = leaflet.default;

      // Import Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
      }).addTo(map);

      // Custom marker icon
      const icon = L.divIcon({
        className: styles['location-map-marker'],
        html: city
          ? `<span class="${styles['location-map-label']}">${escapeHtml(city)}</span>`
          : '',
        iconSize: undefined,
        iconAnchor: [0, 12],
      });

      L.marker([lat, lng], { icon }).addTo(map);

      // Invalidate size after a short delay to ensure proper rendering
      setTimeout(() => map.invalidateSize(), 100);

      mapRef.current = map;
    }

    init();

    return () => {
      if (mapRef.current && typeof mapRef.current === 'object' && 'remove' in mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, city]);

  return <div ref={containerRef} className={className} />;
}
