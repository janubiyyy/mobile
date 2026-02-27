import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { colors, spacing, typography, radius } from '../theme/colors';
import { formatCurrency, formatDateShort, getGreeting, getDayLabel } from '../utils/format';

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const HomeScreen = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ day: string; income: number; expense: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryRes, txRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions'),
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (txRes.data.success) {
        const txs = txRes.data.data;
        setRecentTx(txs.slice(0, 5));
        // Build chart data 7 hari terakhir
        const days: { day: string; income: number; expense: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayStr = d.toISOString().split('T')[0];
          const dayTxs = txs.filter((t: any) => t.date.startsWith(dayStr));
          days.push({
            day: getDayLabel(d),
            income: dayTxs.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0),
            expense: dayTxs.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0),
          });
        }
        setChartData(days);
      }
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

  if (loading) return <Loading fullScreen text="Memuat data..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name}>{user?.name || 'Kawan'}!</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard} elevation="md">
          <Text style={styles.balanceLabel}>Total Saldo</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(summary.balance)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <View style={[styles.dot, { backgroundColor: colors.income }]} />
              <View>
                <Text style={styles.balanceItemLabel}>Pemasukan</Text>
                <Text style={styles.balanceItemValue}>{formatCurrency(summary.totalIncome)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceItem}>
              <View style={[styles.dot, { backgroundColor: colors.expense }]} />
              <View>
                <Text style={styles.balanceItemLabel}>Pengeluaran</Text>
                <Text style={styles.balanceItemValue}>{formatCurrency(summary.totalExpense)}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Mini Bar Chart */}
        <Text style={styles.sectionTitle}>Aktivitas 7 Hari Terakhir</Text>
        <Card style={styles.chartCard}>
          <View style={styles.chart}>
            {chartData.map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={styles.barsWrapper}>
                  <View style={[styles.bar, { height: Math.max(4, (d.income / maxVal) * 80), backgroundColor: colors.income }]} />
                  <View style={[styles.bar, { height: Math.max(4, (d.expense / maxVal) * 80), backgroundColor: colors.expense }]} />
                </View>
                <Text style={styles.chartDay}>{d.day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.income }]} /><Text style={styles.legendLabel}>Masuk</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.expense }]} /><Text style={styles.legendLabel}>Keluar</Text></View>
          </View>
        </Card>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
        {recentTx.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada transaksi. Yuk catat yang pertama! 🌱</Text>
          </Card>
        ) : (
          recentTx.map((tx) => (
            <Card key={tx.id} style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === 'INCOME' ? colors.sageLight : '#F4D5C3' }]}>
                  <Text style={styles.txEmoji}>{tx.category?.icon || (tx.type === 'INCOME' ? '💰' : '💸')}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txNote} numberOfLines={1}>{tx.note || tx.category?.name || 'Transaksi'}</Text>
                  <Text style={styles.txDate}>{formatDateShort(tx.date)}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'INCOME' ? colors.sageDark : colors.expense }]}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting: { ...typography.bodySmall, color: colors.textSecondary },
  name: { ...typography.h2, color: colors.primary },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 18 },
  balanceCard: { backgroundColor: colors.primary, marginBottom: spacing.lg },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 },
  balanceAmount: { color: colors.white, fontSize: 30, fontWeight: '700', marginBottom: spacing.md },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  balanceItemLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  balanceItemValue: { color: colors.white, fontWeight: '600', fontSize: 13 },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: spacing.sm },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm, marginTop: spacing.sm },
  chartCard: { marginBottom: spacing.lg },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 90 },
  chartCol: { alignItems: 'center', gap: 4 },
  barsWrapper: { flexDirection: 'row', gap: 2, alignItems: 'flex-end' },
  bar: { width: 8, borderRadius: 4 },
  chartDay: { ...typography.caption, color: colors.textMuted },
  legend: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...typography.caption },
  emptyCard: { alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  txCard: { marginBottom: spacing.sm, padding: spacing.sm + 4 },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  txEmoji: { fontSize: 20 },
  txInfo: { flex: 1 },
  txNote: { ...typography.label },
  txDate: { ...typography.caption, marginTop: 2 },
  txAmount: { fontWeight: '700', fontSize: 14 },
});

export default HomeScreen;
