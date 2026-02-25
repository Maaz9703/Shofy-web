import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getQuantityDiscount } from '../utils/price';

const ProductCard = ({ product, index, onPress, onWishlist, isInWishlist }) => {
  const { theme } = useTheme();
  const { unitPrice, hasDiscount, discountPercent } = getQuantityDiscount(product, 1);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/300' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.wishlistBtn, { backgroundColor: theme.card }]}
            onPress={() => onWishlist?.(product)}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={22}
              color={isInWishlist ? '#ef4444' : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={[styles.category, { color: theme.textSecondary }]}>
            {product.category}
          </Text>
          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              <Text style={[styles.price, { color: theme.primary }]}>
                PKR {unitPrice.toFixed(2)}
              </Text>
              {hasDiscount && (
                <Text style={{ fontSize: 10, color: theme.success, fontWeight: '600' }}>{discountPercent}% off</Text>
              )}
              {!hasDiscount && product.quantityDiscounts?.length > 0 && (
                <Text style={{ fontSize: 10, color: theme.textSecondary }}>qty discount</Text>
              )}
            </View>
            {product.stock > 0 ? (
              <Text style={[styles.stock, { color: theme.success }]}>In stock</Text>
            ) : (
              <Text style={[styles.stock, { color: theme.error }]}>Out of stock</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  stock: {
    fontSize: 11,
  },
});

export default ProductCard;
