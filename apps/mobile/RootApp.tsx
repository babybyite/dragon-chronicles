import React, { useState } from "react";
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import GameApp from "./App";
import PortraitCreatorScreen from "./src/portrait/PortraitCreatorScreen";

type Mode = "launcher" | "game" | "portrait";

export default function RootApp() {
  const [mode, setMode] = useState<Mode>("launcher");

  if (mode === "game") return <GameApp />;
  if (mode === "portrait") {
    return (
      <SafeAreaView style={styles.labShell}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.labTopBar}>
          <Pressable onPress={() => setMode("launcher")} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.labTitle}>Portrait Lab</Text>
          <View style={styles.backSpacer} />
        </View>
        <PortraitCreatorScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.launcher}>
      <StatusBar barStyle="light-content" />
      <View style={styles.launcherInner}>
        <Text style={styles.kicker}>DRAGON CHRONICLES</Text>
        <Text style={styles.title}>Developer launcher</Text>
        <Text style={styles.copy}>
          Open the current game normally, or test the locked 5:7 layered portrait system before final watercolor assets are added.
        </Text>
        <Pressable onPress={() => setMode("game")} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Open Game</Text>
        </Pressable>
        <Pressable onPress={() => setMode("portrait")} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Open Portrait Lab</Text>
        </Pressable>
        <Text style={styles.note}>Temporary developer launcher. It can be removed when the portrait creator is integrated directly into Character Builder.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  launcher: { flex: 1, backgroundColor: "#0b0a0d" },
  launcherInner: { flex: 1, justifyContent: "center", padding: 28 },
  kicker: { color: "#d1a85b", letterSpacing: 2.4, fontWeight: "700", fontSize: 12 },
  title: { marginTop: 10, color: "#fff8ef", fontSize: 34, fontWeight: "600" },
  copy: { marginTop: 14, marginBottom: 28, color: "#c7bec5", fontSize: 16, lineHeight: 24 },
  primaryButton: { backgroundColor: "#9d1830", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  primaryText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondaryButton: { marginTop: 12, borderColor: "#a99069", borderWidth: 1, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  secondaryText: { color: "#f4dfbc", fontSize: 17, fontWeight: "700" },
  note: { marginTop: 20, color: "#80777e", fontSize: 12, lineHeight: 18 },
  labShell: { flex: 1, backgroundColor: "#f7f0e5" },
  labTopBar: { height: 48, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#d5c7b5", backgroundColor: "#fffaf2" },
  backButton: { width: 70, paddingVertical: 8 },
  backText: { color: "#594b40", fontSize: 16, fontWeight: "600" },
  labTitle: { flex: 1, textAlign: "center", color: "#3a3029", fontSize: 16, fontWeight: "700" },
  backSpacer: { width: 70 }
});
