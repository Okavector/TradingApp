import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { signalsService } from '../services/signalsService';
import { analysisService } from '../services/analysisService';
import { messagesService } from '../services/messagesService';
import { Signal, DailyAnalysis } from '../types';
import { format } from 'date-fns';

export const DashboardScreen = ({ navigation }: any) => {
  const { profile } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<DailyAnalysis | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (profile?.is_subscribed) {
        const [signalsData, analysisData, unreadCount] = await Promise.all([
          signalsService.getActiveSignals(),
          analysisService.getPublishedAnalysis(),
          messagesService.getUnreadCount(),
        ]);

        setSignals(signalsData.slice(0, 3));
        setLatestAnalysis(analysisData[0] || null);
        setUnreadMessages(unreadCount);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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

  if (!profile?.is_subscribed) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.subscribeContainer}>
          <Text style={styles.subscribeTitle}>Unlock Premium Features</Text>
          <Text style={styles.subscribeText}>
            Subscribe to access trading signals, daily analysis, and exclusive insights.
          </Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.subscribeButtonText}>View Plans</Text>
          </TouchableOpacity>
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
          <Text style={styles.greeting}>
            Welcome back, {profile?.full_name || 'Trader'}!
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{profile?.subscription_tier?.toUpperCase()}</Text>
          </View>
        </View>

        {unreadMessages > 0 && (
          <TouchableOpacity
            style={styles.notificationBanner}
            onPress={() => navigation.navigate('Messages')}
          >
            <Text style={styles.notificationText}>
              You have {unreadMessages} unread message{unreadMessages > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Signals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signals')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {signals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active signals at the moment</Text>
            </View>
          ) : (
            signals.map((signal) => (
              <TouchableOpacity
                key={signal.id}
                style={styles.signalCard}
                onPress={() => navigation.navigate('SignalDetail', { signalId: signal.id })}
              >
                <View style={styles.signalHeader}>
                  <Text style={styles.signalSymbol}>{signal.crypto_symbol}</Text>
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
                <Text style={styles.signalPrice}>Entry: ${signal.entry_price}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {latestAnalysis && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Analysis</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Analysis')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.analysisCard}
              onPress={() =>
                navigation.navigate('AnalysisDetail', { analysisId: latestAnalysis.id })
              }
            >
              <Text style={styles.analysisTitle}>{latestAnalysis.title}</Text>
              <Text style={styles.analysisSummary} numberOfLines={3}>
                {latestAnalysis.summary || latestAnalysis.content.substring(0, 150) + '...'}
              </Text>
              <Text style={styles.analysisDate}>
                {format(new Date(latestAnalysis.published_at || latestAnalysis.created_at), 'MMM dd, yyyy')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  notificationBanner: {
    backgroundColor: '#4CAF50',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  notificationText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewAll: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  signalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  signalTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  signalTypeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  signalTitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  signalPrice: {
    fontSize: 14,
    color: '#aaa',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  analysisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  analysisSummary: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 8,
  },
  analysisDate: {
    fontSize: 12,
    color: '#999',
  },
  subscribeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  subscribeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subscribeText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  subscribeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
