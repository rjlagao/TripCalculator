import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenState } from '../components/ScreenState';
import { api } from '../api/client';
import { colors, common, radius, spacing } from '../theme';
import type { CreateVehicleInput, FuelType, Vehicle } from '../types';

const emptyForm: CreateVehicleInput = {
  name: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  fuelType: 'gasoline',
  consumptionPer100km: 7,
};

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateVehicleInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      name: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fuelType: vehicle.fuelType,
      consumptionPer100km: vehicle.consumptionPer100km,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.make.trim() || !form.model.trim()) {
      Alert.alert('Validation', 'Name, make, and model are required.');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await api.updateVehicle(editingId, form);
      } else {
        await api.createVehicle(form);
      }
      setModalVisible(false);
      loadVehicles();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (vehicle: Vehicle) => {
    Alert.alert('Delete vehicle', `Remove "${vehicle.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteVehicle(vehicle.id);
            loadVehicles();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  const setFuelType = (fuelType: FuelType) => setForm((f) => ({ ...f, fuelType }));

  if (loading) {
    return <ScreenState loading />;
  }

  return (
    <View style={common.screen}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="car-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No vehicles yet</Text>
            <Text style={styles.emptyHint}>Tap + to add your first vehicle</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[common.card, styles.card]}>
            <View
              style={[
                styles.fuelIndicator,
                {
                  backgroundColor:
                    item.fuelType === 'diesel' ? colors.diesel : colors.gasoline,
                },
              ]}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                {item.make} {item.model} · {item.year}
              </Text>
              <Text style={styles.cardDetail}>
                {item.consumptionPer100km} L/100km · {item.fuelType}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                <Ionicons name="pencil-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.9}>
        <Ionicons name="add" size={26} color={colors.bg} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit vehicle' : 'New vehicle'}
            </Text>

            <TextInput
              style={common.input}
              placeholder="Nickname"
              placeholderTextColor={colors.textMuted}
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            />
            <TextInput
              style={[common.input, styles.inputSpacing]}
              placeholder="Make"
              placeholderTextColor={colors.textMuted}
              value={form.make}
              onChangeText={(make) => setForm((f) => ({ ...f, make }))}
            />
            <TextInput
              style={[common.input, styles.inputSpacing]}
              placeholder="Model"
              placeholderTextColor={colors.textMuted}
              value={form.model}
              onChangeText={(model) => setForm((f) => ({ ...f, model }))}
            />
            <View style={styles.rowInputs}>
              <TextInput
                style={[common.input, styles.halfInput]}
                placeholder="Year"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={String(form.year)}
                onChangeText={(v) =>
                  setForm((f) => ({ ...f, year: parseInt(v, 10) || f.year }))
                }
              />
              <TextInput
                style={[common.input, styles.halfInput]}
                placeholder="L/100km"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={String(form.consumptionPer100km)}
                onChangeText={(v) =>
                  setForm((f) => ({
                    ...f,
                    consumptionPer100km: parseFloat(v) || f.consumptionPer100km,
                  }))
                }
              />
            </View>

            <Text style={common.label}>Fuel type</Text>
            <View style={styles.fuelToggle}>
              {(['gasoline', 'diesel'] as FuelType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.fuelBtn, form.fuelType === type && styles.fuelBtnActive]}
                  onPress={() => setFuelType(type)}
                >
                  <Text
                    style={[
                      styles.fuelBtnText,
                      form.fuelType === type && styles.fuelBtnTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[common.primaryButton, styles.saveBtn, saving && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.bg} size="small" />
                ) : (
                  <Text style={common.primaryButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: 100, gap: spacing.sm },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyText: { fontSize: 17, fontWeight: '600', color: colors.text, marginTop: spacing.md },
  emptyHint: { fontSize: 14, color: colors.textMuted },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 0,
  },
  fuelIndicator: { width: 3, alignSelf: 'stretch' },
  cardContent: { flex: 1, padding: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  cardDetail: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  cardActions: { flexDirection: 'row', paddingRight: spacing.sm },
  iconBtn: { padding: spacing.sm },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 8,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },
  inputSpacing: { marginTop: spacing.sm },
  rowInputs: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  halfInput: { flex: 1 },
  fuelToggle: { flexDirection: 'row', gap: spacing.sm },
  fuelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  fuelBtnActive: {
    backgroundColor: colors.surfaceHover,
    borderColor: colors.accentMuted,
  },
  fuelBtnText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  fuelBtnTextActive: { color: colors.text },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  saveBtn: { flex: 1, marginTop: 0 },
  buttonDisabled: { opacity: 0.6 },
});
