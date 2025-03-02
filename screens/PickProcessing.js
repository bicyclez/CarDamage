import { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://localhost:8000/";

export default function App() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedResults, setUploadedResults] = useState([]);

  const openImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: Platform.OS !== "web", // Web ไม่รองรับหลายไฟล์
    });

    if (!result.canceled) {
      setSelectedImages(result.assets || [result]);
      uploadImages(result.assets || [result]);
    }
  };

  const uploadImages = async (images) => {
    setUploading(true);
    let results = [];

    for (const image of images) {
      let formData = new FormData();
      formData.append("files", {
        uri: image.uri,
        name: image.fileName || image.uri.split('/').pop(),
        type: image.mimeType || "image/jpeg",
      });

      try {
        let response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        let data = await response.json();
        console.log("📩 Response Data:", data);

        if (data.results) {
          results = [...results, ...data.results];
        }
      } catch (error) {
        console.error("Upload Failed:", error);
      }
    }

    setUploadedResults(results || []);
    setUploading(false);
    alert("Upload Complete!");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.pickImageButton} onPress={openImagePicker} disabled={uploading}>
        <Text style={styles.pickImageButtonText}>{uploading ? "Uploading..." : "Pick Images"}</Text>
      </TouchableOpacity>

      {selectedImages.length > 0 && (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
            </View>
          ))}
        </ScrollView>
      )}

      {uploadedResults.length > 0 && (
        <View style={styles.uploadedContainer}>
          <Text style={styles.uploadedTitle}>Detected Objects</Text>
          {uploadedResults.map((result, index) => (
            <Text key={index} style={styles.uploadedUrl}>
              {result.filename}: {result.main_model?.boxes?.length || 0} objects detected
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 20 },
  pickImageButton: { backgroundColor: "lightblue", padding: 10, borderRadius: 8, marginBottom: 20 },
  pickImageButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  scrollViewContent: { alignItems: "center", paddingBottom: 20 },
  imageContainer: { position: "relative", width: 300, height: 300, marginBottom: 20 },
  image: { width: 300, height: 300, borderRadius: 8 },
  uploadedContainer: { marginTop: 20, alignItems: "center" },
  uploadedTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  uploadedUrl: { fontSize: 14, color: "blue", marginBottom: 5 },
});
