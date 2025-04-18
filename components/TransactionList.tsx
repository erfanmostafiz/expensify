import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
    TransactionItemProps,
    TransactionListType,
    TransactionType,
} from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import { FlashList } from "@shopify/flash-list";
import Loading from "./Loading";
import { expenseCategories, incomeCategory } from "@/constants/data";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "expo-router";

const TransactionList = ({
    data,
    title,
    loading,
    emptyListMessage,
}: TransactionListType) => {
    const router = useRouter();
    const handleClick = (item: TransactionType) => {
        router.push({
            pathname: "/(modals)/transactionModal",
            params: {
                id: item?.id,
                type: item?.type,
                amount: item?.amount?.toString(),
                category: item?.category,
                date: (item.date as Timestamp)?.toDate().toISOString(),
                description: item?.description,
                image: item?.image,
                uid: item?.uid,
                walletId: item?.walletId,
            },
        });
    };

    return (
        <View style={styles.container}>
            {/* only show title if there is a title */}
            {title && (
                <Typo size={20} fontWeight={500}>
                    {title}
                </Typo>
            )}

            {/* list of all transactions    */}
            <View style={styles.list}>
                <FlashList
                    data={data}
                    renderItem={({ item, index }) => (
                        <TransactionItem
                            item={item}
                            index={index}
                            handleClick={handleClick}
                        />
                    )}
                    estimatedItemSize={60}
                />
            </View>

            {!loading && data.length == 0 && (
                <Typo
                    size={15}
                    color={colors.neutral400}
                    style={{ textAlign: "center", marginTop: spacingY._15 }}
                >
                    {emptyListMessage}
                </Typo>
            )}

            {loading && (
                <View style={{ top: verticalScale(100) }}>
                    <Loading />
                </View>
            )}
        </View>
    );
};

const TransactionItem = ({
    item,
    index,
    handleClick,
}: TransactionItemProps) => {
    // get the category from the item
    let category =
        item?.type == "income"
            ? incomeCategory
            : expenseCategories[item.category!];
    const IconComponent = category.icon;
    // transaction date
    const date = (item?.date as Timestamp)
        ?.toDate()
        ?.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
        });

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 70)
                .springify()
                .damping(14)}
        >
            <TouchableOpacity
                style={styles.row}
                onPress={() => handleClick(item)}
            >
                {/* category icon */}
                <View
                    style={[styles.icon, { backgroundColor: category.bgColor }]}
                >
                    {IconComponent && (
                        <IconComponent
                            size={verticalScale(25)}
                            weight="fill"
                            color={colors.white}
                        />
                    )}
                </View>

                {/* category name and description */}
                <View style={styles.categoryDes}>
                    <Typo size={17}>{category.label}</Typo>
                    <Typo
                        size={12}
                        color={colors.neutral400}
                        textProps={{ numberOfLines: 1 }}
                    >
                        {item.description}
                    </Typo>
                </View>

                {/* amount and date */}
                <View style={styles.amountDate}>
                    <Typo
                        fontWeight={500}
                        color={
                            item?.type == "income"
                                ? colors.primary
                                : colors.rose
                        }
                    >
                        {/* append + if income, - if expense */}
                        {`${item?.type == "income" ? "+ $" : "- $"}${
                            item.amount
                        }`}
                    </Typo>
                    <Typo size={13} color={colors.neutral400}>
                        {date}
                    </Typo>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default TransactionList;

const styles = StyleSheet.create({
    container: {
        gap: spacingY._17,
    },
    list: {
        minHeight: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacingX._12,
        marginBottom: spacingY._12,
        backgroundColor: colors.neutral800,
        padding: spacingY._10,
        paddingHorizontal: spacingY._10,
        borderRadius: radius._17,
    },
    icon: {
        height: verticalScale(44),
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: radius._12,
        borderCurve: "continuous",
    },
    categoryDes: {
        flex: 1,
        gap: 2.5,
    },
    amountDate: {
        alignItems: "flex-end",
        gap: 3,
    },
});
