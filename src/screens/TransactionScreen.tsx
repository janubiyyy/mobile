import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/colors';
import { formatCurrency, formatDateShort } from '../utils/format';

const EMOJIS = ['🍔','🚗','🏠','💊','📚','👗','🎮','☕','🛒','💡','🎵','✈️','💰','💼','📈','🎁','🍎','🐾','💇','🏋️'];

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories'),
      ]);
      if (txRes.data.success) setTransactions(txRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch {}
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const openAdd = () => {
    setEditItem(null);
    setAmount(''); setType('EXPENSE'); setNote(''); setCategoryId('');
    setModalVisible(true);
  };

  const openEdit = (tx: any) => {
    setEditItem(tx);
    setAmount(String(tx.amount)); setType(tx.type); setNote(tx.note || ''); setCategoryId(tx.categoryId);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!amount || !categoryId) { Alert.alert('Error', 'Jumlah dan kategori wajib diisi'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/transactions/${editItem.id}`, { amount: Number(amount), type, note, categoryId });
      } else {
        await api.post('/transactions', { amount: Number(amount), type, note, categoryId });
      }
      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus Transaksi', 'Yakin ingin menghapus transaksi ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await api.delete(`/transactions/${id}`); fetchData(); } catch {}
      }},
    ]);
  };

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter);
  const catFiltered = categories.filter(c => c.type === type);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaksi</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'ALL' ? 'Semua' : f === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Belum ada transaksi 🌱</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: item.type === 'INCOME' ? '#D4EBCE' : '#F4D5C3' }]}>
                  <Text style={{ fontSize: 20 }}>{item.category?.icon || (item.type === 'INCOME' ? '💰' : '💸')}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txCat}>{item.category?.name || '-'}</Text>
                  {item.note ? <Text style={styles.txNote} numberOfLines={1}>{item.note}</Text> : null}
                  <Text style={styles.txDate}>{formatDateShort(item.date)}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: item.type === 'INCOME' ? colors.sageDark : colors.expense }]}>
                    {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                  </Text>
                  <View style={styles.txActions}>
                    <TouchableOpacity onPress={() => openEdit(item)} style={styles.action}>
                      <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.action}>
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editItem ? 'Edit Transaksi' : 'Transaksi Baru'}</Text>

            {/* Type Toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'EXPENSE' && styles.typeBtnActive]}
                onPress={() => { setType('EXPENSE'); setCategoryId(''); }}
              >
                <Text style={[styles.typeBtnText, type === 'EXPENSE' && styles.typeBtnTextActive]}>💸 Pengeluaran</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'INCOME' && styles.typeBtnActiveIncome]}
                onPress={() => { setType('INCOME'); setCategoryId(''); }}
              >
                <Text style={[styles.typeBtnText, type === 'INCOME' && styles.typeBtnTextActive]}>💰 Pemasukan</Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <Text style={styles.fieldLabel}>Jumlah (Rp)</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.placeholder}
            />

            {/* Note */}
            <Text style={styles.fieldLabel}>Catatan (opsional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Deskripsi transaksi..."
              placeholderTextColor={colors.placeholder}
            />

            {/* Category */}
            <Text style={styles.fieldLabel}>Kategori</Text>
            <View style={styles.catGrid}>
              {catFiltered.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={styles.catEmoji}>{cat.icon || '📌'}</Text>
                  <Text style={[styles.catName, categoryId === cat.id && { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
              {catFiltered.length === 0 && (
                <Text style={styles.noCat}>Buat kategori dulu di tab Profil</Text>
              )}
            </View>

            <View style={styles.modalActions}>
              <Button title="Batal" variant="outline" onPress={() => setModalVisible(false)} style={styles.cancelBtn} />
              <Button title={editItem ? 'Simpan' : 'Tambah'} onPress={handleSave} loading={saving} style={styles.saveBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingBottom: 0 },
  title: { ...typography.h2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  filters: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.round, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  list: { padding: spacing.md, paddingTop: 0, paddingBottom: spacing.xxl },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted },
  txCard: { marginBottom: spacing.sm, padding: 12 },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  txInfo: { flex: 1 },
  txCat: { ...typography.label },
  txNote: { ...typography.caption, color: colors.textSecondary },
  txDate: { ...typography.caption, color: colors.textMuted },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontWeight: '700', fontSize: 13 },
  txActions: { flexDirection: 'row', marginTop: 4, gap: 8 },
  action: { padding: 4 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  modalTitle: { ...typography.h3, marginBottom: spacing.md },
  typeToggle: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeBtnActive: { backgroundColor: '#FDE8DC', borderColor: colors.expense },
  typeBtnActiveIncome: { backgroundColor: '#D4EBCE', borderColor: colors.sageDark },
  typeBtnText: { ...typography.label, color: colors.textSecondary },
  typeBtnTextActive: { color: colors.text },
  fieldLabel: { ...typography.label, marginBottom: 4, marginTop: 8 },
  amountInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 22, fontWeight: '700', color: colors.text, backgroundColor: colors.surface },
  noteInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.round, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  catChipActive: { borderColor: colors.primary, backgroundColor: colors.background },
  catEmoji: { fontSize: 16 },
  catName: { ...typography.caption, color: colors.textSecondary, maxWidth: 80 },
  noCat: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic' },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1 },
  saveBtn: { flex: 2 },
});

export default TransactionScreen;
