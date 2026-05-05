import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, Sparkles, Users, CircleUserRound } from 'lucide-react-native';

const GOLD = '#D2994A';
const INACTIVE = '#7a6a5a';

type IconProps = { focused: boolean; size?: number };

function TabIcon({ focused, Icon }: IconProps & { Icon: any }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 28,
      }}
    >
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            width: 24,
            height: 3,
            borderRadius: 2,
            backgroundColor: GOLD,
          }}
        />
      )}
      <Icon
        size={22}
        color={focused ? GOLD : INACTIVE}
        strokeWidth={focused ? 2.2 : 1.8}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#2a1f1a',
          borderTopColor: '#3F2D25',
          borderTopWidth: 1,
          height: 65 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Home} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Compass} />,
        }}
      />
      <Tabs.Screen
        name="advisor"
        options={{
          title: 'Henzo AI',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Sparkles} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Users} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={CircleUserRound} />,
        }}
      />
    </Tabs>
  );
}
