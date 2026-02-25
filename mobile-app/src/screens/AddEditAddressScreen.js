import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const AddEditAddressScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { address } = route.params || {};
  const isEdit = !!address;

  const [fullName, setFullName] = useState(address?.fullName || '');
  const [addressLine, setAddressLine] = useState(address?.address || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [zipCode, setZipCode] = useState(address?.zipCode || '');
  const [phone, setPhone] = useState(address?.phone || '');
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName || !addressLine || !city || !state || !zipCode || !phone) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    try {
      const data = {
        fullName,
        address: addressLine,
        city,
        state,
        zipCode,
        phone,
        isDefault,
      };

      if (isEdit) {
        await api.put(`/addresses/${address._id}`, data);
        Toast.show({ type: 'success', text1: 'Address updated' });
      } else {
        await api.post('/addresses', data);
        Toast.show({ type: 'success', text1: 'Address added' });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to save',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: theme.card, top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.form, { backgroundColor: theme.card }]}>
          <Text style={[styles.formTitle, { color: theme.text }]}>
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="Full Name"
            placeholderTextColor={theme.textSecondary}
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="Address"
            placeholderTextColor={theme.textSecondary}
            value={addressLine}
            onChangeText={setAddressLine}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.inputHalf, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="City"
              placeholderTextColor={theme.textSecondary}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={[styles.inputHalf, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="State"
              placeholderTextColor={theme.textSecondary}
              value={state}
              onChangeText={setState}
            />
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="Zip Code"
            placeholderTextColor={theme.textSecondary}
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="Phone"
            placeholderTextColor={theme.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <View style={[styles.defaultRow, { borderTopColor: theme.border }]}>
            <Text style={[styles.defaultLabel, { color: theme.text }]}>Set as default address</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? 'Update' : 'Save'} Address</Text>
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
  scroll: { padding: 16 },
  form: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  formTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  defaultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  defaultLabel: { fontSize: 16, fontWeight: '500' },
  saveBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default AddEditAddressScreen;
