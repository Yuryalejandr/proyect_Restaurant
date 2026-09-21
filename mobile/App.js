import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/database/sqlite';

export default function App() {
  useEffect(() => {
    initDB(); // Inicializar base de datos SQLite local
  }, []);

  return <AppNavigator />;
}