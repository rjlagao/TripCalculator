import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#141416',
  bgElevated: '#1C1C1F',
  surface: '#252528',
  surfaceHover: '#2E2E32',
  border: '#333338',
  borderSubtle: '#2A2A2E',

  text: '#F4F4F5',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  accent: '#E4E4E7',
  accentMuted: '#A1A1AA',

  gasoline: '#D4A574',
  diesel: '#94A3B8',

  danger: '#F87171',
  dangerMuted: '#7F1D1D33',

  overlay: 'rgba(0, 0, 0, 0.65)',
  tabBar: '#1A1A1D',
  header: '#1C1C1F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  full: 999,
};

export const typography = {
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
};

export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  cardSelected: {
    backgroundColor: colors.surfaceHover,
    borderColor: colors.accentMuted,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.accent,
    background: colors.bg,
    card: colors.header,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};
