import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const AddressManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data.data || []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load addresses' });
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  }, [fetchAddresses]);

  const setDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      await fetchAddresses();
      Toast.show({ type: 'success', text1: 'Default address updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update' });
    }
  };

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
      Toast.show({ type: 'success', text1: 'Address deleted' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete' });
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {item.isDefault && (
        <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
      <Text style={[styles.name, { color: theme.text }]}>{item.fullName}</Text>
      <Text style={[styles.addrText, { color: theme.textSecondary }]}>
        {item.address}, {item.city}, {item.state} {item.zipCode}
      </Text>
      <Text style={[styles.phone, { color: theme.textSecondary }]}>{item.phone}</Text>
      <View style={styles.actions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: theme.primary }]}
            onPress={() => setDefault(item._id)}
          >
            <Text style={[styles.actionText, { color: theme.primary }]}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: theme.primary }]}
          onPress={() => navigation.navigate('AddEditAddress', { address: item })}
        >
          <Text style={[styles.actionText, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteAddress(item._id)}>
          <Ionicons name="trash-outline" size={24} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: theme.card }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Address Management</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddEditAddress')}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Address</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={80} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No addresses yet</Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('AddEditAddress')}
              >
                <Text style={styles.emptyBtnText}>Add your first address</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { padding: 16, paddingTop: 100 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  defaultBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  addrText: { fontSize: 14, marginBottom: 4 },
  phone: { fontSize: 14, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: { fontSize: 14, fontWeight: '600' },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 24 },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AddressManagementScreen;
