import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_URL } from '../api/config';
import { colors } from '../theme';

const categorias = ['plato', 'vino', 'postre'];

export default function AdminReservasScreen({ route, navigation }) {
  const { token } = route.params;
  const [datos, setDatos] = useState({ reservas: [], menu: [], estadisticas: {} });
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('plato');
  const [detalle, setDetalle] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/reservas/admin/resumen`, { headers: { Authorization: `Bearer ${token}` } });
      const resultado = await response.json();
      if (!response.ok) throw new Error(resultado.mensaje || 'No se pudo cargar la administración.');
      setDatos(resultado);
    } catch (error) {
      Alert.alert('No se pudo cargar', error.message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (reserva, estado) => {
    try {
      const response = await fetch(`${API_URL}/reservas/${reserva.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado }),
      });
      if (!response.ok) throw new Error((await response.json()).mensaje || 'No se pudo actualizar.');
      cargar();
    } catch (error) { Alert.alert('No se pudo actualizar', error.message); }
  };

  const agregarProducto = async () => {
    if (!nombre.trim() || !precio.trim()) {
      Alert.alert('Faltan datos', 'Escribe el nombre y el precio del producto.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, categoria, detalle, precio: Number(precio), imagen }),
      });
      if (!response.ok) throw new Error((await response.json()).mensaje || 'No se pudo guardar.');
      setNombre(''); setDetalle(''); setPrecio(''); setImagen('');
      cargar();
    } catch (error) { Alert.alert('No se pudo guardar', error.message); }
  };

  const eliminarProducto = (item) => Alert.alert('Eliminar producto', `¿Eliminar ${item.nombre}?`, [
    { text: 'Conservar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: async () => {
      const response = await fetch(`${API_URL}/menu/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) Alert.alert('No se pudo eliminar', 'Inténtalo nuevamente.'); else cargar();
    } },
  ]);

  const stats = datos.estadisticas;
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={datos.reservas}
        refreshing={cargando}
        onRefresh={cargar}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<>
          <Text style={styles.kicker}>CONTROL DEL RESTAURANTE</Text>
          <Text style={styles.title}>Administración</Text>
          <Pressable style={styles.profileButton} onPress={() => navigation.navigate('Perfil', { user: route.params.user, token })}><Text style={styles.profileText}>Editar perfil de administrador</Text></Pressable>
          <View style={styles.stats}>
            <Stat label="RESERVAS" value={stats.totalReservas || 0} />
            <Stat label="PENDIENTES" value={stats.pendientes || 0} />
            <Stat label="PERSONAS" value={`${stats.personasActivas || 0}/${stats.cupoMaximo || 48}`} />
            <Stat label="MESAS ACTIVAS" value={stats.mesasOcupadas || 0} />
          </View>
          <Text style={styles.sectionTitle}>Agregar a la carta</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre del plato, vino o postre" placeholderTextColor={colors.muted} />
          <View style={styles.chips}>{categorias.map((item) => <Pressable key={item} onPress={() => setCategoria(item)} style={[styles.chip, categoria === item && styles.chipActive]}><Text style={styles.chipText}>{item.toUpperCase()}</Text></Pressable>)}</View>
          <TextInput style={styles.input} value={detalle} onChangeText={setDetalle} placeholder="Descripción breve" placeholderTextColor={colors.muted} />
          <TextInput style={styles.input} value={precio} onChangeText={setPrecio} placeholder="Precio en pesos" placeholderTextColor={colors.muted} keyboardType="numeric" />
          <TextInput style={styles.input} value={imagen} onChangeText={setImagen} placeholder="URL de la foto (https://...)" placeholderTextColor={colors.muted} autoCapitalize="none" />
          <Pressable style={styles.primaryButton} onPress={agregarProducto}><Text style={styles.primaryText}>Agregar a la carta</Text><Text style={styles.arrow}>→</Text></Pressable>
          <Text style={styles.sectionTitle}>Carta actual ({datos.menu.length})</Text>
          {datos.menu.map((item) => <View key={item.id} style={styles.menuRow}>{item.imagen ? <Image source={{ uri: item.imagen }} style={styles.menuImage} /> : null}<View style={styles.menuCopy}><Text style={styles.menuName}>{item.nombre}</Text><Text style={styles.menuDetail}>{item.categoria} · {item.detalle}</Text><Text style={styles.menuPrice}>$ {Number(item.precio).toLocaleString('es-CO')}</Text></View><Pressable onPress={() => eliminarProducto(item)}><Text style={styles.deleteText}>Eliminar</Text></Pressable></View>)}
          <Text style={styles.sectionTitle}>Reservas ({datos.reservas.length})</Text>
        </>}
        ListEmptyComponent={<Text style={styles.empty}>No hay reservas registradas.</Text>}
        renderItem={({ item }) => <View style={styles.card}><View style={styles.cardTop}><View><Text style={styles.date}>{item.fecha} · {item.hora}</Text><Text style={styles.customer}>{item.usuario_nombre || 'Cliente'} · {item.usuario_email || ''}</Text></View><Text style={[styles.status, item.estado === 'cancelada' && styles.cancelled]}>{item.estado.toUpperCase()}</Text></View><Text style={styles.detail}>{item.personas} personas · {item.plato || 'Sin plato seleccionado'}</Text><View style={styles.actions}><Pressable style={styles.confirmButton} onPress={() => cambiarEstado(item, 'confirmada')}><Text style={styles.confirmText}>Confirmar</Text></Pressable><Pressable style={styles.cancelButton} onPress={() => cambiarEstado(item, 'cancelada')}><Text style={styles.cancelText}>Cancelar</Text></Pressable></View></View>}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 20, paddingBottom: 35 },
  kicker: { color: colors.caramelLight, fontSize: 10, letterSpacing: 1.8, fontWeight: '800' }, title: { color: colors.cream, fontSize: 30, fontWeight: '800', marginTop: 6, marginBottom: 10 }, profileButton: { alignSelf: 'flex-start', marginBottom: 18 }, profileText: { color: colors.caramelLight, fontSize: 12, fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 26 }, stat: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 10 }, statValue: { color: colors.cream, fontSize: 19, fontWeight: '800' }, statLabel: { color: colors.muted, fontSize: 8, letterSpacing: 0.7, marginTop: 4 },
  sectionTitle: { color: colors.cream, fontSize: 18, fontWeight: '800', marginTop: 14, marginBottom: 11 }, input: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 10, color: colors.cream, minHeight: 47, paddingHorizontal: 13, marginBottom: 9 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 9 }, chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 }, chipActive: { borderColor: colors.caramel, backgroundColor: '#3A2719' }, chipText: { color: colors.caramelLight, fontSize: 10, fontWeight: '800' },
  primaryButton: { backgroundColor: colors.caramel, minHeight: 49, borderRadius: 11, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, primaryText: { color: colors.black, fontWeight: '800' }, arrow: { color: colors.black, fontSize: 20, fontWeight: '800' },
  menuRow: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }, menuImage: { width: 58, height: 58, borderRadius: 9, marginRight: 10, backgroundColor: colors.surfaceLight }, menuCopy: { flex: 1 }, menuName: { color: colors.cream, fontWeight: '800' }, menuDetail: { color: colors.muted, fontSize: 11, marginTop: 4 }, menuPrice: { color: colors.caramelLight, fontWeight: '800', marginTop: 5 }, deleteText: { color: colors.danger, fontSize: 11, fontWeight: '800' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, marginBottom: 10 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, date: { color: colors.cream, fontWeight: '800' }, customer: { color: colors.muted, fontSize: 11, marginTop: 5 }, status: { color: colors.caramelLight, fontSize: 10, fontWeight: '800' }, cancelled: { color: colors.danger }, detail: { color: colors.muted, fontSize: 12, marginTop: 12 }, actions: { flexDirection: 'row', gap: 10, marginTop: 12 }, confirmButton: { backgroundColor: colors.success, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }, confirmText: { color: colors.black, fontWeight: '800', fontSize: 11 }, cancelButton: { borderColor: colors.danger, borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }, cancelText: { color: colors.danger, fontWeight: '800', fontSize: 11 }, empty: { color: colors.muted, paddingVertical: 20 },
});