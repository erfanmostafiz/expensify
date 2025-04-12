import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { uplaodFileToCloudinary } from "./imageService";

export const updateUser = async (
    uid: string,
    updatedData: UserDataType
): Promise<ResponseType> => {
    try {
        // image update
        if (updatedData.image && updatedData?.image?.uri) {
            // uplaodFileToCloudinary(fileName, folderName)
            const imageUploadRes = await uplaodFileToCloudinary(
                updatedData.image,
                "users"
            );

            // if fails to upload
            if (!imageUploadRes.success) {
                return {
                    success: false,
                    msg: imageUploadRes.msg || "Failed to upload image",
                };
            }

            // if image is uploaded
            updatedData.image = imageUploadRes.data; // will be the url of the image just uploaded
        }

        // Name update:
        const userRef = doc(firestore, "users", uid);
        await updateDoc(userRef, updatedData); // update the user data into the firebase

        // after updating to firebase, fetch the user data, and update the user satte in the auth context

        // return message
        return { success: true, msg: "updated successfully" };
    } catch (error: any) {
        console.log("error updating user: ", error);
        return { success: false, msg: error?.message };
    }
};
