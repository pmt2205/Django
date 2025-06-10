import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../configs/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../../configs/MyContexts";

const MessagesList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = useContext(MyUserContext);
  const currentUserId = String(user?.id);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "chatRooms"),
      where("users", "array-contains", Number(currentUserId))
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setLoading(true);

      const rooms = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const roomData = docSnap.data();
          const roomId = docSnap.id;

          const messagesQuery = query(
            collection(db, "chatRooms", roomId, "messages"),
            orderBy("timestamp", "desc"),
            limit(1)
          );

          const lastMessageSnap = await getDocs(messagesQuery);
          const lastMessage = lastMessageSnap.docs[0]?.data();

          const otherUserId = roomData.users.find(
            (u) => String(u) !== currentUserId
          );

          let otherUserData = null;
          try {
            const userDoc = await getDoc(doc(db, "users", String(otherUserId)));
            if (userDoc.exists()) {
              otherUserData = userDoc.data();
            }
          } catch (e) {
            console.warn("Lỗi lấy user info:", e);
          }

          return {
            id: roomId,
            jobId: roomData.jobId,
            otherUserId,
            otherUser: otherUserData,
            lastMessage: lastMessage?.content || "",
            timestamp: lastMessage?.timestamp?.toDate() || null,
          };
        })
      );

      // ✅ Sắp xếp theo timestamp mới nhất
      const sortedRooms = rooms
        .filter((r) => r.timestamp) // Chỉ lấy những phòng có tin nhắn
        .sort((a, b) => b.timestamp - a.timestamp); // Mới nhất trước

      setChatRooms(sortedRooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ChatScreen", {
          jobId: item.jobId,
          candidateId: item.otherUserId,
          employerId: currentUserId,
          currentUserId: currentUserId,
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
      }}
    >
      <Image
        source={{
          uri:
            item.otherUser?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          marginRight: 12,
          backgroundColor: "#ccc",
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {item.otherUser?.username || `Ứng viên`}
        </Text>
        <Text
          style={{ color: "#555", marginTop: 4 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage}
        </Text>
        {item.timestamp && (
          <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            {item.timestamp.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!currentUserId || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fa6666" />
      </View>
    );
  }

  return (
    <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={() => (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#666" }}>
            Không có cuộc trò chuyện nào.
          </Text>
        </View>
      )}
    />
  );
};

export default MessagesList;
