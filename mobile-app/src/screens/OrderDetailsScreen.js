import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const OrderDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { order } = route.params || {};
  const [expandedSection, setExpandedSection] = useState('items');

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Order not found</Text>
      </View>
    );
  }

  const statusTimeline = order.statusHistory || [{ status: order.status }];
  const items = order.items || [];

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: theme.card }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Status</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.badgeText}>{order.status}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Timeline</Text>
          {statusTimeline.map((entry, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: getStatusColor(entry.status) }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineStatus, { color: theme.text }]}>
                  {entry.status}
                </Text>
                <Text style={[styles.timelineDate, { color: theme.textSecondary }]}>
                  {entry.date ? new Date(entry.date).toLocaleString() : ''}
                </Text>
                {entry.note && (
                  <Text style={[styles.timelineNote, { color: theme.textSecondary }]}>
                    {entry.note}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Items ({items.length})</Text>
          {items.map((item, idx) => (
            <View
              key={idx}
              style={[styles.itemRow, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                {item.title || item.product?.title}
              </Text>
              <Text style={[styles.itemQty, { color: theme.textSecondary }]}>
                x{item.quantity} - PKR {((item.price || 0) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {order.shippingAddress && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Shipping Address</Text>
            <Text style={[styles.addrText, { color: theme.text }]}>
              {order.shippingAddress.fullName}
            </Text>
            <Text style={[styles.addrText, { color: theme.textSecondary }]}>
              {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </Text>
            <Text style={[styles.addrText, { color: theme.textSecondary }]}>
              {order.shippingAddress.phone}
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          {(() => {
            const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
            const shippingCharges = order.shippingCharges || 0;
            return (
              <>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {subtotal.toFixed(2)}</Text>
                </View>
                {shippingCharges > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Shipping Charges:</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {shippingCharges.toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Total:</Text>
                  <Text style={[styles.totalValue, { color: theme.primary }]}>
                    PKR {order.total?.toFixed(2)}
                  </Text>
                </View>
              </>
            );
          })()}
          <Text style={[styles.paymentMethod, { color: theme.textSecondary, marginTop: 8 }]}>
            Payment: {order.paymentMethod || 'COD'}
          </Text>
        </View>
      </ScrollView>
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
  scroll: { padding: 16, paddingTop: 100, paddingBottom: 40 },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  timelineDate: { fontSize: 12 },
  timelineNote: { fontSize: 12, marginTop: 4 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemTitle: { flex: 1, fontSize: 16 },
  itemQty: { fontSize: 14 },
  addrText: { fontSize: 14, marginBottom: 4 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 18, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '700' },
  paymentMethod: { fontSize: 14 },
  errorText: { fontSize: 18 },
});

export default OrderDetailsScreen;
