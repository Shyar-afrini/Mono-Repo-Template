import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Container, Flex } from "@mono-repo-template/ui";
import React, { useCallback, useState } from "react";
import SearchPredictions from "./search-predictions";
import LocateCurrentLocation from "./locate-current-location";

const libraries: "places"[] = ["places"];

interface MapLoaderProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  coords: {
    lat: number;
    lng: number;
    setLongitude: (longitude: number) => void;
    setLatitude: (latitude: number) => void;
  };
  translations: {
    searchPlaceholder: string;
    locateCurrentLocation: string;
  };
  loadingMessage: string;
  customLoadingComponent?: React.ReactNode;
  GOOGLE_MAP_API_KEY: string;
}

const MapLoader = ({
  center,
  zoom,
  coords,
  translations,
  loadingMessage,
  customLoadingComponent,
  GOOGLE_MAP_API_KEY,
}: MapLoaderProps) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(
    coords.lat && coords.lng ? { lat: coords.lat, lng: coords.lng } : null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const onLoad = useCallback(
    function callback(mapInstance: google.maps.Map) {
      const bounds = new window.google.maps.LatLngBounds(center);
      mapInstance.fitBounds(bounds);
      setMap(mapInstance);
    },
    [center]
  );

  const onUnmount = useCallback(function callback(
    mapInstance: google.maps.Map
  ) {
    setMap(null);
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setMarkerPosition({ lat, lng });
          coords.setLatitude(lat);
          coords.setLongitude(lng);

          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your location. Please enable location services."
          );
          setIsGettingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleLocationSelect = (
    lat: number,
    lng: number,
    description: string
  ) => {
    setMarkerPosition({ lat, lng });
    coords.setLatitude(lat);
    coords.setLongitude(lng);

    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(15);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setMarkerPosition({ lat, lng });
      coords.setLatitude(lat);
      coords.setLongitude(lng);
    }
  };

  if (!isLoaded)
    return (
      customLoadingComponent || (
        <Flex className="w-full h-full" align="center" justify="center">
          {loadingMessage}
        </Flex>
      )
    );

  return (
    <Container className="w-full h-auto dark:bg-zinc-900 bg-zinc-50 border dark:border-zinc-800 border-zinc-200 rounded-lg p-3">
      <Flex direction="column" gap={3} align="start">
        <Flex className="w-full" gap={2}>
          <div className="flex-1">
            <SearchPredictions
              translations={translations}
              isLoaded={isLoaded}
              onLocationSelect={handleLocationSelect}
              map={map}
            />
          </div>
          <LocateCurrentLocation
            handleGetCurrentLocation={handleGetCurrentLocation}
            isGettingLocation={isGettingLocation}
            translations={translations}
          />
        </Flex>
        <Container className="w-full h-auto rounded-lg relative">
          <GoogleMap
            mapContainerStyle={{
              width: `100%`,
              height: `300px`,
              borderRadius: "10px",
            }}
            center={markerPosition || center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
          >
            {markerPosition && (
              <Marker
                position={markerPosition}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    setMarkerPosition({ lat, lng });
                    coords.setLatitude(lat);
                    coords.setLongitude(lng);
                  }
                }}
              />
            )}
          </GoogleMap>
        </Container>
      </Flex>
    </Container>
  );
};

export default MapLoader;
