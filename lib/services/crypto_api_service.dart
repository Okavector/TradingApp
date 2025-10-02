import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/crypto_model.dart';

class CryptoApiService {
  static const String _baseUrl = 'https://api.coingecko.com/api/v3';

  Future<List<Crypto>> fetchTopCryptos({int limit = 50}) async {
    try {
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=$limit&page=1&sparkline=false',
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Crypto.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load cryptocurrencies');
      }
    } catch (e) {
      throw Exception('Error fetching data: $e');
    }
  }

  Future<Crypto> fetchCryptoById(String id) async {
    try {
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/coins/markets?vs_currency=usd&ids=$id',
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (data.isNotEmpty) {
          return Crypto.fromJson(data[0]);
        } else {
          throw Exception('Crypto not found');
        }
      } else {
        throw Exception('Failed to load cryptocurrency');
      }
    } catch (e) {
      throw Exception('Error fetching data: $e');
    }
  }

  Future<List<Crypto>> searchCryptos(String query) async {
    try {
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final allCryptos = data.map((json) => Crypto.fromJson(json)).toList();

        return allCryptos.where((crypto) {
          return crypto.name.toLowerCase().contains(query.toLowerCase()) ||
                 crypto.symbol.toLowerCase().contains(query.toLowerCase());
        }).toList();
      } else {
        throw Exception('Failed to search cryptocurrencies');
      }
    } catch (e) {
      throw Exception('Error searching data: $e');
    }
  }
}
