import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCreateOrder } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/contexts/CartContext";
import { TrustBadges } from "@/components/TrustBadges";

interface FormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  addressLine2: string;
  city: string;
  postCode: string;
  paymentMethod: "bank-transfer" | "cash-on-delivery";
  notes: string;
}

const INITIAL: FormState = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  address: "",
  addressLine2: "",
  city: "",
  postCode: "",
  paymentMethod: "bank-transfer",
  notes: "",
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "words",
  required = true,
  error,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "words" | "sentences";
  required?: boolean;
  error?: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: colors.mutedForeground }]}>
        {label}
        {required && (
          <Text style={{ color: colors.primary }}> *</Text>
        )}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          fieldStyles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
          },
        ]}
      />
      {error ? (
        <Text style={[fieldStyles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: 9,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
  },
  error: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
  },
});

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const set = (key: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.customerName.trim()) e.customerName = "Required";
    if (!form.customerEmail.trim() || !form.customerEmail.includes("@"))
      e.customerEmail = "Valid email required";
    if (!form.customerPhone.trim()) e.customerPhone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.postCode.trim()) e.postCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate()) return;
    if (!items.length) return;

    createOrder.mutate(
      {
        data: {
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          address: form.address,
          addressLine2: form.addressLine2 || null,
          city: form.city,
          postCode: form.postCode,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            size: i.size ?? null,
          })),
          total,
          paymentMethod: form.paymentMethod,
          notes: form.notes || null,
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace(`/order-success?orderId=${order.id}`);
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 8,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Checkout
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Order summary */}
        <View
          style={[
            styles.orderSummary,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            ORDER SUMMARY
          </Text>
          {items.map((item) => (
            <View key={`${item.productId}-${item.size}`} style={styles.summaryItem}>
              <Text
                style={[styles.summaryName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {item.name}
                {item.size ? ` · ${item.size}` : ""} ×{item.quantity}
              </Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>
                £{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={[styles.totalLine, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>
              Total (incl. free delivery)
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              £{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Contact info */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
            Contact Details
          </Text>
          <Field
            label="Full Name"
            value={form.customerName}
            onChangeText={set("customerName")}
            placeholder="Your full name"
            error={errors.customerName}
            colors={colors}
          />
          <Field
            label="Email Address"
            value={form.customerEmail}
            onChangeText={set("customerEmail")}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.customerEmail}
            colors={colors}
          />
          <Field
            label="Phone Number"
            value={form.customerPhone}
            onChangeText={set("customerPhone")}
            placeholder="+44 7000 000000"
            keyboardType="phone-pad"
            autoCapitalize="none"
            error={errors.customerPhone}
            colors={colors}
          />
        </View>

        {/* Delivery address */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
            Delivery Address
          </Text>
          <Field
            label="Address Line 1"
            value={form.address}
            onChangeText={set("address")}
            placeholder="House number and street"
            error={errors.address}
            colors={colors}
          />
          <Field
            label="Address Line 2"
            value={form.addressLine2}
            onChangeText={set("addressLine2")}
            placeholder="Flat, suite, etc. (optional)"
            required={false}
            colors={colors}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field
                label="City"
                value={form.city}
                onChangeText={set("city")}
                placeholder="City"
                error={errors.city}
                colors={colors}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Postcode"
                value={form.postCode}
                onChangeText={set("postCode")}
                placeholder="Postcode"
                autoCapitalize="none"
                error={errors.postCode}
                colors={colors}
              />
            </View>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
            Payment Method
          </Text>
          {[
            {
              value: "bank-transfer" as const,
              label: "Bank Transfer",
              sub: "We'll email you bank details within 1 hour",
            },
            {
              value: "cash-on-delivery" as const,
              label: "Cash on Delivery",
              sub: "Pay when your order arrives",
            },
          ].map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.paymentOption,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    form.paymentMethod === method.value
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => {
                set("paymentMethod")(method.value);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor:
                      form.paymentMethod === method.value
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                {form.paymentMethod === method.value && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.paymentLabel, { color: colors.foreground }]}
                >
                  {method.label}
                </Text>
                <Text
                  style={[styles.paymentSub, { color: colors.mutedForeground }]}
                >
                  {method.sub}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={fieldStyles.container}>
            <Text style={[fieldStyles.label, { color: colors.mutedForeground }]}>
              ORDER NOTES (OPTIONAL)
            </Text>
            <TextInput
              value={form.notes}
              onChangeText={set("notes")}
              placeholder="Any special instructions..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[
                fieldStyles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  height: 80,
                  textAlignVertical: "top",
                  paddingTop: 12,
                },
              ]}
            />
          </View>
        </View>

        {/* Trust badges */}
        <TrustBadges />

        {/* Error display */}
        {createOrder.isError && (
          <Text
            style={[styles.submitError, { color: colors.destructive }]}
          >
            Failed to place order. Please try again.
          </Text>
        )}
      </ScrollView>

      {/* Place order button */}
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
        <TouchableOpacity
          style={[
            styles.placeOrderBtn,
            { backgroundColor: colors.primary },
            createOrder.isPending && { opacity: 0.7 },
          ]}
          onPress={handlePlaceOrder}
          disabled={createOrder.isPending}
          activeOpacity={0.85}
        >
          {createOrder.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>PLACE ORDER</Text>
              <Text style={[styles.placeOrderAmt, { color: "rgba(255,255,255,0.8)" }]}>
                · £{total.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "CormorantGaramond_600SemiBold",
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  orderSummary: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryName: {
    fontSize: 13,
    fontFamily: "Montserrat_400Regular",
    flex: 1,
  },
  summaryPrice: {
    fontSize: 13,
    fontFamily: "Montserrat_500Medium",
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Montserrat_500Medium",
  },
  totalAmount: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "CormorantGaramond_600SemiBold",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
    marginBottom: 2,
  },
  paymentSub: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
  },
  submitError: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Montserrat_400Regular",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 2,
    gap: 6,
    minHeight: 52,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
  placeOrderAmt: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
  },
});
