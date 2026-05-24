import React, { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenState } from '../components/ScreenState';
import { api } from '../api/client';
import { colors, common, spacing } from '../theme';
import type { FuelPrices } from '../types';

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
];

export default function FuelPricesScreen() {
  const [prices, setPrices] = useState<FuelPrices | null>(null);
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPrices = useCallback(
    async (selectedCountry = country) => {
      try {
        const data = await api.getFuelPrices(selectedCountry);
        setPrices(data);
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load fuel prices');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [country]
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPrices();
    }, [loadPrices])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPrices();
  };

  const selectCountry = (code: string) => {
    setCountry(code);
    setLoading(true);
    loadPrices(code);
  };

  if (loading && !prices) {
    return <ScreenState loading />;
  }

  return (
    <ScrollView
      style={common.screen}
      contentContainerStyle={common.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accentMuted}
        />
      }
    >
      <Text style={common.label}>Region</Text>
      <View style={styles.countryRow}>
        {COUNTRIES.map((c) => {
          const active = country === c.code;
          return (
            <TouchableOpacity
              key={c.code}
              style={[styles.countryBtn, active && styles.countryBtnActive]}
              onPress={() => selectCountry(c.code)}
              activeOpacity={0.7}
            >
              <Text style={[styles.countryCode, active && styles.countryCodeActive]}>
                {c.code}
              </Text>
              <Text style={[styles.countryLabel, active && styles.countryLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {prices && (
        <>
          <PriceCard
            type="Gasoline"
            price={prices.gasoline}
            currency={prices.currency}
            accent={colors.gasoline}
          />
          <PriceCard
            type="Diesel"
            price={prices.diesel}
            currency={prices.currency}
            accent={colors.diesel}
          />

          <View style={[common.card, styles.metaCard]}>
            <Text style={styles.metaText}>
              {prices.source === 'collectapi' ? 'Live data' : 'Estimated prices'}
            </Text>
            <Text style={styles.metaDate}>
              Updated {new Date(prices.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function PriceCard({
  type,
  price,
  currency,
  accent,
}: {
  type: string;
  price: number;
  currency: string;
  accent: string;
}) {
  return (
    <View style={[common.card, styles.priceCard]}>
      <View style={styles.priceHeader}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <Text style={styles.priceType}>{type}</Text>
      </View>
      <Text style={styles.priceValue}>
        <Text style={styles.currency}>{currency} </Text>
        {price.toFixed(2)}
      </Text>
      <Text style={styles.priceUnit}>per liter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  countryRow: { gap: spacing.sm, marginBottom: spacing.md },
  countryBtn: {
    ...common.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  countryBtnActive: common.cardSelected,
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  countryCodeActive: { color: colors.text },
  countryLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  countryLabelActive: { color: colors.textSecondary },
  priceCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  priceHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  accentBar: { width: 3, height: 16, borderRadius: 2 },
  priceType: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -1,
  },
  currency: { fontSize: 18, fontWeight: '500', color: colors.textMuted },
  priceUnit: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  metaCard: { marginTop: spacing.sm, padding: spacing.md },
  metaText: { fontSize: 13, color: colors.textSecondary },
  metaDate: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});
