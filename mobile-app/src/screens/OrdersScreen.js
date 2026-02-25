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
import { Ionicons } from '@expo/vector-icons';

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate('OrderDetails', { order: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.orderId, { color: theme.text }]}>
          Order #{item._id.slice(-8).toUpperCase()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.date, { color: theme.textSecondary }]}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={[styles.total, { color: theme.primary }]}>
        PKR {item.total?.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return theme.success;
      case 'Shipped':
      case 'Processing':
        return theme.primary;
      case 'Cancelled':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Orders</Text>
        <TouchableOpacity
          style={[styles.quickReorderBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('QuickReorder')}
        >
          <Ionicons name="repeat" size={20} color="#fff" />
          <Text style={styles.quickReorderText}>Quick Reorder</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Your orders will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700' },
  quickReorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  quickReorderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  date: { fontSize: 14, marginBottom: 4 },
  total: { fontSize: 18, fontWeight: '700' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 16, marginTop: 8 },
});

export default OrdersScreen;
