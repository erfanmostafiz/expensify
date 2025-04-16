import { ImageBackground, StyleSheet, Text, View } from "react-native";
import React from "react";
import Typo from "./Typo";
import { scale, verticalScale } from "@/utils/styling";
import { colors, spacingX, spacingY } from "@/constants/theme";
import * as Icons from "phosphor-react-native";

const HomeCard = () => {
    return (
        <ImageBackground
            source={require("../assets/images/card.png")}
            resizeMode="stretch"
            style={styles.bgImage}
        >
            <View style={styles.container}>
                {/* card view */}
                <View>
                    {/* total balance */}
                    <View style={styles.totalBalanceRow}>
                        <Typo
                            color={colors.neutral800}
                            size={17}
                            fontWeight={"500"}
                        >
                            Total Balance
                        </Typo>
                        <Icons.DotsThreeOutline
                            size={verticalScale(23)}
                            color={colors.black}
                            weight="fill"
                        />
                    </View>
                    {/* balance */}
                    <Typo color={colors.black} size={38} fontWeight={"bold"}>
                        $23,214.45
                    </Typo>
                </View>

                {/* total expenses and income */}
                <View style={styles.stats}>
                    {/* income */}
                    <View style={{ gap: verticalScale(5) }}>
                        {/* icon */}
                        <View style={styles.incomeExpense}>
                            <View style={styles.statsIcon}>
                                <Icons.ArrowDown
                                    size={verticalScale(15)}
                                    color={colors.black}
                                    weight="bold"
                                />
                            </View>
                            <Typo
                                size={16}
                                color={colors.neutral700}
                                fontWeight={500}
                            >
                                Income
                            </Typo>
                        </View>

                        {/* total income view */}
                        <View style={{ alignSelf: "center" }}>
                            <Typo
                                size={17}
                                color={colors.green}
                                fontWeight={600}
                            >
                                $ 4534
                            </Typo>
                        </View>
                    </View>

                    {/* expense*/}
                    <View style={{ gap: verticalScale(5) }}>
                        {/* icon */}
                        <View style={styles.incomeExpense}>
                            <View style={styles.statsIcon}>
                                <Icons.ArrowUp
                                    size={verticalScale(15)}
                                    color={colors.black}
                                    weight="bold"
                                />
                            </View>
                            <Typo
                                size={16}
                                color={colors.neutral700}
                                fontWeight={500}
                            >
                                Expense
                            </Typo>
                        </View>

                        {/* total income view */}
                        <View style={{ alignSelf: "center" }}>
                            <Typo
                                size={17}
                                color={colors.rose}
                                fontWeight={600}
                            >
                                $ 3343
                            </Typo>
                        </View>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};

export default HomeCard;

const styles = StyleSheet.create({
    bgImage: {
        height: scale(210),
        width: "100%",
    },
    container: {
        padding: spacingX._20,
        paddingHorizontal: scale(23),
        height: "87%",
        width: "100%",
        justifyContent: "space-between",
    },
    totalBalanceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._5,
    },
    stats: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statsIcon: {
        backgroundColor: colors.neutral350,
        padding: spacingY._5,
        borderRadius: 50,
    },
    incomeExpense: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingY._7,
    },
});
