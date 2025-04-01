import {
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React from "react";
import { ScreenWrapperProps } from "@/types";
import { colors } from "@/constants/theme";

// will get us the height of the specific device the screen is currently running on
const { height } = Dimensions.get("window");

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
    // padding top - dynamically created
    let paddingTop = Platform.OS == "ios" ? height * 0.06 : 50;
    return (
        <View
            style={[
                {
                    paddingTop,
                    flex: 1,
                    backgroundColor: colors.neutral900,
                },
                style,
            ]}
        >
            {/* since we are in dark theme */}
            <StatusBar barStyle="light-content" />
            {children}
        </View>
    );
};

export default ScreenWrapper;

const styles = StyleSheet.create({});
