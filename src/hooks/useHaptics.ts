import * as Haptics from 'expo-haptics';

let hapticsEnabled = true;

export const setHapticsEnabled = (enabled: boolean) => {
  hapticsEnabled = enabled;
};

export const getHapticsEnabled = () => hapticsEnabled;

export function useHaptics() {
  const lightImpact = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  };

  const mediumImpact = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
  };

  const heavyImpact = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}
  };

  const success = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
  };

  const error = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {}
  };

  const warning = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {}
  };

  const selection = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
  };

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    success,
    error,
    warning,
    selection,
    setHapticsEnabled,
  };
}
