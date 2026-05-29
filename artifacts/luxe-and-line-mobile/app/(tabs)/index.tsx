import { useRouter } from "expo-router";
import { useListProducts } from "@workspace/api-client-react";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";

const CATEGORIES = [
  { value: "shalwar-kameez", label: "Stitched Suits", emoji: "👗" },
  { value: "jeans", label: "Premium Jeans", emoji: "👖" },
  { value: "wallets", label: "Leather Wallets", emoji: "👜" },
  { value: "food", label: "Kunafa & Gourmet", emoji: "🍫" },
];

const IMAGE_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const HERO_IMAGE = require("@/assets/images/hero-banner.png");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: featured, isLoading } = useListProducts({ featured: true });

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 12, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.brandSmall, { color: colors.primary }]}>
          EST. LIVERPOOL · UK
        </Text>
        <Text style={[styles.brandName, { color: colors.foreground }]}>
          LUXE & LINE
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.primary }]} />
      </View>

      {/* Hero Banner */}
      <View style={styles.heroContainer}>
        <Image
          source={HERO_IMAGE}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <Text style={[styles.heroEyebrow, { color: colors.primary }]}>
            SUMMER 2026
          </Text>
          <Text style={styles.heroTitle}>
            New{"\n"}
            <Text style={{ fontStyle: "italic", color: colors.primary }}>
              Collection
            </Text>
          </Text>
          <TouchableOpacity
            style={[styles.heroBtn, { borderColor: "rgba(255,255,255,0.6)" }]}
            onPress={() => router.push("/(tabs)/shop")}
            activeOpacity={0.8}
          >
            <Text style={styles.heroBtnText}>EXPLORE NOW</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
          SHOP BY CATEGORY
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/shop",
                  params: { category: cat.value },
                })
              }
              activeOpacity={0.82}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[styles.categoryLabel, { color: colors.foreground }]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
          FEATURED
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          New{" "}
          <Text style={{ fontStyle: "italic", color: colors.primary }}>
            Arrivals
          </Text>
        </Text>

        {isLoading && (
          <View style={styles.skeletonGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.skeleton, { backgroundColor: colors.card }]}
              />
            ))}
          </View>
        )}

        {!isLoading && featured && featured.length > 0 && (
          <FlatList
            data={featured.slice(0, 6)}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price}
                images={(item.images as string[]) ?? []}
                category={item.category}
                deliveryIncluded={item.deliveryIncluded}
                inStock={item.inStock}
              />
            )}
            columnWrapperStyle={styles.row}
          />
        )}

        <TouchableOpacity
          style={[styles.viewAllBtn, { borderColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/shop")}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            VIEW ALL PRODUCTS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trust strip */}
      <View
        style={[
          styles.trustStrip,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {[
          { label: "Free UK Delivery", sub: "On every order" },
          { label: "4–5 Day Dispatch", sub: "After confirmation" },
          { label: "WhatsApp Support", sub: "+44 7449 507661" },
        ].map(({ label, sub }) => (
          <View key={label} style={styles.trustItem}>
            <Text style={[styles.trustLabel, { color: colors.foreground }]}>
              {label}
            </Text>
            <Text style={[styles.trustSub, { color: colors.mutedForeground }]}>
              {sub}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  brandSmall: {
    fontSize: 9,
    fontFamily: "Montserrat_400Regular",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  brandName: {
    fontSize: 28,
    fontFamily: "CormorantGaramond_700Bold",
    letterSpacing: 8,
    textTransform: "uppercase",
  },
  divider: {
    width: 60,
    height: 1,
    marginTop: 10,
    opacity: 0.6,
  },
  heroContainer: {
    height: 420,
    position: "relative",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
  },
  heroEyebrow: {
    fontSize: 10,
    fontFamily: "Montserrat_400Regular",
    letterSpacing: 4,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 52,
    fontFamily: "CormorantGaramond_700Bold",
    color: "#fff",
    lineHeight: 56,
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 20,
  },
  heroBtn: {
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  heroBtnText: {
    fontSize: 10,
    fontFamily: "Montserrat_600SemiBold",
    color: "#fff",
    letterSpacing: 3,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionEyebrow: {
    fontSize: 9,
    fontFamily: "Montserrat_400Regular",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 32,
    fontFamily: "CormorantGaramond_700Bold",
    marginBottom: 16,
    lineHeight: 36,
  },
  categoryRow: {
    paddingRight: 16,
    gap: 10,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 110,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skeleton: {
    width: "48%",
    aspectRatio: 3 / 4,
    borderRadius: 4,
  },
  row: {
    marginBottom: 4,
  },
  viewAllBtn: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  viewAllText: {
    fontSize: 10,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  trustStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  trustItem: {
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  trustLabel: {
    fontSize: 9,
    fontFamily: "Montserrat_600SemiBold",
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  trustSub: {
    fontSize: 9,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
  },
});
