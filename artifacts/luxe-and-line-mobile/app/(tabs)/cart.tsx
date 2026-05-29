import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/contexts/CartContext";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Your{" "}
          <Text style={{ fontStyle: "italic", color: colors.primary }}>
            Bag
          </Text>
        </Text>
        {itemCount > 0 && (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Your bag is empty
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Discover our curated luxury collection
          </Text>
          <TouchableOpacity
            style={[styles.shopBtn, { borderColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/shop")}
            activeOpacity={0.8}
          >
            <Text style={[styles.shopBtnText, { color: colors.primary }]}>
              SHOP NOW
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.productId}-${item.size ?? "none"}`}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: bottomInset + 140 },
            ]}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.cartItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, { color: colors.foreground }]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  {item.size && (
                    <Text
                      style={[styles.itemSize, { color: colors.mutedForeground }]}
                    >
                      Size: {item.size}
                    </Text>
                  )}
                  <Text
                    style={[styles.itemPrice, { color: colors.primary }]}
                  >
                    £{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.itemActions}>
                  {/* Quantity stepper */}
                  <View
                    style={[
                      styles.stepper,
                      { borderColor: colors.border },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.productId, item.size, item.quantity - 1);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather
                        name="minus"
                        size={12}
                        color={colors.foreground}
                      />
                    </TouchableOpacity>
                    <Text
                      style={[styles.stepperCount, { color: colors.foreground }]}
                    >
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.productId, item.size, item.quantity + 1);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather
                        name="plus"
                        size={12}
                        color={colors.foreground}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Remove */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      removeItem(item.productId, item.size);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Bottom: total + checkout */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: bottomInset + 8,
              },
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                SUBTOTAL
              </Text>
              <Text style={[styles.totalAmount, { color: colors.foreground }]}>
                £{total.toFixed(2)}
              </Text>
            </View>
            <Text style={[styles.deliveryNote, { color: colors.mutedForeground }]}>
              Free UK delivery included
            </Text>
            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/checkout");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 34,
    fontFamily: "CormorantGaramond_700Bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Montserrat_400Regular",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_600SemiBold",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
  },
  shopBtn: {
    marginTop: 12,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  shopBtnText: {
    fontSize: 10,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 3,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  cartItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "CormorantGaramond_600SemiBold",
    lineHeight: 18,
  },
  itemSize: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: "Montserrat_600SemiBold",
    marginTop: 4,
  },
  itemActions: {
    alignItems: "center",
    gap: 14,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 2,
    overflow: "hidden",
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperCount: {
    width: 28,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Montserrat_500Medium",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: "Montserrat_400Regular",
    letterSpacing: 2,
  },
  totalAmount: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_700Bold",
  },
  deliveryNote: {
    fontSize: 10,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 4,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    borderRadius: 2,
    marginTop: 4,
  },
  checkoutBtnText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
});
