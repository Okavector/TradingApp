import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { messagesService } from '../services/messagesService';
import { Message } from '../types';
import { format } from 'date-fns';

export const MessagesScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await messagesService.getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const handleMarkAsRead = async (message: Message) => {
    if (!message.is_read) {
      try {
        await messagesService.markAsRead(message.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
        );
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[styles.messageCard, !item.is_read && styles.unreadMessage]}
      onPress={() => {
        handleMarkAsRead(item);
        navigation.navigate('MessageDetail', { message: item });
      }}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.messageSubject} numberOfLines={1}>
          {item.subject}
        </Text>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.messagePreview} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.messageDate}>
        {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
      </Text>
      {item.is_broadcast && (
        <View style={styles.broadcastBadge}>
          <Text style={styles.broadcastText}>BROADCAST</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Messages from admins will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  unreadMessage: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  messagePreview: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 8,
  },
  messageDate: {
    fontSize: 12,
    color: '#999',
  },
  broadcastBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  broadcastText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});
