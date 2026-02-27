import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/colors';

const EMOJIS = ['🍔','🚗','🏠','💊','📚','👗','🎮','☕','🛒','💡','🎵','✈️','💰','💼','📈','🎁','🍎','🐾','💇','🏋️','🌱','💻','🎓','🛵','⚡','🎪','🏖️','🍕','👶','🐶'];

const CategoryScreen = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [icon, setIcon] = useState('📌');
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.success) setCategories(data.data);
    } catch {}
  };

  useFocusEffect(useCallback(() => { fetchCategories(); }, []));

  const handleAdd = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Nama kategori wajib diisi'); return; }
    setSaving(true);
    try {
      await api.post('/categories', { name: name.trim(), type, icon });
      setModalVisible(false);
      setName(''); setIcon('📌');
      fetchCategories();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus Kategori', 'Yakin? Kategori yang sedang digunakan transaksi tidak bisa dihapus.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await api.delete(`/categories/${id}`); fetchCategories(); }
        catch (e: any) { Alert.alert('Gagal', e.response?.data?.message || 'Tidak bisa dihapus'); }
      }},
    ]);
  };

  const filtered = categories.filter(c => c.type === activeTab);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Kategori</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tab */}
      <View style={styles.tabs}>
        {(['EXPENSE','INCOME'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'EXPENSE' ? '💸 Pengeluaran' : '💰 Pemasukan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Belum ada kategori. Tambahkan! ✨</Text></View>}
        renderItem={({ item }) => (
          <Card style={styles.catCard} elevation="sm">
            <Text style={styles.catEmoji}>{item.icon || '📌'}</Text>
            <Text style={styles.catName} numberOfLines={2}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={14} color={colors.error} />
            </TouchableOpacity>
          </Card>
        )}
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Tambah Kategori</Text>

            <View style={styles.typeToggle}>
              {(['EXPENSE','INCOME'] as const).map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
                  <Text style={[styles.typeBtnText, type === t && { color: colors.white }]}>{t === 'EXPENSE' ? '💸 Pengeluaran' : '💰 Pemasukan'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nama</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nama kategori..." placeholderTextColor={colors.placeholder} />

            <Text style={styles.label}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} onPress={() => setIcon(e)} style={[styles.emojiBtn, icon === e && styles.emojiBtnActive]}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.actions}>
              <Button title="Batal" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Simpan" onPress={handleAdd} loading={saving} style={{ flex: 2 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  title: { ...typography.h2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.label, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  list: { padding: spacing.md, gap: spacing.sm },
  catCard: { flex: 1, marginHorizontal: 4, alignItems: 'center', padding: spacing.md, position: 'relative' },
  catEmoji: { fontSize: 28, marginBottom: 6 },
  catName: { ...typography.label, textAlign: 'center' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  sheetTitle: { ...typography.h3, marginBottom: spacing.md },
  typeToggle: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeBtnText: { ...typography.label, color: colors.textSecondary },
  label: { ...typography.label, marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text, backgroundColor: colors.surface, marginBottom: 4 },
  emojiScroll: { marginBottom: spacing.md },
  emojiBtn: { padding: 8, borderRadius: radius.sm, marginRight: 4 },
  emojiBtnActive: { backgroundColor: colors.background, borderWidth: 2, borderColor: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm },
});

export default CategoryScreen;
