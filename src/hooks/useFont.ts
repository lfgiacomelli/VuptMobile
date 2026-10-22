import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function useRighteousFont() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        Righteous: require('../assets/fonts/Righteous-Regular.ttf'),
      });
      setLoaded(true);
    }

    loadFont();
  }, []);

  return loaded;
}