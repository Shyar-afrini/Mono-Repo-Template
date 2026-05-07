import React from "react";
import { Container } from "../containers";
import { cn } from "../../lib/utils";

const MapView = ({
  longitude,
  latitude,
  className,
}: {
  longitude: number;
  latitude: number;
  className?: string;
}) => {
  return (
    <>
      {longitude && latitude ? (
        <Container
          className={cn(
            longitude && latitude ? "w-full h-full" : "hidden",
            className
          )}
        >
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d6439.998744867162!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2siq!4v1761564254921!5m2!1sen!2siq`}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full rounded-lg"
          ></iframe>
        </Container>
      ) : (
        <></>
      )}
    </>
  );
};

export default MapView;
