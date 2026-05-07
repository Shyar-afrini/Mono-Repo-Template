import React, { useEffect, useRef, useState } from "react";
import { Input } from "../shadcn";
import { Container, Flex } from "../containers";
import { MapPin } from "lucide-react";
import { Text } from "../typography";

interface Prediction {
  description: string;
  place_id: string;
}

interface SearchPredictionsProps {
  translations: { searchPlaceholder: string };
  isLoaded: boolean;
  onLocationSelect: (lat: number, lng: number, description: string) => void;
  map: google.maps.Map | null;
}

const SearchPredictions = ({
  translations,
  isLoaded,
  onLocationSelect,
  map,
}: SearchPredictionsProps) => {
  const [search, setSearch] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (map) {
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, [map]);

  // Close predictions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowPredictions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value.length > 2) {
      if (!autocompleteService.current && window.google?.maps?.places) {
        autocompleteService.current =
          new window.google.maps.places.AutocompleteService();
      }

      if (autocompleteService.current) {
        autocompleteService.current.getPlacePredictions(
          { input: value },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              const mappedPredictions = predictions.map((p) => ({
                description: p.description,
                place_id: p.place_id,
              }));
              setPredictions(mappedPredictions);
              setShowPredictions(true);
            } else {
              setPredictions([]);
              setShowPredictions(false);
            }
          }
        );
      }
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionClick = (placeId: string, description: string) => {
    if (placesService.current) {
      placesService.current.getDetails(
        { placeId, fields: ["geometry"] },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            onLocationSelect(lat, lng, description);
            setSearch(description);
            setShowPredictions(false);
            setPredictions([]);
          }
        }
      );
    }
  };

  return (
    <div ref={searchContainerRef} className="w-full relative">
      <Input
        type="text"
        placeholder={translations.searchPlaceholder}
        value={search}
        onChange={handleSearch}
        onFocus={() => predictions.length > 0 && setShowPredictions(true)}
      />

      {showPredictions && predictions.length > 0 && (
        <Container className="absolute top-full p-3 left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
          <Flex direction="column" gap={0}>
            {predictions.map((prediction, index) => (
              <PredictionItem
                key={prediction.place_id}
                prediction={prediction}
                onClick={() =>
                  handlePredictionClick(
                    prediction.place_id,
                    prediction.description
                  )
                }
                isLast={index === predictions.length - 1}
              />
            ))}
          </Flex>
        </Container>
      )}
    </div>
  );
};

export default SearchPredictions;

const PredictionItem = ({
  prediction,
  onClick,
  isLast,
}: {
  prediction: Prediction;
  onClick: () => void;
  isLast: boolean;
}) => {
  return (
    <Container
      className={`w-full h-auto rounded-lg bg-zinc-900 hover:bg-zinc-800 p-3 cursor-pointer transition-colors`}
      onClick={onClick}
    >
      <Flex align="center" gap={2}>
        <MapPin size={18} />
        <Text small>{prediction.description}</Text>
      </Flex>
    </Container>
  );
};
