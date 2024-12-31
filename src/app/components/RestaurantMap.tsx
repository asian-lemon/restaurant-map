'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
const axios = require('axios');

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  distance: number;
  latitude: number;
  longitude: number;
}

export default function RestaurantMap() {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [map, setMap] = useState<any>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!window.tt || !mapElement.current) return;

    const map = window.tt.map({
      key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY,
      container: mapElement.current,
      center: [-122.419418, 37.774929], // San Francisco
      zoom: 12
    });

    setMap(map);

    return () => map.remove();
  }, []);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const addMarkersToMap = (results: Restaurant[], centerLat: number, centerLon: number) => {
    if (!map || !window.tt) return;

    clearMarkers();

    // Add center marker
    const centerElement = document.createElement('div');
    centerElement.className = 'w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center';
    centerElement.innerHTML = '📍';

    const centerMarker = new window.tt.Marker({ element: centerElement })
      .setLngLat([centerLon, centerLat])
      .addTo(map);
    markersRef.current.push(centerMarker);

    // Add restaurant markers
    results.forEach((restaurant) => {
      const element = document.createElement('div');
      element.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center';
      element.innerHTML = '🍽️';

      const popup = new window.tt.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${restaurant.name}</h3>
          <p>${restaurant.address}</p>
          <p>${(restaurant.distance / 1609.34).toFixed(2)} miles away</p>
        </div>
      `);

      const marker = new window.tt.Marker({ element })
        .setLngLat([restaurant.longitude, restaurant.latitude])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds
    const bounds = new window.tt.LngLatBounds();
    bounds.extend([centerLon, centerLat]);
    results.forEach(restaurant => {
      bounds.extend([restaurant.longitude, restaurant.latitude]);
    });
    
    map.fitBounds(bounds, { padding: 50 });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Searching for restaurants...', { address, radius });

      const response = await fetch('http://localhost:3000/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          miles: parseFloat(radius)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch restaurants');
      }

      const data = JSON.parse(await response.text());

      console.log('Received data:', data);


      // Ensure response contains `success` and `restaurants`
      if (!data.success || !data.restaurants) {
        throw new Error('Invalid response format: Missing required fields');
      }

      setRestaurants(data.restaurants);
      addMarkersToMap(data.restaurants, data.lat, data.lon);
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Find Nearby Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Radius in miles"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              min="0"
              step="0.1"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading || !address || !radius}
            >
              {loading ? 'Searching...' : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Restaurants
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div 
            ref={mapElement} 
            className="w-full h-[600px] rounded-lg shadow-lg"
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Results ({restaurants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[520px] overflow-y-auto">
                {restaurants.map((restaurant) => (
                  <div 
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="font-medium">{restaurant.name}</h4>
                    <p className="text-sm text-gray-600">{restaurant.address}</p>
                    <p className="text-sm text-gray-600">
                      {(restaurant.distance / 1609.34).toFixed(2)} miles away
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}