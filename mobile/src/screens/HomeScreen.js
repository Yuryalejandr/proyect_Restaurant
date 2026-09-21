import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme';
import { API_URL } from '../api/config';

const platos = [
  {
    id: 'corte',
    nombre: 'Corte al carbón',
    detalle: 'Puré rústico · chimichurri',
    precio: '$ 48.000',
    imagen: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pasta',
    nombre: 'Pasta de la casa',
    detalle: 'Pomodoro asado · albahaca',
    precio: '$ 35.000',
    imagen: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'postre',
    nombre: 'Cacao & avellana',
    detalle: 'Postre de autor · vainilla',
    precio: '$ 22.000',
    imagen: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80',
  },
];

export default function HomeScreen({ navigation, route }) {
  const { user } = route.params;
  const [platoSeleccionado, setPlatoSeleccionado] = useState(platos[0]);
  const [carta, setCarta] = useState(platos);
  const [fotoUri, setFotoUri] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/menu`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('No se pudo cargar la carta.')))
      .then((items) => {
        const disponibles = items.filter((item) => item.disponible);
        if (disponibles.length) {
          setCarta(disponibles);
          setPlatoSeleccionado(disponibles[0]);
        }
      })
      .catch((error) => console.warn(error.message));
  }, []);

  const abrirGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Permite acceder a la galería para elegir una foto.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotoUri(resultado.assets[0].uri);
    }
  };

  const irAReserva = () => {
    navigation.navigate('AgendarReserva', {
      user,
      plato: platoSeleccionado.nombre,
      fotoUri,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>RESTAURANTE LÚMINA</Text>
            <Text style={styles.welcome}>Hola, {user.nombre?.split(' ')[0] || 'invitado'}.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            style={styles.avatar}
            onPress={() => navigation.navigate('Perfil', { user, token: route.params.token })}
          >
            <Text style={styles.avatarText}>{(user.nombre || 'U').charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTag}>Cocina contemporánea</Text>
          <Text style={styles.heroTitle}>Una mesa para{`\n`}recordar.</Text>
          <Text style={styles.heroText}>Reserva tu experiencia y déjanos preparar cada detalle.</Text>
          <Pressable style={styles.primaryButton} onPress={irAReserva}>
            <Text style={styles.primaryButtonText}>Reservar una mesa</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Tu experiencia</Text>
        <View style={styles.modules}>
          <Pressable style={[styles.module, styles.moduleFeatured]} onPress={irAReserva}>
            <Text style={styles.moduleNumber}>01</Text>
            <Text style={styles.moduleTitle}>Reservar</Text>
            <Text style={styles.moduleText}>Fecha, hora y mesa</Text>
          </Pressable>
          <Pressable style={styles.module} onPress={() => scrollRef.current?.scrollTo({ y: 580, animated: true })}>
            <Text style={styles.moduleNumber}>02</Text>
            <Text style={styles.moduleTitle}>Carta</Text>
            <Text style={styles.moduleText}>Elige tu favorito</Text>
          </Pressable>
          <Pressable style={styles.module} onPress={abrirGaleria}>
            <Text style={styles.moduleNumber}>03</Text>
            <Text style={styles.moduleTitle}>Tu foto</Text>
            <Text style={styles.moduleText}>{fotoUri ? 'Foto seleccionada' : 'Añade un recuerdo'}</Text>
          </Pressable>
          <Pressable style={styles.module} onPress={() => navigation.navigate('MisReservas', { user })}>
            <Text style={styles.moduleNumber}>04</Text>
            <Text style={styles.moduleTitle}>Mis mesas</Text>
            <Text style={styles.moduleText}>Consulta tus reservas</Text>
          </Pressable>
          <Pressable style={styles.module} onPress={() => Alert.alert('Lúmina', 'Tu próxima experiencia empieza con una reserva.') }>
            <Text style={styles.moduleNumber}>05</Text>
            <Text style={styles.moduleTitle}>Detalles</Text>
            <Text style={styles.moduleText}>Una atención especial</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Carta destacada</Text>
            <Text style={styles.sectionSubtitle}>Selecciona un plato para tu reserva</Text>
          </View>
          <Text style={styles.count}>{carta.length} PRODUCTOS</Text>
        </View>

        {carta.map((plato) => {
          const seleccionado = plato.id === platoSeleccionado.id;
          return (
            <Pressable
              key={plato.id}
              style={[styles.dishCard, seleccionado && styles.dishCardSelected]}
              onPress={() => setPlatoSeleccionado(plato)}
            >
              <Image source={{ uri: plato.imagen }} style={styles.dishImage} />
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{plato.nombre}</Text>
                <Text style={styles.dishDetail}>{plato.detalle}</Text>
                <Text style={styles.dishPrice}>{typeof plato.precio === 'number' ? `$ ${plato.precio.toLocaleString('es-CO')}` : plato.precio}</Text>
              </View>
              <View style={[styles.radio, seleccionado && styles.radioSelected]}>
                {seleccionado && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}

        <Pressable style={styles.photoCard} onPress={abrirGaleria}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.userPhoto} />
          ) : (
            <View style={styles.photoPlaceholder}><Text style={styles.photoIcon}>＋</Text></View>
          )}
          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>{fotoUri ? 'Tu foto está lista' : 'Añade una foto'}</Text>
            <Text style={styles.photoText}>Puedes incluirla como referencia en tu reserva.</Text>
          </View>
          <Text style={styles.photoAction}>{fotoUri ? 'Cambiar' : 'Elegir'}</Text>
        </Pressable>

        <Pressable style={[styles.primaryButton, styles.bottomButton]} onPress={irAReserva}>
          <Text style={styles.primaryButtonText}>Continuar a reserva</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  eyebrow: { color: colors.caramelLight, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  welcome: { color: colors.cream, fontSize: 27, fontWeight: '700', marginTop: 5 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.caramel, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.black, fontWeight: '800', fontSize: 18 },
  hero: { backgroundColor: colors.surfaceLight, borderRadius: 22, padding: 23, borderWidth: 1, borderColor: colors.line, marginBottom: 30 },
  heroTag: { color: colors.caramelLight, fontSize: 11, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase' },
  heroTitle: { color: colors.cream, fontSize: 32, fontWeight: '800', lineHeight: 38, marginTop: 10 },
  heroText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 10, marginBottom: 20 },
  primaryButton: { backgroundColor: colors.caramel, minHeight: 50, borderRadius: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryButtonText: { color: colors.black, fontWeight: '800', fontSize: 15 },
  arrow: { color: colors.black, fontWeight: '800', fontSize: 23 },
  sectionTitle: { color: colors.cream, fontWeight: '800', fontSize: 20 },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  modules: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 13, marginBottom: 31 },
  module: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 14, width: '48.5%', minHeight: 111 },
  moduleFeatured: { backgroundColor: '#3A2719', borderColor: colors.caramel },
  moduleNumber: { color: colors.caramelLight, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  moduleTitle: { color: colors.cream, fontSize: 16, fontWeight: '800', marginTop: 11 },
  moduleText: { color: colors.muted, fontSize: 11, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  count: { color: colors.caramelLight, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  dishCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 9, marginBottom: 11, flexDirection: 'row', alignItems: 'center' },
  dishCardSelected: { borderColor: colors.caramel, backgroundColor: '#2E211A' },
  dishImage: { width: 76, height: 76, borderRadius: 11, backgroundColor: colors.surfaceLight },
  dishInfo: { flex: 1, paddingHorizontal: 12 },
  dishName: { color: colors.cream, fontSize: 15, fontWeight: '800' },
  dishDetail: { color: colors.muted, fontSize: 11, marginTop: 5 },
  dishPrice: { color: colors.caramelLight, fontSize: 12, fontWeight: '800', marginTop: 9 },
  radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center', marginRight: 3 },
  radioSelected: { borderColor: colors.caramel, backgroundColor: colors.caramel },
  radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.black },
  photoCard: { backgroundColor: '#211915', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.caramel, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  photoPlaceholder: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  photoIcon: { color: colors.caramelLight, fontSize: 28, fontWeight: '300' },
  userPhoto: { width: 52, height: 52, borderRadius: 12 },
  photoCopy: { flex: 1, paddingHorizontal: 12 },
  photoTitle: { color: colors.cream, fontSize: 14, fontWeight: '800' },
  photoText: { color: colors.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },
  photoAction: { color: colors.caramelLight, fontSize: 12, fontWeight: '800' },
  bottomButton: { marginTop: 20 },
});
