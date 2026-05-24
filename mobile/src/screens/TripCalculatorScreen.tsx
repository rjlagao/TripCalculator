import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
import { colors, common, spacing } from '../theme';
import type { TripCalculationResult, Vehicle } from '../types';

export default function TripCalculatorScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [distance, setDistance] = useState('');
  const [result, setResult] = useState<TripCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const loadVehicles = useCallback(async () => {
    try {
      setLoadingVehicles(true);
      const data = await api.getVehicles();
      setVehicles(data);
      if (data.length && !selectedVehicleId) {
        setSelectedVehicleId(data[0].id);
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setLoadingVehicles(false);
    }
  }, [selectedVehicleId]);

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  const handleCalculate = async () => {
    const distanceKm = parseFloat(distance);
    if (!selectedVehicleId || isNaN(distanceKm) || distanceKm <= 0) {
      Alert.alert('Invalid input', 'Select a vehicle and enter a valid distance in km.');
      return;
    }

    try {
      setLoading(true);
      const tripResult = await api.calculateTrip(selectedVehicleId, distanceKm);
      setResult(tripResult);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingVehicles) {
    return <ScreenState loading />;
  }

  if (!vehicles.length) {
    return (
      <ScreenState
        title="No vehicles yet"
        subtitle="Add a vehicle in the Vehicles tab to start calculating trips."
      />
    );
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <Text style={common.label}>Vehicle</Text>
      <View style={styles.vehicleList}>
        {vehicles.map((vehicle) => {
          const selected = selectedVehicleId === vehicle.id;
          return (
            <TouchableOpacity
              key={vehicle.id}
              style={[common.card, styles.vehicleCard, selected && common.cardSelected]}
              onPress={() => setSelectedVehicleId(vehicle.id)}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleRow}>
                <View
                  style={[
                    styles.fuelDot,
                    {
                      backgroundColor:
                        vehicle.fuelType === 'diesel' ? colors.diesel : colors.gasoline,
                    },
                  ]}
                />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehicleDetail}>
                    {vehicle.make} {vehicle.model} · {vehicle.consumptionPer100km} L/100km
                  </Text>
                </View>
                {selected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={common.label}>Distance</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={common.input}
          value={distance}
          onChangeText={setDistance}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.inputUnit}>km</Text>
      </View>

      <TouchableOpacity
        style={[common.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleCalculate}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={common.primaryButtonText}>Calculate</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Estimate</Text>
          <View style={styles.resultGrid}>
            <ResultItem label="Distance" value={`${result.distanceKm} km`} />
            <ResultItem label="Fuel" value={`${result.fuelNeededLiters} L`} />
            <ResultItem
              label="Per liter"
              value={`${result.currency} ${result.fuelPricePerLiter.toFixed(2)}`}
            />
          </View>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {result.currency} {result.estimatedCost.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultItem}>
      <Text style={styles.resultItemLabel}>{label}</Text>
      <Text style={styles.resultItemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  vehicleList: { gap: spacing.sm },
  vehicleCard: { paddingVertical: spacing.md },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fuelDot: { width: 8, height: 8, borderRadius: 4 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '600', color: colors.text },
  vehicleDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inputUnit: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
  buttonDisabled: { opacity: 0.6 },
  resultCard: {
    ...common.card,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  resultGrid: { gap: spacing.md },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultItemLabel: { fontSize: 15, color: colors.textSecondary },
  resultItemValue: { fontSize: 15, fontWeight: '500', color: colors.text },
  totalBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: { fontSize: 15, color: colors.textSecondary },
  totalValue: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
  },
});
