import { ResponseType, WalletType } from "@/types";
import { uplaodFileToCloudinary } from "./imageService";
import { collection, doc, setDoc } from "firebase/firestore";
import { firestore } from "@/config/firebase";

export const createOrUpdateWallet = async (
    walletData: Partial<WalletType>
): Promise<ResponseType> => {
    try {
        let walletToSave = { ...walletData };

        // if we have the image
        if (walletData.image) {
            // uplaodFileToCloudinary(fileName, folderName)
            const imageUploadRes = await uplaodFileToCloudinary(
                walletData.image,
                "wallets"
            );

            // if fails to upload
            if (!imageUploadRes.success) {
                return {
                    success: false,
                    msg: imageUploadRes.msg || "Failed to upload wallet icon",
                };
            }

            // if image is uploaded
            walletToSave.image = imageUploadRes.data; // will be the url of the image just uploaded
        }

        // if new wallet, set some default values
        if (!walletData?.id) {
            walletToSave.amount = 0;
            walletToSave.totalIncome = 0;
            walletToSave.totalExpenses = 0;
            walletToSave.created = new Date();
        }

        // ? document reference if we already have the document : if not exist - new collection in firestore
        const walletRef = walletData?.id
            ? doc(firestore, "wallets", walletData?.id)
            : doc(collection(firestore, "wallets"));

        await setDoc(walletRef, walletToSave, { merge: true }); // updates only the data provided

        // return the wallet data including the id
        return {
            success: true,
            data: { ...walletToSave, id: walletRef.id },
        };
    } catch (error: any) {
        console.log("error creating or updating the wallet: ", error);
        return { success: false, msg: error.message };
    }
};
