import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Linking from "expo-linking";
import AllProcessing from "./screens/AllProcessing";
import PickProcessing from "./screens/PickProcessing";
import Navbar from "./components/Navbar";

const Stack = createStackNavigator();

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      AllProcessing: "/",
      PickProcessing: "/pick-processing",
    },
  },
};

function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="AllProcessing">
        {/* Navbar จะแสดงทุกหน้าเพราะใช้ใน options */}
        <Stack.Screen 
          name="AllProcessing" 
          component={AllProcessing} 
          options={{ header: () => <Navbar title="Beta Version" /> }} 
        />
        {/* <Stack.Screen 
          name="PickProcessing" 
          component={PickProcessing} 
          options={{ header: () => <Navbar title="Pick Processing" /> }} 
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
