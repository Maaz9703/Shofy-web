import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import LoadingShimmer from '../components/LoadingShimmer';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMNS = 2;
const CARD_WIDTH = (width - 32) / COLUMNS - 8;

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async (searchText = '', categoryFilter = '') => {
    try {
      const params = {};
      const trimmedSearch = searchText && searchText.trim() ? searchText.trim() : '';
      const trimmedCategory = categoryFilter && categoryFilter.trim() ? categoryFilter.trim() : '';
      
      if (trimmedSearch) {
        // If search matches a category exactly, use category filter
        const exactCategoryMatch = categories.find(
          (cat) => cat.toLowerCase() === trimmedSearch.toLowerCase()
        );
        if (exactCategoryMatch) {
          params.category = exactCategoryMatch;
        } else {
          params.search = trimmedSearch;
          // Also filter by category if one is selected
          if (trimmedCategory) {
            params.category = trimmedCategory;
          }
        }
      } else if (trimmedCategory) {
        params.category = trimmedCategory;
      }
      
      const res = await api.get('/products', { params });
      setProducts(res.data.data || []);
    } catch (error) {
      console.error('Fetch products:', error);
      setProducts([]);
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/list');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Fetch categories:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      const ids = new Set((res.data.data || []).map((p) => p._id));
      setWishlistIds(ids);
    } catch {
      setWishlistIds(new Set());
    }
  };

  // Initial load - only once
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchWishlist()]);
      await fetchProducts('', '');
      setLoading(false);
    };
    initialLoad();
  }, []); // Only run once on mount

  // Fetch products when search or category changes (debounced)
  useEffect(() => {
    if (!loading) {
      // Don't show loading spinner for search/filter changes
      fetchProducts(searchDebounce, category);
    }
  }, [searchDebounce, category, fetchProducts, loading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(searchDebounce, category), fetchCategories(), fetchWishlist()]);
    setRefreshing(false);
  }, [searchDebounce, category, fetchProducts]);

  const toggleWishlist = async (product) => {
    const isIn = wishlistIds.has(product._id);
    try {
      if (isIn) {
        await api.delete(`/wishlist/${product._id}`);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
      } else {
        await api.post('/wishlist', { productId: product._id });
        setWishlistIds((prev) => new Set([...prev, product._id]));
      }
    } catch (error) {
      console.error('Wishlist toggle:', error);
    }
  };

  // Get category suggestions based on search text
  const getCategorySuggestions = () => {
    if (!search || !search.trim() || categories.length === 0) return [];
    const searchLower = search.trim().toLowerCase();
    return categories.filter((cat) => cat.toLowerCase().includes(searchLower)).slice(0, 5);
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    if (text && text.trim()) {
      setShowCategorySuggestions(true);
    } else {
      setShowCategorySuggestions(false);
    }
  };

  const handleCategorySuggestionPress = (cat) => {
    setCategory(cat);
    setSearch(cat);
    setShowCategorySuggestions(false);
  };

  const renderProduct = useCallback(({ item, index }) => (
    <ProductCard
      product={item}
      index={index}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
      onWishlist={toggleWishlist}
      isInWishlist={wishlistIds.has(item._id)}
    />
  ), [navigation, toggleWishlist, wishlistIds]);

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top + 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={[styles.title, { fontSize: 32, fontWeight: '800', letterSpacing: 2 }]}>
            <Text style={{ color: '#667eea' }}>S</Text>
            <Text style={{ color: '#764ba2' }}>h</Text>
            <Text style={{ color: '#f093fb' }}>o</Text>
            <Text style={{ color: '#4facfe' }}>f</Text>
            <Text style={{ color: '#00f2fe' }}>y</Text>
          </Text>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="search" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search products or categories..."
                placeholderTextColor={theme.textSecondary}
                value={search}
                onChangeText={handleSearchChange}
                onFocus={() => {
                  if (search) setShowCategorySuggestions(true);
                }}
                onBlur={() => {
                  // Delay hiding to allow suggestion press
                  setTimeout(() => setShowCategorySuggestions(false), 200);
                }}
                returnKeyType="search"
              />
              {search ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearch('');
                    setCategory('');
                    setShowCategorySuggestions(false);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
            {/* Category Suggestions Dropdown */}
            {showCategorySuggestions && getCategorySuggestions().length > 0 && (
              <View style={[styles.suggestionsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.suggestionsTitle, { color: theme.textSecondary }]}>Categories:</Text>
                {getCategorySuggestions().map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                    onPress={() => handleCategorySuggestionPress(cat)}
                  >
                    <Ionicons name="pricetag" size={16} color={theme.primary} />
                    <Text style={[styles.suggestionText, { color: theme.text }]}>{cat}</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              {
                backgroundColor: category ? theme.primary : theme.background,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color={category ? '#fff' : theme.text} />
            <Text
              style={[
                styles.categoryBtnText,
                { color: category ? '#fff' : theme.text },
              ]}
            >
              {category || 'Category'}
            </Text>
            {category && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setCategory('');
                  setSearch('');
                }}
                style={{ marginLeft: 4 }}
              >
                <Ionicons name="close-circle" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.advancedSearchBtn,
              { backgroundColor: theme.primary },
            ]}
            onPress={() => navigation.navigate('AdvancedSearch')}
          >
            <Ionicons name="options-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {categories.length > 0 && category && (
          <View style={styles.selectedCategoryContainer}>
            <Text style={[styles.selectedCategoryLabel, { color: theme.textSecondary }]}>
              Filtered by:
            </Text>
            <View style={[styles.selectedCategoryChip, { backgroundColor: theme.primary }]}>
              <Text style={[styles.selectedCategoryText, { color: '#fff' }]}>{category}</Text>
              <TouchableOpacity onPress={() => setCategory('')}>
                <Ionicons name="close-circle" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <LoadingShimmer />
      ) : (
        <FlatList
          data={products}
          numColumns={COLUMNS}
          keyExtractor={keyExtractor}
          renderItem={renderProduct}
          contentContainerStyle={styles.list}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={64} color={theme.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {search || category ? 'No products found matching your search' : 'No products found'}
              </Text>
              {(search || category) && (
                <TouchableOpacity
                  style={[styles.clearFilterBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => {
                    setSearch('');
                    setCategory('');
                  }}
                >
                  <Text style={[styles.clearFilterText, { color: theme.primary }]}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={[
                  styles.modalCategoryItem,
                  {
                    backgroundColor: !category ? theme.primary : theme.background,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  setCategory('');
                  setCategoryModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalCategoryText,
                    { color: !category ? '#fff' : theme.text },
                  ]}
                >
                  All Categories
                </Text>
                {!category && <Ionicons name="checkmark" size={20} color="#fff" />}
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.modalCategoryItem,
                    {
                      backgroundColor: cat === category ? theme.primary : theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalCategoryText,
                      { color: cat === category ? '#fff' : theme.text },
                    ]}
                  >
                    {cat}
                  </Text>
                  {cat === category && <Ionicons name="checkmark" size={20} color="#fff" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  searchRow: {
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 4 },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  advancedSearchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    minWidth: 100,
  },
  categoryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  selectedCategoryLabel: {
    fontSize: 14,
  },
  selectedCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  selectedCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: { padding: 8, paddingBottom: 100 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, paddingHorizontal: 24 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  clearFilterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  clearFilterText: { fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 16,
  },
  modalCategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalCategoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;
