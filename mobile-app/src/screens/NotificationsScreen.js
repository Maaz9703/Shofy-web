import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch orders to create notifications
      const res = await api.get('/orders');
      const orders = res.data.data || [];
      
      // Create notifications from orders
      const orderNotifications = orders.map((order) => ({
        id: order._id,
        type: 'order',
        title: getOrderNotificationTitle(order.status),
        message: `Order #${order._id.slice(-8).toUpperCase()} - ${order.status}`,
        date: order.updatedAt || order.createdAt,
        read: false,
        orderId: order._id,
        status: order.status,
      }));

      // Sort by date (newest first)
      orderNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setNotifications(orderNotifications);
    } catch (error) {
      console.error('Fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getOrderNotificationTitle = (status) => {
    switch (status) {
      case 'Delivered':
        return 'Order Delivered';
      case 'Shipped':
        return 'Order Shipped';
      case 'Processing':
        return 'Order Processing';
      case 'Cancelled':
        return 'Order Cancelled';
      default:
        return 'Order Update';
    }
  };

  const getNotificationIcon = (type, status) => {
    if (type === 'order') {
      switch (status) {
        case 'Delivered':
          return 'checkmark-circle';
        case 'Shipped':
          return 'car';
        case 'Processing':
          return 'time';
        case 'Cancelled':
          return 'close-circle';
        default:
          return 'notifications';
      }
    }
    return 'notifications';
  };

  const getNotificationColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#22c55e';
      case 'Shipped':
        return '#6366f1';
      case 'Processing':
        return '#f59e0b';
      case 'Cancelled':
        return '#ef4444';
      default:
        return theme.primary;
    }
  };

  const handleNotificationPress = (notification) => {
    if (notification.orderId) {
      navigation.navigate('OrderDetails', { orderId: notification.orderId });
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {notifications.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No notifications
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            You'll see order updates here
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const iconColor = getNotificationColor(item.status);
            return (
              <TouchableOpacity
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: theme.card,
                    borderLeftColor: iconColor,
                    opacity: item.read ? 0.7 : 1,
                  },
                ]}
                onPress={() => {
                  handleNotificationPress(item);
                  markAsRead(item.id);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: iconColor + '20' },
                  ]}
                >
                  <Ionicons
                    name={getNotificationIcon(item.type, item.status)}
                    size={24}
                    color={iconColor}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                    {item.message}
                  </Text>
                  <Text style={[styles.notificationDate, { color: theme.textSecondary }]}>
                    {new Date(item.date).toLocaleString()}
                  </Text>
                </View>
                {!item.read && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

export default NotificationsScreen;
