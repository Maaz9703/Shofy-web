import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/addresses');
      const list = res.data.data || [];
      setAddresses(list);
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      setSelectedAddress(defaultAddr);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load addresses' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && addresses.length > 0) {
      Toast.show({ type: 'error', text1: 'Please select a shipping address' });
      return;
    }

    if (addresses.length === 0) {
      Toast.show({ type: 'error', text1: 'Please add a shipping address first' });
      navigation.getParent()?.navigate('Profile', { screen: 'AddressManagement' });
      return;
    }

    if (cartItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Cart is empty' });
      return;
    }

    setPlacing(true);
    try {
      const shippingAddress = {
        fullName: selectedAddress.fullName,
        address: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        phone: selectedAddress.phone,
      };

      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      };

      await api.post('/orders', orderData);
      setSuccess(true);
      clearCart();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Order failed',
      });
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: theme.background }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color={theme.success} />
        </View>
        <Text style={[styles.successTitle, { color: theme.text }]}>Order Placed!</Text>
        <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
          {paymentMethod === 'COD'
            ? 'Cash on Delivery - Pay when you receive'
            : 'Payment processing'}
        </Text>
        <TouchableOpacity
          style={[styles.successBtn, { backgroundColor: theme.primary }]}
          onPress={() => {
            setSuccess(false);
            navigation.navigate('OrdersMain');
          }}
        >
          <Text style={styles.successBtnText}>View Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: theme.card, top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Shipping Address</Text>
          {loading ? (
            <ActivityIndicator color={theme.primary} />
          ) : addresses.length === 0 ? (
            <TouchableOpacity
              style={[styles.addAddrBtn, { borderColor: theme.primary }]}
              onPress={() => navigation.navigate('ProfileMain')}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
              <Text style={[styles.addAddrText, { color: theme.primary }]}>
                Add Address
              </Text>
            </TouchableOpacity>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr._id}
                style={[
                  styles.addressCard,
                  {
                    borderColor: selectedAddress?._id === addr._id ? theme.primary : theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
                onPress={() => setSelectedAddress(addr)}
              >
                <Text style={[styles.addrText, { color: theme.text }]}>
                  {addr.fullName}, {addr.address}, {addr.city}, {addr.state} {addr.zipCode}
                </Text>
                <Text style={[styles.addrPhone, { color: theme.textSecondary }]}>
                  {addr.phone}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'COD' ? theme.primary : theme.border },
              { backgroundColor: theme.background },
            ]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons
              name="cash-outline"
              size={24}
              color={paymentMethod === 'COD' ? theme.primary : theme.textSecondary}
            />
            <Text style={[styles.paymentText, { color: theme.text }]}>
              Cash on Delivery
            </Text>
            {paymentMethod === 'COD' && (
              <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'ONLINE' ? theme.primary : theme.border },
              { backgroundColor: theme.background },
            ]}
            onPress={() => setPaymentMethod('ONLINE')}
          >
            <Ionicons
              name="card-outline"
              size={24}
              color={paymentMethod === 'ONLINE' ? theme.primary : theme.textSecondary}
            />
            <Text style={[styles.paymentText, { color: theme.text }]}>
              Online Payment (Stripe - Coming Soon)
            </Text>
            {paymentMethod === 'ONLINE' && (
              <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal:</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {cartTotal.toFixed(2)}</Text>
          </View>
          {paymentMethod === 'COD' && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Shipping Charges:</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>PKR 100.00</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalText, { color: theme.text }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: theme.primary, fontWeight: '700' }]}>
              PKR {(cartTotal + (paymentMethod === 'COD' ? 100 : 0)).toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeBtn, { backgroundColor: theme.primary }]}
          onPress={handlePlaceOrder}
          disabled={placing || addresses.length === 0}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeBtnText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { padding: 16, paddingBottom: 40 },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  addressCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  addrText: { fontSize: 14, marginBottom: 4 },
  addrPhone: { fontSize: 12 },
  addAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  addAddrText: { fontSize: 16, fontWeight: '600' },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
    gap: 12,
  },
  paymentText: { flex: 1, fontSize: 16, fontWeight: '500' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16 },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalText: { fontSize: 18, fontWeight: '600' },
  totalValue: { fontSize: 18 },
  placeBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  placeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: { marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  successSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  successBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CheckoutScreen;
