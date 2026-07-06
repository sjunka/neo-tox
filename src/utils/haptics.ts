import * as Haptics from 'expo-haptics';

/**
 * Maps distinct hardware haptic patterns onto logical game events.
 * Every trigger swallows failures — haptics must never crash gameplay
 * on devices without a taptic engine (e.g. simulators, some Androids).
 */
export const triggerHaptic = {
  light: (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  heavy: (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },
  success: (): void => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ).catch(() => {});
  },
  error: (): void => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
  },
};
