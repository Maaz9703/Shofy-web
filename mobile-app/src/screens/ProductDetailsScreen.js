import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { getQuantityDiscount } from '../utils/price';

const { width: screenWidth } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { product: initialProduct } = route.params || {};
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (initialProduct?._id && !initialProduct.description) {
      api.get(`/products/${initialProduct._id}`).then((res) => setProduct(res.data.data)).finally(() => setLoading(false));
    } else if (!initialProduct) {
      setLoading(false);
    }
  }, [initialProduct?._id]);

  const handleAddToCart = async () => {
    if (!product || product.stock < quantity) {
      Toast.show({ type: 'error', text1: 'Insufficient stock' });
      return;
    }
    setAddingToCart(true);
    try {
      addToCart(product, quantity);
      Toast.show({ type: 'success', text1: 'Added to cart' });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingCard, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading product...</Text>
        </View>
      </View>
    );
  }

  const stockLabel = product.stock === 0 ? 'Out of stock' : product.stock <= 10 ? 'Low stock' : 'In stock';
  const stockColor = product.stock === 0 ? '#ef4444' : product.stock <= 10 ? '#f59e0b' : '#22c55e';
  const { unitPrice, totalPrice, originalPrice, hasDiscount, discountPercent, tiers } = getQuantityDiscount(product, quantity);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: theme.card, top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.imageWrap}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.imageGradient}
          />
          <View style={[styles.stockBadge, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
            <Text style={styles.stockBadgeText}>{stockLabel}</Text>
          </View>
        </Animated.View>

        <View style={[styles.content, { backgroundColor: theme.card }]}>
          <View style={[styles.categoryPill, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="pricetag" size={14} color={theme.primary} />
            <Text style={[styles.categoryPillText, { color: theme.primary }]}>{product.category}</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{product.title}</Text>

          <View style={[styles.priceBlock, { borderBottomColor: theme.border }]}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Price</Text>
            <View style={styles.priceRow}>
              {hasDiscount && (
                <Text style={[styles.price, { color: theme.textSecondary, textDecorationLine: 'line-through', marginRight: 8, fontSize: 16 }]}>
                  PKR {originalPrice.toFixed(2)}
                </Text>
              )}
              <Text style={[styles.price, { color: theme.primary }]}>
                PKR {unitPrice.toFixed(2)} per unit
              </Text>
              {hasDiscount && (
                <View style={[styles.saveBadge, { backgroundColor: theme.success + '22', marginLeft: 8 }]}>
                  <Text style={[styles.saveBadgeText, { color: theme.success }]}>{discountPercent}% off</Text>
                </View>
              )}
              {!hasDiscount && Number(product.price) > 999 && (
                <View style={[styles.saveBadge, { backgroundColor: theme.primary + '22' }]}>
                  <Text style={[styles.saveBadgeText, { color: theme.primary }]}>Best value</Text>
                </View>
              )}
            </View>
            <Text style={[styles.priceLabel, { color: theme.textSecondary, marginTop: 6 }]}>
              Total for {quantity} × PKR {unitPrice.toFixed(2)} = PKR {totalPrice.toFixed(2)}
            </Text>
          </View>

          {tiers?.length > 0 && (
            <View style={[styles.descBox, { backgroundColor: theme.background, marginBottom: 16 }]}>
              <Text style={[styles.descLabel, { color: theme.textSecondary }]}>Quantity discounts</Text>
              {tiers.map((t, i) => (
                <Text key={i} style={[styles.description, { color: theme.text }]}>Buy {t.minQty}+ → {t.discountPercent}% off</Text>
              ))}
            </View>
          )}

          <Text style={[styles.descLabel, { color: theme.textSecondary }]}>Description</Text>
          <View style={[styles.descBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.description, { color: theme.text }]}>
              {product.description}
            </Text>
          </View>

          <View style={[styles.quantityBlock, { backgroundColor: theme.background }]}>
            <Text style={[styles.label, { color: theme.text }]}>Quantity</Text>
            <View style={[styles.quantityRow, { borderColor: theme.border }]}>
              <View style={[styles.quantityControls, { borderColor: theme.border, backgroundColor: theme.card }]}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.quantityBtn}
                >
                  <Ionicons name="remove" size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: theme.text }]}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  style={styles.quantityBtn}
                >
                  <Ionicons name="add" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.stockHint, { color: theme.textSecondary }]}>
              {product.stock} available in stock
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={handleAddToCart}
            disabled={product.stock < 1 || addingToCart}
            activeOpacity={0.85}
          >
            {addingToCart ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cart" size={22} color="#fff" />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingCard: {
    paddingHorizontal: 32,
    paddingVertical: 28,
    borderRadius: 20,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingText: { fontSize: 15, fontWeight: '500' },
  scrollContent: { paddingBottom: 32 },
  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageWrap: {
    width: screenWidth,
    height: screenWidth * 0.92,
    backgroundColor: '#e5e5e5',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  stockBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockBadgeText: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  content: {
    padding: 26,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 14,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    marginBottom: 14,
    gap: 8,
  },
  categoryPillText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 27, fontWeight: '800', lineHeight: 36, marginBottom: 16, letterSpacing: 0.3 },
  priceBlock: {
    marginBottom: 22,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  priceLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  price: { fontSize: 32, fontWeight: '800' },
  saveBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  saveBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  descLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  descBox: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 24,
  },
  description: { fontSize: 16, lineHeight: 26 },
  quantityBlock: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 28,
  },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 12, letterSpacing: 0.4 },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 18,
    overflow: 'hidden',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 18,
    overflow: 'hidden',
    flex: 1,
  },
  quantityBtn: { padding: 16, minWidth: 52 },
  quantityText: { fontSize: 20, fontWeight: '800', minWidth: 40, textAlign: 'center' },
  stockHint: { fontSize: 12, marginTop: 10, textAlign: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  addBtnText: { color: '#fff', fontSize: 19, fontWeight: '800', letterSpacing: 0.3 },
});

export default ProductDetailsScreen;
