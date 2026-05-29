import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const BADGES = [
  { icon: "lock" as const, label: "Secure Checkout" },
  { icon: "truck" as const, label: "Free UK Delivery" },
  { icon: "refresh-cw" as const, label: "Easy Returns" },
  { icon: "message-circle" as const, label: "WhatsApp Support" },
];

export function TrustBadges() {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      {BADGES.map(({ icon, label }) => (
        <View key={label} style={styles.badge}>
          <Feather name={icon} size={14} color={colors.mutedForeground} />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 14,
    marginVertical: 16,
    gap: 8,
  },
  badge: {
    alignItems: "center",
    gap: 4,
    minWidth: 72,
  },
  label: {
    fontSize: 9,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
