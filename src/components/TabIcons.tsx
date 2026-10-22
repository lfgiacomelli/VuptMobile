import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface IconProps {
  color: string;
  size: number;
}

export const Home = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 10.2L12 3.5L20.5 10.2V19.5C20.5 20.05 20.05 20.5 19.5 20.5H14.5V14.5C14.5 13.95 14.05 13.5 13.5 13.5H10.5C9.95 13.5 9.5 13.95 9.5 14.5V20.5H4.5C3.95 20.5 3.5 20.05 3.5 19.5V10.2Z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.08"
    />
  </Svg>
);

export const HomeOutline = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 10.2L12 3.5L20.5 10.2V19.5C20.5 20.05 20.05 20.5 19.5 20.5H14.5V14.5C14.5 13.95 14.05 13.5 13.5 13.5H10.5C9.95 13.5 9.5 13.95 9.5 14.5V20.5H4.5C3.95 20.5 3.5 20.05 3.5 19.5V10.2Z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const Receipt = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3.5H17C17.83 3.5 18.5 4.17 18.5 5V20.2L16.3 18.8L14.1 20.2L12 18.8L9.9 20.2L7.7 18.8L5.5 20.2V5C5.5 4.17 6.17 3.5 7 3.5Z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.08"
    />
    <Path
      d="M8.5 8H15.5"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <Path
      d="M8.5 11.5H15.5"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <Path
      d="M8.5 15H13"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </Svg>
);

export const ReceiptOutline = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3.5H17C17.83 3.5 18.5 4.17 18.5 5V20.2L16.3 18.8L14.1 20.2L12 18.8L9.9 20.2L7.7 18.8L5.5 20.2V5C5.5 4.17 6.17 3.5 7 3.5Z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M8.5 8H15.5"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <Path
      d="M8.5 11.5H15.5"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <Path
      d="M8.5 15H13"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </Svg>
);

export const User = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="3.7"
      stroke={color}
      strokeWidth="1.9"
      fill={color}
      fillOpacity="0.08"
    />
    <Path
      d="M5.5 19.2C5.5 15.9 8.1 13.7 12 13.7C15.9 13.7 18.5 15.9 18.5 19.2"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </Svg>
);

export const UserOutline = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="3.7"
      stroke={color}
      strokeWidth="1.9"
      fill="none"
    />
    <Path
      d="M5.5 19.2C5.5 15.9 8.1 13.7 12 13.7C15.9 13.7 18.5 15.9 18.5 19.2"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </Svg>
);

export const Gear = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8.9C10.29 8.9 8.9 10.29 8.9 12C8.9 13.71 10.29 15.1 12 15.1C13.71 15.1 15.1 13.71 15.1 12C15.1 10.29 13.71 8.9 12 8.9Z"
      stroke={color}
      strokeWidth="1.9"
      fill={color}
      fillOpacity="0.08"
    />
    <Path
      d="M19.4 13.02V10.98L17.66 10.43C17.5 9.94 17.31 9.49 17.04 9.08L17.89 7.45L16.45 6.01L14.82 6.86C14.41 6.59 13.96 6.4 13.47 6.24L12.92 4.5H10.88L10.33 6.24C9.84 6.4 9.39 6.59 8.98 6.86L7.35 6.01L5.91 7.45L6.76 9.08C6.49 9.49 6.3 9.94 6.14 10.43L4.4 10.98V13.02L6.14 13.57C6.3 14.06 6.49 14.51 6.76 14.92L5.91 16.55L7.35 17.99L8.98 17.14C9.39 17.41 9.84 17.6 10.33 17.76L10.88 19.5H12.92L13.47 17.76C13.96 17.6 14.41 17.41 14.82 17.14L16.45 17.99L17.89 16.55L17.04 14.92C17.31 14.51 17.5 14.06 17.66 13.57L19.4 13.02Z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const GearOutline = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8.9C10.29 8.9 8.9 10.29 8.9 12C8.9 13.71 10.29 15.1 12 15.1C13.71 15.1 15.1 13.71 15.1 12C15.1 10.29 13.71 8.9 12 8.9Z"
      stroke={color}
      strokeWidth="1.9"
      fill="none"
    />
    <Path
      d="M19.4 13.02V10.98L17.66 10.43C17.5 9.94 17.31 9.49 17.04 9.08L17.89 7.45L16.45 6.01L14.82 6.86C14.41 6.59 13.96 6.4 13.47 6.24L12.92 4.5H10.88L10.33 6.24C9.84 6.4 9.39 6.59 8.98 6.86L7.35 6.01L5.91 7.45L6.76 9.08C6.49 9.49 6.3 9.94 6.14 10.43L4.4 10.98V13.02L6.14 13.57C6.3 14.06 6.49 14.51 6.76 14.92L5.91 16.55L7.35 17.99L8.98 17.14C9.39 17.41 9.84 17.6 10.33 17.76L10.88 19.5H12.92L13.47 17.76C13.96 17.6 14.41 17.41 14.82 17.14L16.45 17.99L17.89 16.55L17.04 14.92C17.31 14.51 17.5 14.06 17.66 13.57L19.4 13.02Z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const SearchIcon = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="10.5"
      cy="10.5"
      r="4.5"
      stroke={color}
      strokeWidth="1.9"
      fill={color}
      fillOpacity="0.08"
    />
    <Path
      d="M15.5 15.5L19 19"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </Svg>
);

export const SearchOutline = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="10.5"
      cy="10.5"
      r="4.5"
      stroke={color}
      strokeWidth="1.9"
      fill="none"
    />
    <Path
      d="M15.5 15.5L19 19"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </Svg>
);