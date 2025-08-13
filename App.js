import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, TextInput } from 'react-native';
import * as Font from 'expo-font';

import TabuuMenu from './screens/tabuuMenu'; // TabuuMenu bileşenin dosya yoluna göre değiştir
import Help from './screens/help';      // Help ekranının dosya yolu
import NewGame from './screens/NewGame'; // Örnek diğer ekranlar
import Settings from './screens/Settings';
import Game from './screens/Game'; // Game ekranının dosya yolu
import Scores from './screens/Scores';
import FinalResults from './screens/FinalResults';
import MyWords from './screens/MyWords';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          IndieFlower: require('./assets/IndieFlower-Regular.ttf'),
        });
        // Set global default font
        Text.defaultProps = Text.defaultProps || {};
        Text.defaultProps.style = [{ fontFamily: 'IndieFlower' }, Text.defaultProps.style].filter(Boolean);
        TextInput.defaultProps = TextInput.defaultProps || {};
        TextInput.defaultProps.style = [{ fontFamily: 'IndieFlower' }, TextInput.defaultProps.style].filter(Boolean);
      } finally {
        setFontReady(true);
      }
    })();
  }, []);

  if (!fontReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TabuuMenu" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TabuuMenu" component={TabuuMenu} />
        <Stack.Screen name="Help" component={Help} />
        <Stack.Screen name="NewGame" component={NewGame} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Game" component={Game} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Scores" component={Scores} />
        <Stack.Screen name="MyWords" component={MyWords} />
        <Stack.Screen name="FinalResults" component={FinalResults} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
}
