declare module 'react-native-vector-icons/Ionicons' {
  import { ReactNode, Component } from 'react';
  import { TextProps, ViewStyle, StyleProp } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
  }

  export default class Ionicons extends Component<IconProps> {
    static glyphMap: { [key: string]: number };
  }
}
