import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const Navbar = ({ title }) => {
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH * 0.6)).current; // ใช้ useRef

  const toggleMenu = () => {
    Animated.timing(translateX, {
      toValue: menuOpen ? -SCREEN_WIDTH * 0.6 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuOpen(!menuOpen)); // อัปเดต state หลัง animation จบ
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate("AllProcessing");
          }}
        >
          <Text style={styles.menuText}>Car Detection</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate("PickProcessing");
          }}
        >
          <Text style={styles.menuText}>Not avalible</Text>
        </TouchableOpacity> */}
      </Animated.View>

      {/* Overlay ปิด Sidebar */}
      {menuOpen && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 100, // ให้ Navbar อยู่ด้านบนสุด
    marginTop: StatusBar.currentHeight || 0, // เพิ่ม margin ตาม StatusBar ของ Android
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#333",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 0,
    zIndex: 103, // Navbar ต้องอยู่สูงกว่า sidebar
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  sidebar: {
    position: "absolute",
    top: 58,
    left: 0,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 1,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderColor: "#ddd",
    zIndex: 102, // Sidebar ต้องสูงกว่า Navbar
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    left: 0,
    width: "100%",
    height: SCREEN_HEIGHT * 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100, // Overlay ต้องสูงกว่า Sidebar เพื่อปิด
  },
});

export default Navbar;
