import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../configs/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import MyStyles from "../../styles/MyStyles";

const ChatScreen = ({ route }) => {
  const { jobId, candidateId, employerId, currentUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const flatListRef = useRef();
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (!candidateId || !currentUserId) {
      alert("Không xác định được người dùng để chat.");
      return;
    }
    const generatedRoomId = `${jobId}_${[candidateId, employerId].sort().join("_")}`;
    setRoomId(generatedRoomId);

    const roomRef = doc(db, "chatRooms", generatedRoomId);

    const createRoomIfNotExists = async () => {
      try {
        const snap = await getDoc(roomRef);
        if (!snap.exists()) {
          await setDoc(roomRef, {
            jobId,
            users: [candidateId, employerId],
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Lỗi tạo phòng chat:", error);
      }
    };

    const listenToMessages = () => {
      const messagesRef = collection(db, "chatRooms", generatedRoomId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      return onSnapshot(
        q,
        (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(newMessages);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        (error) => {
          console.error("❗ Firestore listener error:", error);
        }
      );
    };

    createRoomIfNotExists();
    const unsubscribe = listenToMessages();

    return () => unsubscribe();
  }, [jobId, candidateId, currentUserId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!roomId) return;

    try {
      const messageRef = collection(db, "chatRooms", roomId, "messages");
      await addDoc(messageRef, {
        senderId: currentUserId,
        content: text.trim(),
        timestamp: serverTimestamp(),
      });
      setText("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      alert("Gửi tin nhắn thất bại");
    }
  };

  const renderTimestamp = (timestamp) => {
    try {
      if (!timestamp) return "";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (!candidateId || !currentUserId) {
    return (
      <View style={MyStyles.authWrapper}>
        <Text style={MyStyles.errorText}>Không thể xác định người dùng để chat</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={MyStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        contentContainerStyle={{ padding: 16 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              MyStyles.listItemShadow,
              MyStyles.listItem,
              {
                alignSelf: item.senderId === currentUserId ? "flex-end" : "flex-start",
                backgroundColor: item.senderId === currentUserId ? "#81ecec" : "#dfe6e9",
                maxWidth: "75%",
              },
            ]}
          >
            <Text style={MyStyles.titleText}>{item.content}</Text>
            <Text style={MyStyles.listDescription}>
              {renderTimestamp(item.timestamp)}
            </Text>
          </View>
        )}
      />
      <View style={[MyStyles.row, { alignItems: "center", padding: 10 }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Nhắn tin..."
          style={[
            MyStyles.formInput,
            {
              flex: 1,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 24,
              paddingHorizontal: 16,
              height: 40,
              backgroundColor: "#fff",
            },
          ]}
        />
        <TouchableOpacity onPress={sendMessage} style={MyStyles.btnmsg}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
