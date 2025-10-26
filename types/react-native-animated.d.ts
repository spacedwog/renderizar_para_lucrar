// React Native Animated fix
import { Animated as RNAnimated } from 'react-native';

declare module 'react-native' {
  namespace Animated {
    interface AnimatedViewProps extends RNAnimated.AnimatedProps<import('react-native').ViewProps> {}
    const View: React.ComponentType<AnimatedViewProps>;
  }
}