import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetProduct } from "@workspace/api-client-react";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/contexts/CartContext";
import { TrustBadges } from "@/components/TrustBadges";

const { width: SCREEN_W } = Dimensions.get("window");

const IMAGE_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

function imgUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE}${path}`;
}

const SUIT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const { addItem, itemCount } = useCart();

  const [currentImg, setCurrentImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId },
  });

  const images = ((product?.images ?? []) as string[]).map(imgUrl);
  const isShalwarKameez = product?.category === "shalwar-kameez";
  const isJeans = product?.category === "jeans";
  const needsSize = isShalwarKameez || isJeans;
  const sizes = product?.sizes?.length
    ? product.sizes
    : needsSize
    ? SUIT_SIZES
    : [];

  const originalPrice = product
    ? Math.ceil(product.price / 0.65 / 5) * 5
    : null;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentImg(idx);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: (product.images as string[])?.[0] ?? "",
      size: selectedSize || null,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Product not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back + cart header */}
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 8 },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/cart")}
          style={styles.cartBtn}
        >
          <Feather name="shopping-bag" size={20} color={colors.foreground} />
          {itemCount > 0 && (
            <View
              style={[styles.cartBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 100 }}
      >
        {/* Image carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={images.length > 0 ? images : [""]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item: src }) => (
              <View style={styles.imageWrapper}>
                {src ? (
                  <Image
                    source={{ uri: src }}
                    style={styles.productImage}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.productImage,
                      { backgroundColor: colors.muted },
                    ]}
                  />
                )}
              </View>
            )}
          />
          {/* Dots */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === currentImg
                          ? colors.primary
                          : "rgba(255,255,255,0.4)",
                      width: i === currentImg ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}
          {/* Sale badge */}
          <View style={[styles.saleBadge, { backgroundColor: "#c0392b" }]}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        </View>

        {/* Product info */}
        <View style={styles.infoContainer}>
          {/* Category */}
          <Text
            style={[styles.category, { color: colors.primary }]}
          >
            {product.category.replace(/-/g, " ").toUpperCase()}
          </Text>

          {/* Name */}
          <Text style={[styles.name, { color: colors.foreground }]}>
            {product.name}
          </Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              £{product.price}
            </Text>
            {originalPrice && (
              <Text style={[styles.originalPrice, { color: colors.destructive }]}>
                £{originalPrice}
              </Text>
            )}
            {product.deliveryIncluded && (
              <Text
                style={[styles.delivery, { color: colors.mutedForeground }]}
              >
                · delivery included
              </Text>
            )}
          </View>

          {/* Size selector */}
          {sizes.length > 0 && (
            <View style={styles.sizesSection}>
              <Text
                style={[styles.sizeLabel, { color: colors.mutedForeground }]}
              >
                SIZE
                {selectedSize ? (
                  <Text style={{ color: colors.foreground }}>
                    {" "}
                    — {selectedSize}
                  </Text>
                ) : (
                  <Text style={{ color: colors.destructive }}> *required</Text>
                )}
              </Text>
              <View style={styles.sizesRow}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => {
                      setSelectedSize(size === selectedSize ? "" : size);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.sizeChip,
                      {
                        borderColor:
                          selectedSize === size
                            ? colors.primary
                            : colors.border,
                        backgroundColor:
                          selectedSize === size
                            ? colors.primary
                            : "transparent",
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.sizeChipText,
                        {
                          color:
                            selectedSize === size
                              ? "#fff"
                              : colors.foreground,
                        },
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={[styles.sizeLabel, { color: colors.mutedForeground }]}>
              QUANTITY
            </Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, { borderColor: colors.border }]}
                onPress={() => {
                  if (quantity > 1) {
                    setQuantity((q) => q - 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="minus" size={14} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.qtyCount, { color: colors.foreground }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setQuantity((q) => q + 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="plus" size={14} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View
              style={[
                styles.descriptionSection,
                { borderTopColor: colors.border },
              ]}
            >
              <Text
                style={[styles.descTitle, { color: colors.mutedForeground }]}
              >
                DESCRIPTION
              </Text>
              <Text style={[styles.descText, { color: colors.foreground }]}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Trust badges */}
          <TrustBadges />
        </View>
      </ScrollView>

      {/* Add to cart button */}
      <View
        style={[
          styles.addToCartBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomInset + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: added ? colors.accent : colors.primary,
            },
          ]}
          onPress={handleAddToCart}
          disabled={added || (needsSize && !selectedSize)}
          activeOpacity={0.85}
        >
          <Feather
            name={added ? "check" : "shopping-bag"}
            size={16}
            color="#fff"
          />
          <Text style={styles.addBtnText}>
            {added ? "ADDED TO BAG" : needsSize && !selectedSize ? "SELECT A SIZE" : "ADD TO BAG"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: { fontSize: 16, fontFamily: "Montserrat_400Regular" },
  backLink: { fontSize: 14, fontFamily: "Montserrat_500Medium" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Montserrat_600SemiBold",
  },
  carouselContainer: {
    position: "relative",
    width: SCREEN_W,
    aspectRatio: 3 / 4,
  },
  imageWrapper: {
    width: SCREEN_W,
    aspectRatio: 3 / 4,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  dotsRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  saleBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saleBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Montserrat_700Bold",
    letterSpacing: 1,
  },
  infoContainer: {
    padding: 20,
  },
  category: {
    fontSize: 9,
    fontFamily: "Montserrat_400Regular",
    letterSpacing: 4,
    marginBottom: 6,
  },
  name: {
    fontSize: 28,
    fontFamily: "CormorantGaramond_700Bold",
    lineHeight: 33,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 20,
  },
  price: {
    fontSize: 26,
    fontFamily: "Montserrat_600SemiBold",
  },
  originalPrice: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    textDecorationLine: "line-through",
  },
  delivery: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
  },
  sizesSection: {
    marginBottom: 20,
    gap: 10,
  },
  sizeLabel: {
    fontSize: 9,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
  sizesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeChip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 2,
  },
  sizeChipText: {
    fontSize: 11,
    fontFamily: "Montserrat_500Medium",
    letterSpacing: 1,
  },
  quantitySection: {
    marginBottom: 20,
    gap: 10,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyCount: {
    fontSize: 18,
    fontFamily: "CormorantGaramond_600SemiBold",
    minWidth: 28,
    textAlign: "center",
  },
  descriptionSection: {
    borderTopWidth: 1,
    paddingTop: 20,
    marginTop: 4,
    gap: 8,
  },
  descTitle: {
    fontSize: 9,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
  descText: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    lineHeight: 22,
  },
  addToCartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
    borderRadius: 2,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
});
