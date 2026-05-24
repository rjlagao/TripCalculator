import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, common } from '../theme';

type Props = {
  loading?: boolean;
  title?: string;
  subtitle?: string;
};

export function ScreenState({ loading, title, subtitle }: Props) {
  return (
    <View style={common.centered}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.accentMuted} />
      ) : (
        <>
          {title && <Text style={common.emptyTitle}>{title}</Text>}
          {subtitle && <Text style={common.emptySubtitle}>{subtitle}</Text>}
        </>
      )}
    </View>
  );
}
