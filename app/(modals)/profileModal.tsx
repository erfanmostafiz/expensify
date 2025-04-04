import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Image } from "expo-image";
import { getProfileImage } from "@/services/imageService";
import * as Iccons from "phosphor-react-native";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { UserDataType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";

const ProfileModal = () => {
    // states for name & image
    const [userData, setUserData] = useState<UserDataType>({
        name: "",
        image: null,
    });

    // prefill then data in the modal based on current data
    const { user } = useAuth();
    useEffect(() => {
        setUserData({
            name: user?.name || "",
            image: user?.image || null,
        });
    }, [user]);

    const onSubmit = async () => {
        let { name, image } = userData;
        if (!name.trim()) {
            Alert.alert("User", "Please fill all the fields");
            return;
        }
        console.log("good to go");
    };

    // loading state
    const [loading, setLoading] = useState(false);

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <Header
                    title="Update Profile"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                {/* form */}
                <ScrollView contentContainerStyle={styles.form}>
                    <View style={styles.avatarContainer}>
                        <Image
                            style={styles.avatar}
                            source={getProfileImage(userData.image)}
                            contentFit="cover"
                            transition={100}
                        />

                        <TouchableOpacity style={styles.editIcon}>
                            <Iccons.Pencil
                                size={verticalScale(20)}
                                color={colors.neutral800}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* name input */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Name</Typo>
                        <Input
                            placeholder="Name"
                            value={userData.name}
                            onChangeText={(value) => {
                                setUserData({ ...userData, name: value });
                            }}
                        />
                    </View>
                </ScrollView>
            </View>

            <View style={styles.footer}>
                <Button
                    onPress={onSubmit}
                    style={{ flex: 1 }}
                    loading={loading}
                >
                    <Typo color={colors.black} fontWeight={700}>
                        Update
                    </Typo>
                </Button>
            </View>
        </ModalWrapper>
    );
};

export default ProfileModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._20,
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
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15,
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center",
    },
    avatar: {
        alignSelf: "center",
        backgroundColor: colors.neutral300,
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200,
        borderWidth: 1,
        borderColor: colors.neutral500,
    },
    editIcon: {
        position: "absolute",
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 100,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._7,
    },
    inputContainer: {
        gap: spacingY._10,
    },
});
