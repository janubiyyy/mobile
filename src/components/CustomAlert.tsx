import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme/colors';

interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  actions: AlertAction[];
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  actions,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  index > 0 && styles.borderLeft,
                  action.style === 'destructive' && styles.destructiveBg,
                ]}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.actionText,
                    action.style === 'cancel' && styles.cancelText,
                    action.style === 'destructive' && styles.destructiveText,
                  ]}
                >
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
    textAlign: 'center',
    color: colors.primaryDark,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  destructiveText: {
    color: colors.white,
  },
  destructiveBg: {
    backgroundColor: colors.expense,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
});

export default CustomAlert;
