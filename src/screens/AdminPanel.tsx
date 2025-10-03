import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signalsService } from '../services/signalsService';
import { analysisService } from '../services/analysisService';
import { messagesService } from '../services/messagesService';
import { useAuth } from '../contexts/AuthContext';

export const AdminPanel = ({ navigation }: any) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'signals' | 'analysis' | 'messages'>('signals');

  if (profile?.role !== 'admin') {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>You don't have admin privileges</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signals' && styles.activeTab]}
            onPress={() => setActiveTab('signals')}
          >
            <Text style={[styles.tabText, activeTab === 'signals' && styles.activeTabText]}>
              Signals
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
            onPress={() => setActiveTab('analysis')}
          >
            <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>
              Analysis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
            onPress={() => setActiveTab('messages')}
          >
            <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
              Messages
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'signals' && <CreateSignalForm />}
        {activeTab === 'analysis' && <CreateAnalysisForm />}
        {activeTab === 'messages' && <SendMessageForm />}
      </ScrollView>
    </LinearGradient>
  );
};

const CreateSignalForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    crypto_symbol: '',
    signal_type: 'buy',
    entry_price: '',
    target_price: '',
    stop_loss: '',
    leverage: '',
    confidence_level: 'medium',
    description: '',
    tier_access: ['basic', 'premium', 'vip'],
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.crypto_symbol || !formData.entry_price || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await signalsService.createSignal({
        ...formData,
        entry_price: parseFloat(formData.entry_price),
        target_price: formData.target_price ? parseFloat(formData.target_price) : null,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
        status: 'active',
        result: null,
        profit_percentage: null,
        expires_at: null,
        closed_at: null,
      } as any);

      Alert.alert('Success', 'Signal created successfully');
      setFormData({
        title: '',
        crypto_symbol: '',
        signal_type: 'buy',
        entry_price: '',
        target_price: '',
        stop_loss: '',
        leverage: '',
        confidence_level: 'medium',
        description: '',
        tier_access: ['basic', 'premium', 'vip'],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create signal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Create New Signal</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor="#999"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Crypto Symbol (e.g., BTC, ETH)"
        placeholderTextColor="#999"
        value={formData.crypto_symbol}
        onChangeText={(text) => setFormData({ ...formData, crypto_symbol: text.toUpperCase() })}
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.signal_type === 'buy' && styles.buyButton,
          ]}
          onPress={() => setFormData({ ...formData, signal_type: 'buy' })}
        >
          <Text style={styles.typeButtonText}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.signal_type === 'sell' && styles.sellButton,
          ]}
          onPress={() => setFormData({ ...formData, signal_type: 'sell' })}
        >
          <Text style={styles.typeButtonText}>SELL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.signal_type === 'hold' && styles.holdButton,
          ]}
          onPress={() => setFormData({ ...formData, signal_type: 'hold' })}
        >
          <Text style={styles.typeButtonText}>HOLD</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Entry Price"
        placeholderTextColor="#999"
        value={formData.entry_price}
        onChangeText={(text) => setFormData({ ...formData, entry_price: text })}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Target Price (optional)"
        placeholderTextColor="#999"
        value={formData.target_price}
        onChangeText={(text) => setFormData({ ...formData, target_price: text })}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Stop Loss (optional)"
        placeholderTextColor="#999"
        value={formData.stop_loss}
        onChangeText={(text) => setFormData({ ...formData, stop_loss: text })}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Leverage (e.g., 5x, 10x)"
        placeholderTextColor="#999"
        value={formData.leverage}
        onChangeText={(text) => setFormData({ ...formData, leverage: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor="#999"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Signal</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const CreateAnalysisForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    market_sentiment: 'neutral',
    tier_access: ['basic', 'premium', 'vip'],
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    setLoading(true);
    try {
      const analysis = await analysisService.createAnalysis({
        ...formData,
        featured_cryptos: [],
        image_url: null,
        published: false,
        market_sentiment: formData.market_sentiment as any,
      });

      await analysisService.publishAnalysis(analysis.id);

      Alert.alert('Success', 'Analysis published successfully');
      setFormData({
        title: '',
        content: '',
        summary: '',
        market_sentiment: 'neutral',
        tier_access: ['basic', 'premium', 'vip'],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Create Daily Analysis</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor="#999"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Summary (optional)"
        placeholderTextColor="#999"
        value={formData.summary}
        onChangeText={(text) => setFormData({ ...formData, summary: text })}
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.sentimentButton,
            formData.market_sentiment === 'bullish' && styles.bullishButton,
          ]}
          onPress={() => setFormData({ ...formData, market_sentiment: 'bullish' })}
        >
          <Text style={styles.typeButtonText}>BULLISH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sentimentButton,
            formData.market_sentiment === 'neutral' && styles.neutralButton,
          ]}
          onPress={() => setFormData({ ...formData, market_sentiment: 'neutral' })}
        >
          <Text style={styles.typeButtonText}>NEUTRAL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sentimentButton,
            formData.market_sentiment === 'bearish' && styles.bearishButton,
          ]}
          onPress={() => setFormData({ ...formData, market_sentiment: 'bearish' })}
        >
          <Text style={styles.typeButtonText}>BEARISH</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Content"
        placeholderTextColor="#999"
        value={formData.content}
        onChangeText={(text) => setFormData({ ...formData, content: text })}
        multiline
        numberOfLines={8}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Publish Analysis</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const SendMessageForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    tier_access: ['basic', 'premium', 'vip'],
  });

  const handleSubmit = async () => {
    if (!formData.subject || !formData.content) {
      Alert.alert('Error', 'Please fill in subject and content');
      return;
    }

    setLoading(true);
    try {
      await messagesService.sendBroadcastMessage(
        formData.subject,
        formData.content,
        formData.tier_access
      );

      Alert.alert('Success', 'Message sent to all subscribers');
      setFormData({
        subject: '',
        content: '',
        tier_access: ['basic', 'premium', 'vip'],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Send Broadcast Message</Text>

      <TextInput
        style={styles.input}
        placeholder="Subject"
        placeholderTextColor="#999"
        value={formData.subject}
        onChangeText={(text) => setFormData({ ...formData, subject: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Message Content"
        placeholderTextColor="#999"
        value={formData.content}
        onChangeText={(text) => setFormData({ ...formData, content: text })}
        multiline
        numberOfLines={6}
      />

      <Text style={styles.tierLabel}>Send to:</Text>
      <View style={styles.tierButtons}>
        {['basic', 'premium', 'vip'].map((tier) => (
          <TouchableOpacity
            key={tier}
            style={[
              styles.tierButton,
              formData.tier_access.includes(tier) && styles.tierButtonActive,
            ]}
            onPress={() => {
              const newTiers = formData.tier_access.includes(tier)
                ? formData.tier_access.filter((t) => t !== tier)
                : [...formData.tier_access, tier];
              setFormData({ ...formData, tier_access: newTiers });
            }}
          >
            <Text
              style={[
                styles.tierButtonText,
                formData.tier_access.includes(tier) && styles.tierButtonTextActive,
              ]}
            >
              {tier.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading || formData.tier_access.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Send Message</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#999',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  sellButton: {
    backgroundColor: '#f44336',
  },
  holdButton: {
    backgroundColor: '#FF9800',
  },
  sentimentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bullishButton: {
    backgroundColor: '#4CAF50',
  },
  neutralButton: {
    backgroundColor: '#999',
  },
  bearishButton: {
    backgroundColor: '#f44336',
  },
  typeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tierLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  tierButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tierButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tierButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tierButtonText: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tierButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#999',
  },
});
