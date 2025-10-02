import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import '../services/crypto_api_service.dart';
import '../models/crypto_model.dart';
import '../widgets/crypto_card.dart';
import 'crypto_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final SupabaseService _supabaseService = SupabaseService();
  final CryptoApiService _apiService = CryptoApiService();
  List<Crypto> _favorites = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    setState(() => _isLoading = true);

    try {
      final favoritesData = await _supabaseService.getFavorites();
      final List<Crypto> cryptos = [];

      for (var fav in favoritesData) {
        try {
          final crypto = await _apiService.fetchCryptoById(fav['crypto_id']);
          cryptos.add(crypto);
        } catch (e) {
          continue;
        }
      }

      setState(() {
        _favorites = cryptos;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Favorites'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _favorites.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.favorite_border, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        'No favorites yet',
                        style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Add cryptocurrencies to your favorites\nto see them here',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadFavorites,
                  child: ListView.builder(
                    itemCount: _favorites.length,
                    itemBuilder: (context, index) {
                      final crypto = _favorites[index];
                      return CryptoCard(
                        crypto: crypto,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CryptoDetailScreen(crypto: crypto),
                            ),
                          ).then((_) => _loadFavorites());
                        },
                      );
                    },
                  ),
                ),
    );
  }
}
