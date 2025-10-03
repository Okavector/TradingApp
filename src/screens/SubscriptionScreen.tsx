import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const SubscriptionScreen = ({ navigation }: any) => {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);

    Alert.alert(
      'Subscribe to ' + plan.name,
      `You will be charged $${plan.price} for ${plan.duration_days} days of access.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedPlan(null) },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              await subscriptionService.createTransaction(
                plan.id,
                plan.price,
                'credit_card',
                'stripe'
              );

              Alert.alert(
                'Payment Required',
                'To implement payments in your application, you need to integrate Stripe. Please visit https://bolt.new/setup/stripe for setup instructions.',
                [
                  { text: 'OK', onPress: () => setSelectedPlan(null) }
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not process subscription');
              setSelectedPlan(null);
            }
          },
        },
      ]
    );
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return '#2196F3';
      case 'premium':
        return '#FF9800';
      case 'vip':
        return '#9C27B0';
      default:
        return '#4CAF50';
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>Unlock premium crypto trading insights</Text>
        </View>

        {profile?.is_subscribed && (
          <View style={styles.currentPlanBanner}>
            <Text style={styles.currentPlanText}>
              Current Plan: {profile.subscription_tier?.toUpperCase()}
            </Text>
            {profile.subscription_expires_at && (
              <Text style={styles.currentPlanExpiry}>
                Expires: {new Date(profile.subscription_expires_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        <View style={styles.plansList}>
          {plans.map((plan) => {
            const isCurrentPlan = profile?.subscription_tier === plan.tier;
            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  isCurrentPlan && styles.currentPlanCard,
                ]}
              >
                <View
                  style={[
                    styles.planHeader,
                    { backgroundColor: getPlanColor(plan.tier) },
                  ]}
                >
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>${plan.price}</Text>
                    <Text style={styles.planDuration}>/{plan.duration_days} days</Text>
                  </View>
                </View>

                <View style={styles.planContent}>
                  <Text style={styles.planDescription}>{plan.description}</Text>

                  <View style={styles.featuresList}>
                    {(plan.features as string[]).map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureBullet}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {isCurrentPlan ? (
                    <View style={styles.currentButton}>
                      <Text style={styles.currentButtonText}>Current Plan</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.subscribeButton,
                        { backgroundColor: getPlanColor(plan.tier) },
                      ]}
                      onPress={() => handleSubscribe(plan)}
                      disabled={selectedPlan === plan.id}
                    >
                      {selectedPlan === plan.id ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.subscribeButtonText}>
                          {profile?.is_subscribed ? 'Upgrade' : 'Subscribe'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {profile?.is_subscribed && (
          <TouchableOpacity
            style={styles.transactionButton}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <Text style={styles.transactionButtonText}>View Transaction History</Text>
          </TouchableOpacity>
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
  currentPlanBanner: {
    backgroundColor: '#4CAF50',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  currentPlanText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentPlanExpiry: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  plansList: {
    padding: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  currentPlanCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  planDuration: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
  },
  planContent: {
    padding: 20,
  },
  planDescription: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureBullet: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  subscribeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionButton: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  transactionButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
