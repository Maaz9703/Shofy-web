import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const WishlistScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setProducts(res.data.data || []);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (product) => {
    try {
      await api.delete(`/wishlist/${product._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      Toast.show({ type: 'success', text1: 'Removed from wishlist' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to remove' });
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        style={styles.cardContent}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.price, { color: theme.primary }]}>
            PKR {item.price?.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => {
            addToCart(item);
            Toast.show({ type: 'success', text1: 'Added to cart' });
          }}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeFromWishlist(item)}>
          <Ionicons name="heart" size={24} color={theme.error} />
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
        <Text style={[styles.title, { color: theme.text }]}>Wishlist</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={80} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No items in wishlist</Text>
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
  title: { fontSize: 24, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: { fontSize: 18, fontWeight: '600' },
});

export default WishlistScreen;
