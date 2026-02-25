import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: 'location-outline',
      label: 'Address Management',
      onPress: () => navigation.navigate('AddressManagement'),
    },
    {
      icon: 'heart-outline',
      label: 'Wishlist',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      icon: 'eye-outline',
      label: 'Recently Viewed',
      onPress: () => navigation.navigate('RecentlyViewed'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'repeat-outline',
      label: 'Quick Reorder',
      onPress: () => navigation.navigate('Orders', { screen: 'QuickReorder' }),
    },
    {
      icon: 'git-compare-outline',
      label: 'Compare Products',
      onPress: () => navigation.navigate('Home', { screen: 'ProductComparison' }),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user?.email || ''}
          </Text>
        </View>

        <View style={[styles.menu, { backgroundColor: theme.card }]}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, { borderBottomColor: theme.border }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={24} color={theme.textSecondary} />
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
          <View style={[styles.menuItem, { borderBottomColor: theme.border }]}>
            <Ionicons name="moon-outline" size={24} color={theme.textSecondary} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.error }]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 100 },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 14 },
  menu: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
