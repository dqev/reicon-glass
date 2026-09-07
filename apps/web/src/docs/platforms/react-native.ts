import type { PlatformDoc } from "./types";

export const reactNativeDoc: PlatformDoc = {
  id: "react-native",
  name: "React Native",
  badge: "React Native",
  tagline: "Native vector icons for iOS, Android, and Expo built on react-native-svg.",
  pkg: "reicon-react-native",
  install: "npm install reicon-react-native react-native-svg",
  basicUsage: `import { View } from 'react-native';
import { Home, ShieldCheck, User } from 'reicon-react-native';

export default function App() {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Home size={24} color="#000000" />
      <ShieldCheck size={28} color="#9B8AFB" weight="Filled" />
      <User size={24} color="#6366F1" />
    </View>
  );
}`,
  customization: `// Touch Handlers & Styling
import { Pressable } from 'react-native';
import { Heart } from 'reicon-react-native';

<Pressable onPress={() => console.log('Liked')}>
  <Heart size={28} color="#ef4444" weight="Filled" />
</Pressable>`,
  directImport: `// Direct tree-shakeable path import
import Home from 'reicon-react-native/icons/Home';`,
  extraTitle: "React Navigation Tab Bar Usage",
  extraCode: `import { Home, Search, User } from 'reicon-react-native';

<Tab.Screen 
  name="Home" 
  component={HomeScreen} 
  options={{
    tabBarIcon: ({ focused, color, size }) => (
      <Home size={size} color={color} weight={focused ? 'Filled' : 'Outline'} />
    )
  }}
/>`,
  notes: [
    "Requires `react-native-svg` package.",
    "Full iOS (`pod install`), Android, and Expo support."
  ]
};
