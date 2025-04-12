import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";
import { Alert } from "react-native";
import axios from "axios";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// function that will handle upload file to cloudinary
export const uplaodFileToCloudinary = async (
    file: { uri?: string } | string,
    folderName: string
): Promise<ResponseType> => {
    try {
        if (!file) return { success: true, data: null };

        // typeof file == 'string' means the file is already uploaded, and its a remote url
        if (typeof file == "string") {
            return { success: true, data: file };
        }

        // if we have a file and file contains uri propert, that means its an object, and we need to upload this file
        if (file && file.uri) {
            const formData = new FormData();
            formData.append("file", {
                uri: file.uri,
                type: "image/jpeg",
                name: file.uri?.split("/").pop() || "file.jpg",
            } as any);

            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", folderName);

            // api request to upload the file
            const response = await axios.post(CLOUDINARY_API_URL, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return { success: true, data: response?.data?.secure_url };
        }
        return { success: true };
    } catch (error: any) {
        console.log("got error uploading the file: ", error);
        return {
            success: false,
            msg: error.message || "Could not upload file",
        };
    }
};

export const getProfileImage = (file: any) => {
    if (file && typeof file == "string") return file;
    if (file && typeof file == "object") return file.uri; // uri includes the location of the file

    return require("../assets/images/defaultAvatar.png"); // default avatar if none of above are trues
};

export const getFilePath = (file: any) => {
    if (file && typeof file == "string") return file;
    if (file && typeof file == "object") return file.uri; // uri includes the location of the file

    // if no remote or local file
    return null;
};
