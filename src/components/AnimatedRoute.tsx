import React, { useEffect, useRef, useState } from "react";
import MapView, { Polyline, LatLng } from "react-native-maps";
import { Animated, Easing } from "react-native";

interface Coordinates extends LatLng {}

export default function AnimatedRoute({ routeCoords }: { routeCoords: Coordinates[] }) {
  const [animatedCoords, setAnimatedCoords] = useState<Coordinates[]>([]);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (routeCoords.length === 0) return;

    animation.setValue(0);

    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 2000, 
        easing: Easing.inOut(Easing.ease), 
        useNativeDriver: false,
      })
    ).start();

    const listener = animation.addListener(({ value }) => {
      const progress = value * (routeCoords.length - 1);
      const currentIndex = Math.floor(progress);
      const nextIndex = Math.min(currentIndex + 1, routeCoords.length - 1);
      const t = progress - currentIndex;

      const current = routeCoords[currentIndex];
      const next = routeCoords[nextIndex];

      const interpolated: Coordinates = {
        latitude: current.latitude + (next.latitude - current.latitude) * t,
        longitude: current.longitude + (next.longitude - current.longitude) * t,
      };

      setAnimatedCoords([...routeCoords.slice(0, currentIndex + 1), interpolated]);
    });

    return () => animation.removeListener(listener);
  }, [routeCoords]);

  return (
    <>
      <Polyline coordinates={routeCoords} strokeColor="#ccc" strokeWidth={4} />

      {animatedCoords.length > 1 && (
        <Polyline
          coordinates={animatedCoords}
          strokeColor="#000"
          strokeWidth={4}
        />
      )}
    </>
  );
}