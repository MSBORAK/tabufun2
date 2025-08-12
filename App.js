import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabuuMenu from './screens/tabuuMenu'; // TabuuMenu bileşenin dosya yoluna göre değiştir
import Help from './screens/help';      // Help ekranının dosya yolu
import NewGame from './screens/NewGame'; // Örnek diğer ekranlar
import Settings from './screens/Settings';
import Game from './screens/Game'; // Game ekranının dosya yolu
import Scores from './screens/Scores';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TabuuMenu" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TabuuMenu" component={TabuuMenu} />
        <Stack.Screen name="Help" component={Help} />
        <Stack.Screen name="NewGame" component={NewGame} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Scores" component={Scores} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
}
