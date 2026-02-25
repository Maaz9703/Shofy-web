import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <Image
        source={{ uri: item.product.image || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={2}>
          {item.product.title}
        </Text>
        <Text style={[styles.price, { color: theme.primary }]}>
          PKR {item.product.price?.toFixed(2)}
        </Text>
        <View style={styles.actions}>
          <View style={[styles.quantityRow, { borderColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
              style={styles.qtyBtn}
            >
              <Ionicons name="remove" size={18} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
              style={styles.qtyBtn}
            >
              <Ionicons name="add" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeFromCart(item.product._id)}>
            <Ionicons name="trash-outline" size={22} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  if (cartCount === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="cart-outline" size={80} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Add some products to get started
        </Text>
        <TouchableOpacity
          style={[styles.shopBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.getParent()?.navigate('Home')}
        >
          <Text style={styles.shopBtnText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Cart ({cartCount})</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: theme.primary }]}>
            PKR {cartTotal.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 160 },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: { width: 100, height: 100, backgroundColor: '#e0e0e0' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  qtyBtn: { padding: 6 },
  qtyText: { fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 18, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '700' },
  checkoutBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 16, marginTop: 8 },
  shopBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CartScreen;
