import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import { useAuth } from "@/contexts/AuthContext";

type Mode = "login" | "register";

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isLoading, login, register, logout } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: topInset + 12,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>
            My{" "}
            <Text style={{ fontStyle: "italic", color: colors.primary }}>
              Account
            </Text>
          </Text>
        </View>

        <View style={styles.profileContainer}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.avatarLetter, { color: colors.primary }]}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.profileName, { color: colors.foreground }]}>
            {user.name}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
            {user.email}
          </Text>

          <View
            style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {[
              { icon: "truck" as const, label: "Free UK Delivery on every order" },
              { icon: "clock" as const, label: "4–5 day dispatch after confirmation" },
              { icon: "message-circle" as const, label: "WhatsApp: +44 7449 507661" },
            ].map(({ icon, label }) => (
              <View key={label} style={styles.infoRow}>
                <Feather name={icon} size={14} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.foreground }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.logoutBtn,
              { borderColor: colors.destructive },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              logout();
            }}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={14} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>
              SIGN OUT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.authContent,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.authHeader}>
          <Text style={[styles.authTitle, { color: colors.foreground }]}>
            {mode === "login" ? "Welcome" : "Create"}
            {"\n"}
            <Text style={{ fontStyle: "italic", color: colors.primary }}>
              {mode === "login" ? "Back" : "Account"}
            </Text>
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.primary }]} />
          <Text style={[styles.authSub, { color: colors.mutedForeground }]}>
            {mode === "login"
              ? "Sign in to your Luxe & Line account"
              : "Join Luxe & Line for exclusive access"}
          </Text>
        </View>

        {/* Toggle */}
        <View
          style={[
            styles.modeToggle,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {(["login", "register"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeTab,
                mode === m && { backgroundColor: colors.primary },
              ]}
              onPress={() => { setMode(m); setError(""); }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: mode === m ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {m === "login" ? "SIGN IN" : "REGISTER"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === "register" && (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                FULL NAME
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              EMAIL ADDRESS
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              PASSWORD
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary },
              submitting && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 34,
    fontFamily: "CormorantGaramond_700Bold",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 36,
    paddingHorizontal: 24,
    gap: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarLetter: {
    fontSize: 28,
    fontFamily: "CormorantGaramond_700Bold",
  },
  profileName: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 8,
  },
  infoCard: {
    width: "100%",
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    flex: 1,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 10,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
  authContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  authHeader: {
    marginBottom: 28,
    gap: 10,
  },
  authTitle: {
    fontSize: 44,
    fontFamily: "CormorantGaramond_700Bold",
    lineHeight: 48,
  },
  divider: {
    width: 40,
    height: 1,
    opacity: 0.6,
  },
  authSub: {
    fontSize: 13,
    fontFamily: "Montserrat_400Regular",
  },
  modeToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  modeTabText: {
    fontSize: 10,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 9,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
  },
  submitBtn: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    marginTop: 4,
    minHeight: 52,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 2,
  },
});
