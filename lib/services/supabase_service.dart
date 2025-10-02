import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/crypto_model.dart';

class SupabaseService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> getFavorites() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return [];

    try {
      final response = await _client
          .from('favorites')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      return [];
    }
  }

  Future<bool> addFavorite(Crypto crypto) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return false;

    try {
      await _client.from('favorites').insert({
        'user_id': userId,
        'crypto_id': crypto.id,
        'symbol': crypto.symbol,
        'name': crypto.name,
        'image': crypto.image,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> removeFavorite(String cryptoId) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return false;

    try {
      await _client
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('crypto_id', cryptoId);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> isFavorite(String cryptoId) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return false;

    try {
      final response = await _client
          .from('favorites')
          .select()
          .eq('user_id', userId)
          .eq('crypto_id', cryptoId)
          .maybeSingle();

      return response != null;
    } catch (e) {
      return false;
    }
  }

  Future<void> addPriceAlert({
    required String cryptoId,
    required String cryptoName,
    required double targetPrice,
    required bool isAbove,
  }) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return;

    await _client.from('price_alerts').insert({
      'user_id': userId,
      'crypto_id': cryptoId,
      'crypto_name': cryptoName,
      'target_price': targetPrice,
      'is_above': isAbove,
      'is_active': true,
    });
  }

  Future<List<Map<String, dynamic>>> getPriceAlerts() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return [];

    try {
      final response = await _client
          .from('price_alerts')
          .select()
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      return [];
    }
  }

  Future<void> deletePriceAlert(int alertId) async {
    await _client.from('price_alerts').delete().eq('id', alertId);
  }
}
