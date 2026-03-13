import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Share from 'react-native-share';
import api from '../services/api';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { colors, spacing, typography, radius } from '../theme/colors';
import { formatCurrency, formatDate } from '../utils/format';

interface CategoryTotal {
  name: string;
  icon: string;
  total: number;
}

const PIE_COLORS = ['#A3B18A','#D4A373','#6B4F3B','#C98B6B','#7A9468','#E8C49A','#4A3527','#B5C99A'];

const ReportScreen = () => {
  const [incomeData, setIncomeData] = useState<CategoryTotal[]>([]);
  const [expenseData, setExpenseData] = useState<CategoryTotal[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    try {
      const [txRes, summaryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/summary'),
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (txRes.data.success) {
        const txs = txRes.data.data;
        setAllTransactions(txs);
        const incomeMap: Record<string, CategoryTotal> = {};
        const expenseMap: Record<string, CategoryTotal> = {};
        txs.forEach((tx: any) => {
          const catName = tx.category?.name || 'Lainnya';
          const catIcon = tx.category?.icon || '';
          if (tx.type === 'INCOME') {
            if (!incomeMap[catName]) incomeMap[catName] = { name: catName, icon: catIcon, total: 0 };
            incomeMap[catName].total += tx.amount;
          } else {
            if (!expenseMap[catName]) expenseMap[catName] = { name: catName, icon: catIcon, total: 0 };
            expenseMap[catName].total += tx.amount;
          }
        });
        setIncomeData(Object.values(incomeMap).sort((a, b) => b.total - a.total));
        setExpenseData(Object.values(expenseMap).sort((a, b) => b.total - a.total));
      }
    } catch {}
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const exportCSV = async () => {
    if (allTransactions.length === 0) {
      Alert.alert('Info', 'Belum ada transaksi untuk diekspor.');
      return;
    }
    setExporting(true);
    try {
      const rows = [
        ['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Jumlah'],
        ...allTransactions.map(tx => [
          formatDate(tx.date),
          tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
          tx.category?.name || 'Lainnya',
          tx.note || '',
          tx.amount.toString(),
        ]),
        [],
        ['RINGKASAN'],
        ['Total Pemasukan', formatCurrency(summary.totalIncome)],
        ['Total Pengeluaran', formatCurrency(summary.totalExpense)],
        ['Saldo Bersih', formatCurrency(summary.balance)],
      ];
      const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const filename = `laporan-sakubumi-${new Date().toISOString().split('T')[0]}.csv`;
      // Share CSV as base64 data URI - no native file system access needed
      // Simple base64 encoding compatible with React Native/Hermes
      const toBase64 = (str: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        const bytes = Array.from(unescape(encodeURIComponent(str))).map(c => c.charCodeAt(0));
        for (let i = 0; i < bytes.length; i += 3) {
          const b0 = bytes[i], b1 = bytes[i+1], b2 = bytes[i+2];
          output += chars[b0 >> 2] + chars[((b0 & 3) << 4) | (b1 >> 4 || 0)] +
                    (b1 !== undefined ? chars[((b1 & 15) << 2) | (b2 >> 6 || 0)] : '=') +
                    (b2 !== undefined ? chars[b2 & 63] : '=');
        }
        return output;
      };
      const base64 = toBase64(csvContent);
      const shareOptions = {
        url: `data:text/csv;base64,${base64}`,
        filename,
        type: 'text/csv',
        title: 'Ekspor Laporan Saku Bumi',
        subject: 'Laporan Keuangan Saku Bumi',
        failOnCancel: false,
      };

      try {
        await Share.open(shareOptions);
      } catch (err: any) {
        // Fallback: If text/csv fails on some Androids, try text/plain
        if (err?.message !== 'User did not share') {
          await Share.open({
            ...shareOptions,
            type: 'text/plain',
          });
        }
      }
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        Alert.alert('Gagal', `Tidak dapat mengekspor: ${e.message || 'Coba lagi'}`);
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loading fullScreen text="Memuat laporan..." />;

  const renderBarSection = (data: CategoryTotal[], total: number, colorStart: number) => {
    if (data.length === 0) return <Text style={styles.noData}>Belum ada data</Text>;
    return (
      <View style={styles.barSection}>
        {data.map((item, i) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          const col = PIE_COLORS[(i + colorStart) % PIE_COLORS.length];
          return (
            <View key={i} style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barEmoji}>{item.icon || '📌'}</Text>
                <Text style={styles.barName} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.barPct, { color: col }]}>{pct.toFixed(1)}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: col }]} />
              </View>
              <Text style={[styles.barAmount, { color: col }]}>{formatCurrency(item.total)}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Laporan Keuangan</Text>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && { opacity: 0.6 }]}
            onPress={exportCSV}
            disabled={exporting}
          >
            <Ionicons name="download-outline" size={16} color={colors.white} />
            <Text style={styles.exportBtnText}>CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.sageDark }]} elevation="sm">
            <Ionicons name="arrow-up-circle-outline" size={20} color="rgba(255,255,255,0.85)" />
            <Text style={styles.summaryLabel}>Pemasukan</Text>
            <Text style={styles.summaryAmt} numberOfLines={1}>{formatCurrency(summary.totalIncome)}</Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: '#C98B6B' }]} elevation="sm">
            <Ionicons name="arrow-down-circle-outline" size={20} color="rgba(255,255,255,0.85)" />
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
            <Text style={styles.summaryAmt} numberOfLines={1}>{formatCurrency(summary.totalExpense)}</Text>
          </Card>
        </View>

        <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]} elevation="md">
          <Text style={styles.balanceLabel}>Saldo Bersih</Text>
          <Text style={styles.balanceAmt}>{formatCurrency(summary.balance)}</Text>
          <View style={styles.balanceBadge}>
            <Ionicons
              name={summary.balance >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={summary.balance >= 0 ? colors.sageLight : '#FFB3A7'}
            />
            <Text style={[styles.balanceBadgeText, { color: summary.balance >= 0 ? colors.sageLight : '#FFB3A7' }]}>
              {summary.balance >= 0 ? 'Keuangan sehat 🌱' : 'Boros nih 😅'}
            </Text>
          </View>
        </Card>

        {/* Income breakdown */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💰 Pemasukan per Kategori</Text>
          </View>
          {renderBarSection(incomeData, summary.totalIncome, 0)}
        </Card>

        {/* Expense breakdown */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💸 Pengeluaran per Kategori</Text>
          </View>
          {renderBarSection(expenseData, summary.totalExpense, 2)}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { ...typography.h2 },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sage,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.round,
  },
  exportBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  summaryCard: { flex: 1, padding: spacing.md, gap: 4 },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  summaryAmt: { color: colors.white, fontWeight: '800', fontSize: 16 },
  balanceCard: { padding: spacing.lg, marginBottom: spacing.md },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  balanceAmt: { color: colors.white, fontWeight: '800', fontSize: 28, marginVertical: 4 },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  balanceBadgeText: { fontSize: 12 },
  sectionCard: { marginBottom: spacing.md },
  sectionHeader: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3 },
  noData: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  barSection: { gap: spacing.sm },
  barRow: { marginBottom: 4 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  barEmoji: { fontSize: 14, marginRight: 6 },
  barName: { flex: 1, ...typography.label, fontSize: 13 },
  barPct: { fontWeight: '700', fontSize: 12 },
  barTrack: { height: 10, backgroundColor: colors.surface, borderRadius: 5, overflow: 'hidden', marginBottom: 3 },
  barFill: { height: '100%', borderRadius: 5 },
  barAmount: { ...typography.caption, fontWeight: '700', textAlign: 'right', fontSize: 12 },
});

export default ReportScreen;
