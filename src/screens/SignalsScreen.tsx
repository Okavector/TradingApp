import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signalsService } from '../services/signalsService';
import { Signal } from '../types';
import { format } from 'date-fns';

export const SignalsScreen = ({ navigation }: any) => {
  const [activeSignals, setActiveSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    try {
      const data = await signalsService.getActiveSignals();
      setActiveSignals(data);
    } catch (error) {
      console.error('Error loading signals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSignals();
  };

  const getSignalTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return '#4CAF50';
      case 'sell':
        return '#f44336';
      default:
        return '#FF9800';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      default:
        return '#999';
    }
  };

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
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Trading Signals</Text>
          <Text style={styles.subtitle}>Real-time crypto trading opportunities</Text>
        </View>

        {activeSignals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active signals at the moment</Text>
            <Text style={styles.emptySubtext}>Check back soon for new opportunities</Text>
          </View>
        ) : (
          <View style={styles.signalsList}>
            {activeSignals.map((signal) => (
              <TouchableOpacity
                key={signal.id}
                style={styles.signalCard}
                onPress={() => navigation.navigate('SignalDetail', { signalId: signal.id })}
              >
                <View style={styles.signalHeader}>
                  <View>
                    <Text style={styles.signalSymbol}>{signal.crypto_symbol}</Text>
                    <Text style={styles.signalDate}>
                      {format(new Date(signal.created_at), 'MMM dd, HH:mm')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.signalTypeBadge,
                      { backgroundColor: getSignalTypeColor(signal.signal_type) },
                    ]}
                  >
                    <Text style={styles.signalTypeText}>
                      {signal.signal_type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.signalTitle}>{signal.title}</Text>

                <View style={styles.signalDetails}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Entry:</Text>
                    <Text style={styles.priceValue}>${signal.entry_price}</Text>
                  </View>

                  {signal.target_price && (
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Target:</Text>
                      <Text style={[styles.priceValue, { color: '#4CAF50' }]}>
                        ${signal.target_price}
                      </Text>
                    </View>
                  )}

                  {signal.stop_loss && (
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Stop Loss:</Text>
                      <Text style={[styles.priceValue, { color: '#f44336' }]}>
                        ${signal.stop_loss}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.signalFooter}>
                  {signal.leverage && (
                    <View style={styles.leverageBadge}>
                      <Text style={styles.leverageText}>{signal.leverage}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: getConfidenceColor(signal.confidence_level) },
                    ]}
                  >
                    <Text style={styles.confidenceText}>
                      {signal.confidence_level.toUpperCase()} CONFIDENCE
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('SignalHistory')}
        >
          <Text style={styles.historyButtonText}>View Signal History</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
  },
  signalsList: {
    padding: 20,
  },
  signalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  signalSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  signalDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  signalTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  signalTypeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  signalTitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 16,
    lineHeight: 22,
  },
  signalDetails: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#999',
  },
  priceValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  signalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  leverageBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  leverageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
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
  },
  historyButton: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
