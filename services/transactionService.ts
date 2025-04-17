import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uplaodFileToCloudinary } from "./imageService";

export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
    try {
        const { id, type, walletId, image, amount } = transactionData;

        // if we dont have the data
        if (!amount || !walletId || amount <= 0 || !type) {
            return { success: false, msg: "Invalid transaction data!" };
        }

        // if we do have the data
        if (id) {
            // todo: update existing transaction
        } else {
            // update wallet for new transaction
            let res = await updateWalletForNewTransaction(
                walletId,
                Number(amount!),
                type
            );
            if (!res.success) {
                return res;
            }
        }

        // upload the receipt
        if (image) {
            // uplaodFileToCloudinary(fileName, folderName)
            const imageUploadRes = await uplaodFileToCloudinary(
                image,
                "transactions" // folderName
            );

            // if fails to upload
            if (!imageUploadRes.success) {
                return {
                    success: false,
                    msg: imageUploadRes.msg || "Failed to upload receipt",
                };
            }

            // if image is uploaded
            transactionData.image = imageUploadRes.data; // will be the url of the image just uploaded
        }

        // if new transaction, set some default values
        const transactionRef = id
            ? doc(firestore, "transactions", id)
            : doc(collection(firestore, "transactions"));
        // create the transaction object to update
        await setDoc(transactionRef, transactionData, { merge: true }); // updates only the data provided

        return {
            success: true,
            data: { ...transactionData, id: transactionRef.id },
        };
    } catch (error: any) {
        console.log("error creating or updating the transaction: ", error);
        return {
            success: false,
            msg: error.message,
        };
    }
};

const updateWalletForNewTransaction = async (
    walletId: string,
    amount: number,
    type: string
) => {
    try {
        // get the wallet Reference, which we gonna update
        const walletRef = doc(firestore, "wallets", walletId);
        // get the current wallet data
        const walletSnapShot = await getDoc(walletRef);
        // if the wallet does not exist
        if (!walletSnapShot.exists()) {
            console.log("wallet does not exist");
            return {
                success: false,
                msg: "Wallet not found",
            };
        }
        // get the wallet data
        const walletData = walletSnapShot.data() as WalletType;
        // check to see if selected wallet has enough balance for expense transaction
        if (type == "expense" && walletData.amount! - amount < 0) {
            return {
                success: false,
                msg: "Selected wallet does not have enough balance for this transaction",
            };
        }
        // check the updatetype. If income, add to the totalIncome. If expense, add to the totalExpenses
        const updateType = type == "income" ? "totalIncome" : "totalExpenses";
        // update walletBalance
        const updatedWalletAmount =
            type == "income"
                ? Number(walletData.amount) + Number(amount)
                : Number(walletData.amount) - Number(amount);
        // update the walletTotals
        const updatedTotals =
            type == "income"
                ? Number(walletData.totalIncome) + Number(amount)
                : Number(walletData.totalExpenses) + Number(amount);
        // create the wallet object to update
        await updateDoc(walletRef, {
            amount: updatedWalletAmount,
            [updateType]: updatedTotals, // if income, update totalIncome, if expense, update totalExpenses
        });
        return {
            success: true,
        };
    } catch (error: any) {
        console.log("error updating the wallet for new transaction: ", error);
        return {
            success: false,
            msg: error.message,
        };
    }
};
