import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { initDB } from './src/database/sqlite';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App() {
  const [iniciando, setIniciando] = useState(true);

  useEffect(() => {
    initDB();
    const temporizador = setTimeout(() => setIniciando(false), 1100);
    return () => clearTimeout(temporizador);
  }, []);

  if (iniciando) {
    return (
      <View style={styles.launchScreen}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' }}
          style={styles.launchImage}
          blurRadius={8}
        />
        <View style={styles.launchShade} />
        <View style={styles.logoMark}><Text style={styles.logoMarkText}>Z'</Text></View>
        <Text style={styles.restaurantName}>Z'eloura</Text>
        <Text style={styles.restaurantTagline}>Cocina que se recuerda.</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  launchScreen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  launchImage: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.34 },
  launchShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(23, 19, 15, 0.7)' },
  logoMark: { width: 98, height: 98, borderRadius: 49, borderWidth: 2, borderColor: colors.caramelLight, backgroundColor: 'rgba(23, 19, 15, 0.72)', alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { color: colors.caramelLight, fontSize: 42, fontWeight: '800', letterSpacing: -3 },
  restaurantName: { color: colors.cream, fontSize: 36, fontWeight: '800', marginTop: 20 },
  restaurantTagline: { color: colors.muted, fontSize: 13, marginTop: 6 },
});