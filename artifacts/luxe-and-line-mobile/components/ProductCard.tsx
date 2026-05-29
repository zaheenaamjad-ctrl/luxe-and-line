import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const IMAGE_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

function imgUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE}${path}`;
}

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  deliveryIncluded?: boolean | null;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  images,
  category,
  deliveryIncluded,
  inStock = true,
}: ProductCardProps) {
  const colors = useColors();
  const router = useRouter();
  const img = imgUrl(images?.[0] ?? "");

  const categoryLabel = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${id}`)}
      activeOpacity={0.88}
    >
      <View style={styles.imageContainer}>
        {img ? (
          <Image
            source={{ uri: img }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]} />
        )}
        {!inStock && (
          <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.75)" }]}>
            <Text style={[styles.badgeText, { color: "#fff" }]}>SOLD OUT</Text>
          </View>
        )}
        <View style={[styles.saleBadge, { backgroundColor: "#c0392b" }]}>
          <Text style={styles.badgeText}>SALE</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.category, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {categoryLabel}
        </Text>
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            £{price}
          </Text>
          {deliveryIncluded && (
            <Text style={[styles.delivery, { color: colors.mutedForeground }]}>
              incl. delivery
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    borderRadius: 4,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  saleBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 1,
    color: "#fff",
    textTransform: "uppercase",
  },
  info: {
    padding: 8,
    gap: 2,
  },
  category: {
    fontSize: 9,
    fontFamily: "Montserrat_400Regular",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  name: {
    fontSize: Platform.OS === "web" ? 13 : 12,
    fontFamily: "CormorantGaramond_600SemiBold",
    lineHeight: Platform.OS === "web" ? 17 : 16,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
  },
  delivery: {
    fontSize: 9,
    fontFamily: "Montserrat_400Regular",
  },
});
