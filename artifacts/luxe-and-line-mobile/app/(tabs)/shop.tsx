import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useListProducts } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  { value: "", label: "All" },
  { value: "shalwar-kameez", label: "Suits" },
  { value: "jeans", label: "Jeans" },
  { value: "wallets", label: "Wallets" },
  { value: "food", label: "Gourmet" },
];

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const [activeCategory, setActiveCategory] = useState(
    params.category ?? ""
  );

  const { data: products, isLoading } = useListProducts(
    activeCategory ? { category: activeCategory } : {}
  );

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          The{" "}
          <Text style={{ fontStyle: "italic", color: colors.primary }}>
            Edit
          </Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {isLoading
            ? "Loading…"
            : `${products?.length ?? 0} items`}
        </Text>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setActiveCategory(cat.value)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    activeCategory === cat.value
                      ? colors.primary
                      : colors.card,
                  borderColor:
                    activeCategory === cat.value
                      ? colors.primary
                      : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      activeCategory === cat.value
                        ? "#fff"
                        : colors.mutedForeground,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={products ?? []}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom:
                insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80,
            },
          ]}
          columnWrapperStyle={styles.row}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="shopping-bag"
                size={40}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.emptyTitle, { color: colors.mutedForeground }]}
              >
                Nothing here yet
              </Text>
              <Text
                style={[styles.emptySub, { color: colors.mutedForeground }]}
              >
                Try a different filter
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    marginBottom: 12,
  },
  filterRow: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    fontFamily: "Montserrat_500Medium",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  row: {
    gap: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  emptySub: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
  },
});
