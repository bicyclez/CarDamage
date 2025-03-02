import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { Image, View, ScrollView, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import 'react-native-gesture-handler';

const API_URL = "http://10.0.2.2:8000/";

export default function App() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedResults, setUploadedResults] = useState([]);
  const [imageDimensions, setImageDimensions] = useState({});

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
      allowsMultipleSelection: true,
      selectionLimit: 5,
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
        console.log("📩 Response Data:", JSON.stringify(data, null, 2));

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

  const getImageDimensions = (uri) => {
    Image.getSize(uri, (width, height) => {
      setImageDimensions((prev) => ({
        ...prev,
        [uri]: { width, height },
      }));
    });
  };

  useEffect(() => {
    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => {
        getImageDimensions(image.uri);
      });
    }
  }, [selectedImages]);

  const screenWidth = Dimensions.get("window").width;

  const renderBoundingBoxes = (imageUri, boxes, color = "blue") => {
    if (!boxes || boxes.length === 0) return null;
    const { width, height } = imageDimensions[imageUri] || { width: 1, height: 1 };
    const scaleX = screenWidth / width;
    const scaleY = scaleX * (height / width);

    return boxes.map((box, index) => {
      const [x, y, boxWidth, boxHeight] = box;
      return (
        <View
          key={index}
          style={[
            styles.boundingBox,
            {
              left: x * scaleX,
              top: y * scaleY,
              width: boxWidth * scaleX,
              height: boxHeight * scaleY,
              borderColor: color,
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.pickImageButton} onPress={openImagePicker} disabled={uploading}>
        <Text style={styles.pickImageButtonText}>{uploading ? "Uploading..." : "Pick Images"}</Text>
      </TouchableOpacity>

      {selectedImages.length > 0 && (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {selectedImages.map((image, index) => {
            const matchedResults = uploadedResults.filter(
              (result) => result.filename === (image.fileName || image.uri.split('/').pop())
            );

            return (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.image} />

                {/* Render main model bounding boxes */}
                {matchedResults.map((result) =>
                  renderBoundingBoxes(image.uri, result.main_model?.boxes || [], "blue")
                )}

                {/* Render sub-model bounding boxes */}
                {matchedResults.map((result) =>
                  result.sub_model_results?.map((subResult, subIndex) =>
                    renderBoundingBoxes(image.uri, subResult.boxes || [], "red")
                  )
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {uploadedResults.length > 0 && (
        <View style={styles.uploadedContainer}>
          <Text style={styles.uploadedTitle}>Detected Objects</Text>
          {uploadedResults.map((result, index) => {
            const mainCount = result.main_model?.boxes?.length || 0;
            const subCount = result.sub_model_results?.reduce((acc, sub) => acc + (sub.boxes?.length || 0), 0) || 0;
            const totalCount = mainCount + subCount;

            return (
              <Text key={index} style={styles.uploadedUrl}>
                {result.filename}: {totalCount} objects detected
              </Text>
            );
          })}
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
  boundingBox: { position: "absolute", borderWidth: 2, borderRadius: 4 },
  uploadedContainer: { marginTop: 20, alignItems: "center" },
  uploadedTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  uploadedUrl: { fontSize: 14, color: "blue", marginBottom: 5 },
});
