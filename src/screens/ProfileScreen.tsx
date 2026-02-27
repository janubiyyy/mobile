import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';
import Card from '../components/Card';
import { colors, spacing, typography, radius } from '../theme/colors';
import { MainStackParamList } from '../navigation/MainTabs';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<NavProp>();

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  const menuItems = [
    {
      icon: 'grid-outline' as const,
      label: 'Kelola Kategori',
      onPress: () => navigation.navigate('Kategori'),
    },
    {
      icon: 'information-circle-outline' as const,
      label: 'Tentang Aplikasi',
      onPress: () =>
        Alert.alert('Saku Bumi v1.0.0 🌱', 'Aplikasi pencatat keuangan personal yang ramah lingkungan.\n\nCatat Uangmu, Sayangi Bumimu 🌿'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>Profil</Text>

        {/* Avatar Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.name || '-'}</Text>
          <Text style={styles.email}>{user?.email || '-'}</Text>
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard} elevation="sm">
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nama</Text>
              <Text style={styles.infoValue}>{user?.name || '-'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>
        </Card>

        {/* Menu Card */}
        <Card style={styles.menuCard} elevation="sm">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.menuRow} onPress={item.onPress} activeOpacity={0.7}>
                <View style={[styles.menuIconBox, { backgroundColor: colors.background }]}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        {/* Version */}
        <View style={styles.versionBox}>
          <Text style={styles.version}>Saku Bumi v1.0.0 🌿</Text>
          <Text style={styles.tagline}>Catat Uangmu, Sayangi Bumimu</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  title: { ...typography.h2, marginBottom: spacing.lg },

  heroSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.accent + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '800' },
  name: { ...typography.h2, textAlign: 'center' },
  email: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },

  infoCard: { marginBottom: spacing.md, padding: 0, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 2 },
  infoValue: { ...typography.body, fontWeight: '600' },

  menuCard: { marginBottom: spacing.md, padding: 0, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  menuIconBox: { width: 36, height: 36, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  menuLabel: { ...typography.body, flex: 1 },

  divider: { height: 1, backgroundColor: colors.divider, marginLeft: spacing.md + 36 + spacing.md },

  versionBox: { alignItems: 'center', marginBottom: spacing.lg },
  version: { ...typography.bodySmall, color: colors.textMuted, fontWeight: '600' },
  tagline: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.error + '60',
    backgroundColor: '#FFF5F5',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.error },
});

export default ProfileScreen;
