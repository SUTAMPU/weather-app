import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
    'LeagueSpartan-Regular': require('../assets/fonts/LeagueSpartan-Regular.ttf'),
    'LeagueSpartan-Bold': require('../assets/fonts/LeagueSpartan-Bold.ttf'),
    'GlacialIndifference-Regular': require('../assets/fonts/GlacialIndifference-Regular.otf'),
    'GlacialIndifference-Bold': require('../assets/fonts/GlacialIndifference-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
    </Stack>
  );
}
