import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Image } from "expo-image";
import { getProfileImage } from "@/services/imageService";
import * as Icons from "phosphor-react-native";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { TransactionType, WalletType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { updateUser } from "@/services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ImageUpload from "@/components/imageUpload";
import { createOrUpdateWallet, deleteWallet } from "@/services/walletService";
import { Dropdown } from "react-native-element-dropdown";
import { expenseCategories, transactionTypes } from "@/constants/data";
import useFetchData from "@/hooks/useFetchData";
import { orderBy, where } from "firebase/firestore";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { createOrUpdateTransaction } from "@/services/transactionService";

const TransactionModal = () => {
    // states for name & image
    const [transaction, setTransaction] = useState<TransactionType>({
        type: "expense",
        amount: 0,
        description: "",
        category: "",
        date: new Date(),
        walletId: "",
        image: null,
    });

    // loading state
    const [loading, setLoading] = useState(false);

    //datepicker state
    const [showDatePicker, setShowDatePicker] = useState(false);

    // prefill then data in the modal based on current data
    const { user } = useAuth();

    const router = useRouter();

    // fetch wallets
    // from db according to the current user
    const {
        data: wallets,
        error: walletError,
        loading: walletLoading,
    } = useFetchData<WalletType>("wallets", [
        where("uid", "==", user?.uid),
        orderBy("created", "desc"),
    ]);

    type paramType = {
        id: string;
        type: string;
        amount: string;
        category?: string;
        date: string;
        description?: string;
        image?: string;
        uid?: string;
        walletId: string;
    };

    // data that we got from the parent component
    const oldTransaction: paramType = useLocalSearchParams();

    useEffect(() => {
        if (oldTransaction?.id) {
            // means we're updating the transaction. Not  creating a new one
            setTransaction({
                type: oldTransaction?.type,
                amount: Number(oldTransaction?.amount),
                description: oldTransaction.description || "",
                category: oldTransaction.category || "",
                date: new Date(oldTransaction.date),
                walletId: oldTransaction.walletId,
                image: oldTransaction?.image,
            });
        }
    }, []);

    const onSubmit = async () => {
        // get these values from the state
        const { type, amount, description, category, date, walletId, image } =
            transaction;
        // check if all the values are filled
        if (!amount || !date || !walletId || (type == "expense" && !category)) {
            Alert.alert("Transaction", "Please fill all the fields");
            return;
        }
        // create a new transaction object. This will contain all the possible values that we gonna store while creating the transaction
        let transactionData: TransactionType = {
            type,
            amount,
            description,
            category,
            date,
            walletId,
            image: image ? image : null,
            uid: user?.uid,
        };

        // console.log("transaction data: ", transactionData);
        // return;

        // for updating transacion
        if (oldTransaction?.id) {
            transactionData.id = oldTransaction?.id;
        }

        setLoading(true);
        const res = await createOrUpdateTransaction(transactionData);
        setLoading(false);
        if (res.success) {
            // go back to the previous screen
            router.back();
        } else {
            Alert.alert("Transaction", res.msg);
        }
    };

    // delete function
    const onDelete = async () => {
        if (!oldTransaction?.id) return;
        setLoading(true);
        const res = await deleteWallet(oldTransaction?.id);
        setLoading(false);
        if (res.success) {
            router.back(); // go back to prev screen
        } else {
            Alert.alert("Wallet", res.msg);
        }
    };

    // delete button alert
    const showDeleteAlert = () => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to do this? \nThis action will remove all the transactions related to this wallet",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel delete"),
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => onDelete(),
                    style: "destructive",
                },
            ]
        );
    };

    const onDateChange = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || transaction.date;
        setTransaction({ ...transaction, date: currentDate });
        setShowDatePicker(Platform.OS == "ios" ? true : false);
    };

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <Header
                    title={
                        oldTransaction?.id
                            ? "Update Transaction"
                            : "New Transaction"
                    }
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                {/* form */}
                <ScrollView
                    contentContainerStyle={styles.form}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Transaction Type */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>
                            Type
                        </Typo>
                        <Dropdown
                            style={styles.dropdownContainer}
                            // placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            iconStyle={styles.dropdownIcon}
                            data={transactionTypes}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            itemTextStyle={styles.dropdownItemText}
                            itemContainerStyle={styles.dropdownItemContainer}
                            containerStyle={styles.dropdownListContainer}
                            activeColor={colors.neutral700}
                            // placeholder={!isFocus ? "Select item" : "..."}
                            value={transaction.type}
                            onChange={(item) => {
                                setTransaction({
                                    ...transaction,
                                    type: item.value,
                                });
                            }}
                        />
                    </View>

                    {/* wallet input */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>
                            Wallet
                        </Typo>
                        <Dropdown
                            style={styles.dropdownContainer}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            iconStyle={styles.dropdownIcon}
                            data={wallets.map((wallet) => ({
                                label: `${wallet?.name} ($${wallet.amount})`,
                                value: wallet?.id,
                            }))}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            itemTextStyle={styles.dropdownItemText}
                            itemContainerStyle={styles.dropdownItemContainer}
                            containerStyle={styles.dropdownListContainer}
                            activeColor={colors.neutral700}
                            placeholder={"Select wallet"}
                            value={transaction.walletId}
                            onChange={(item) => {
                                setTransaction({
                                    ...transaction,
                                    walletId: item.value || "",
                                });
                            }}
                        />
                    </View>

                    {/* Dropdown for all expense categories */}
                    {transaction.type === "expense" && (
                        <View style={styles.inputContainer}>
                            <Typo color={colors.neutral200} size={16}>
                                Expense Category
                            </Typo>
                            <Dropdown
                                style={styles.dropdownContainer}
                                placeholderStyle={styles.dropdownPlaceholder}
                                selectedTextStyle={styles.dropdownSelectedText}
                                iconStyle={styles.dropdownIcon}
                                data={Object.values(expenseCategories)}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                itemTextStyle={styles.dropdownItemText}
                                itemContainerStyle={
                                    styles.dropdownItemContainer
                                }
                                containerStyle={styles.dropdownListContainer}
                                activeColor={colors.neutral700}
                                placeholder={"Select category"}
                                value={transaction.category}
                                onChange={(item) => {
                                    setTransaction({
                                        ...transaction,
                                        category: item.value || "",
                                    });
                                }}
                            />
                        </View>
                    )}

                    {/* date picker */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>
                            Date
                        </Typo>
                        {/* if showDatePicker is false, only then show the current date that is selected */}
                        {!showDatePicker && (
                            <Pressable
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Typo size={14}>
                                    {(
                                        transaction.date as Date
                                    ).toLocaleDateString()}
                                </Typo>
                            </Pressable>
                        )}
                        {showDatePicker && (
                            <View
                                style={
                                    Platform.OS == "ios" && styles.iosDatePicker
                                }
                            >
                                <DateTimePicker
                                    themeVariant="dark"
                                    value={transaction.date as Date}
                                    textColor={colors.white}
                                    mode="date"
                                    display={
                                        Platform.OS == "ios"
                                            ? "spinner"
                                            : "default"
                                    }
                                    onChange={onDateChange}
                                    locale="en-US"
                                />

                                {/* if platform is ios, show the button to close the date picker */}
                                {Platform.OS === "ios" && (
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker(false)}
                                        style={styles.datePickerButton}
                                    >
                                        <Typo size={15} fontWeight={500}>
                                            Okay
                                        </Typo>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    {/* amount of transaction */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>
                            Amount
                        </Typo>
                        <Input
                            // placeholder="Salary"
                            value={transaction.amount.toString()}
                            keyboardType="numeric"
                            onChangeText={(value) => {
                                setTransaction({
                                    ...transaction,
                                    amount: Number(
                                        value.replace(/[^0-9]/g, "")
                                    ),
                                });
                            }}
                        />
                    </View>

                    {/* transaction description */}
                    <View style={styles.inputContainer}>
                        <View style={styles.flexRow}>
                            <Typo color={colors.neutral200} size={16}>
                                Description
                            </Typo>
                            <Typo color={colors.neutral500} size={14}>
                                (optional)
                            </Typo>
                        </View>

                        <Input
                            // placeholder="Salary"
                            value={transaction.description}
                            multiline
                            containerStyle={{
                                flexDirection: "row",
                                height: verticalScale(100),
                                alignItems: "flex-start",
                                paddingVertical: 15,
                            }}
                            // keyboardType="numeric"
                            onChangeText={(value) => {
                                setTransaction({
                                    ...transaction,
                                    description: value,
                                });
                            }}
                        />
                    </View>

                    {/* Transaction Image */}

                    <View style={styles.inputContainer}>
                        <View style={styles.flexRow}>
                            <Typo color={colors.neutral200} size={16}>
                                Receipt
                            </Typo>
                            <Typo color={colors.neutral500} size={14}>
                                (optional)
                            </Typo>
                        </View>
                        <ImageUpload
                            file={transaction.image}
                            onClear={() =>
                                setTransaction({ ...transaction, image: null })
                            }
                            onSelect={(file) =>
                                setTransaction({ ...transaction, image: file })
                            }
                            placeholder="Upload Image"
                        />
                    </View>
                </ScrollView>
            </View>

            {/* footer area */}
            <View style={styles.footer}>
                {/* delete */}
                {oldTransaction?.id && !loading && (
                    <Button
                        onPress={showDeleteAlert}
                        style={{
                            backgroundColor: colors.rose,
                            paddingHorizontal: spacingX._15,
                        }}
                    >
                        <Icons.Trash
                            color={colors.white}
                            size={verticalScale(24)}
                            weight="bold"
                        />
                    </Button>
                )}
                <Button
                    onPress={onSubmit}
                    style={{ flex: 1 }}
                    loading={loading}
                >
                    <Typo color={colors.black} fontWeight={700}>
                        {oldTransaction?.id ? "Update" : "Submit"}
                    </Typo>
                </Button>
            </View>
        </ModalWrapper>
    );
};

export default TransactionModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingY._20,
    },
    form: {
        gap: spacingY._20,
        paddingVertical: spacingY._15,
        paddingBottom: spacingY._40,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._5,
        borderTopWidth: 1,
    },
    inputContainer: {
        gap: spacingY._10,
    },
    iosDropDown: {
        flexDirection: "row",
        height: verticalScale(54),
        alignItems: "center",
        justifyContent: "center",
        fontSize: verticalScale(14),
        borderWidth: 1,
        color: colors.white,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15,
    },
    androidDropDown: {
        height: verticalScale(54),
        borderRadius: radius._17,
        // paddingHorizontal: spacingX._15,
        backgroundColor: colors.neutral300,
        borderWidth: 1,
        borderColor: colors.neutral300,
        alignItems: "center",
        justifyContent: "center",
        fontSize: verticalScale(14),
        color: colors.white,
        borderCurve: "continuous",
    },
    flexRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._5,
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        paddingHorizontal: spacingX._15,
        borderCurve: "continuous",
    },
    iosDatePicker: {
        backgroundColor: "transparent",
    },
    datePickerButton: {
        backgroundColor: colors.neutral700,
        alignSelf: "flex-end",
        padding: spacingY._7,
        marginRight: spacingX._7,
        paddingHorizontal: spacingY._15,
        borderRadius: radius._10,
    },
    dropdownContainer: {
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: colors.neutral300,
        paddingHorizontal: spacingX._15,
        borderRadius: radius._15,
        borderCurve: "continuous",
    },
    dropdownItemText: {
        color: colors.white,
    },
    dropdownSelectedText: {
        color: colors.white,
        fontSize: verticalScale(14),
    },
    dropdownListContainer: {
        backgroundColor: colors.neutral900,
        borderRadius: radius._15,
        borderCurve: "continuous",
        paddingVertical: spacingY._7,
        top: 5,
        borderColor: colors.neutral500,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 5,
    },
    dropdownPlaceholder: {
        color: colors.white,
    },
    dropdownItemContainer: {
        borderRadius: radius._15,
        marginHorizontal: spacingX._7,
    },
    dropdownIcon: {
        height: verticalScale(30),
        tintColor: colors.neutral300,
    },
});
