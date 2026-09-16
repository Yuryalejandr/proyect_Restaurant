import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AgendarReservaScreen from '../screens/AgendarReservaScreen';
import MisReservasScreen from '../screens/MisReservasScreen';
import AdminReservasScreen from '../screens/AdminReservasScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AgendarReserva" component={AgendarReservaScreen} />
        <Stack.Screen name="MisReservas" component={MisReservasScreen} />
        <Stack.Screen name="AdminReservas" component={AdminReservasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}