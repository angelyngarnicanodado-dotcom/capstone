import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function _Layout() {
  return (
    <Tabs 
        screenOptions={{
            tabBarShowLabel: false,
            tabBarItemStyle: { 
                width: '100%', 
                height: '100%', 
                justifyContent: 'center', 
                alignItems: 'center'},
            tabBarStyle: {
                backgroundColor: '#fbbf24',
                paddingHorizontal: 20,
                paddingBottom: 50,
                paddingTop: 5,
                height: 80,
                position: "absolute",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: '#0d2314ff'
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600'
            },
            tabBarActiveTintColor: '#22c55e',
            tabBarInactiveTintColor: '#9ca3af',
        }}
        
    >
        <Tabs.Screen 
            name="Home"
            options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({focused})=>(
                    <MaterialIcons name={"home"} size={30} color={focused ? ("green"): ("gray")} />
                )
            }}
        />
        <Tabs.Screen 
            name="Devices"
            options={{
                title: 'Devices',
                headerShown: false,
                tabBarIcon: ({focused})=>(
                    <MaterialIcons name={"device-hub"} size={30} color={focused ? ("green"): ("gray")} />
                )
            }}
        />
        <Tabs.Screen 
            name="Log"
            options={{
                title: 'Log',
                headerShown: false,
                tabBarIcon: ({focused})=>(
                    <MaterialIcons name={"edit-document"} size={30} color={focused ? ("green"): ("gray")} />
                )
            }}
        />
        <Tabs.Screen 
            name="Profile"
            options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({focused})=>(
                    <MaterialIcons name={"manage-accounts"} size={30} color={focused ? ("green"): ("gray")} />
                )
            }}
        />
        
    </Tabs>
  );
}
