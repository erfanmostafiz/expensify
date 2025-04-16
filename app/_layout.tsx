import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/authContext";
import { StatusBar } from "expo-status-bar";

const StackLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Specify the modals */}
            <Stack.Screen
                name="(modals)/profileModal"
                options={{ presentation: "modal" }}
            />
            <Stack.Screen
                name="(modals)/walletModal"
                options={{ presentation: "modal" }}
            />
            <Stack.Screen
                name="(modals)/transactionModal"
                options={{ presentation: "modal" }}
            />
        </Stack>
    );
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar
                style="light"
                backgroundColor="#000000"
                translucent={false}
            />
            <StackLayout />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({});
