import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uplaodFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";

// 🔧 Helper: Remove undefined fields before saving to Firestore
const removeUndefinedFields = (obj: Record<string, any>) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
};

export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
    try {
        const { id, type, walletId, image, amount } = transactionData;

        // ⚠️ Validate required fields
        if (!amount || !walletId || amount <= 0 || !type) {
            return { success: false, msg: "Invalid transaction data!" };
        }

        // ✏️ If editing an existing transaction
        if (id) {
            const oldTransactionSnapshot = await getDoc(
                doc(firestore, "transactions", id)
            );
            const oldTransaction =
                oldTransactionSnapshot.data() as TransactionType;

            const shouldRevertOriginal =
                oldTransaction.type !== type ||
                oldTransaction.amount !== amount ||
                oldTransaction.walletId !== walletId;

            if (shouldRevertOriginal) {
                let res = await revertAndUpdateWallets(
                    oldTransaction,
                    Number(amount),
                    type,
                    walletId
                );
                if (!res.success) return res;
            }
        } else {
            // ➕ New transaction
            let res = await updateWalletForNewTransaction(
                walletId,
                Number(amount),
                type
            );
            if (!res.success) return res;
        }

        // 📤 Upload image (if any)
        if (image) {
            const imageUploadRes = await uplaodFileToCloudinary(
                image,
                "transactions"
            );
            if (!imageUploadRes.success) {
                return {
                    success: false,
                    msg: imageUploadRes.msg || "Failed to upload receipt",
                };
            }
            transactionData.image = imageUploadRes.data;
        }

        // 🧹🔥 FIXED HERE: Remove undefined fields to avoid Firebase error
        const cleanedTransactionData = removeUndefinedFields(transactionData);

        const transactionRef = id
            ? doc(firestore, "transactions", id)
            : doc(collection(firestore, "transactions"));

        await setDoc(transactionRef, cleanedTransactionData, { merge: true });

        return {
            success: true,
            data: { ...cleanedTransactionData, id: transactionRef.id },
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
        const walletRef = doc(firestore, "wallets", walletId);
        const walletSnapShot = await getDoc(walletRef);
        if (!walletSnapShot.exists()) {
            console.log("wallet does not exist");
            return { success: false, msg: "Wallet not found" };
        }

        const walletData = walletSnapShot.data() as WalletType;

        if (type === "expense" && walletData.amount! - amount < 0) {
            return {
                success: false,
                msg: "Selected wallet does not have enough balance for this transaction",
            };
        }

        const updateType = type === "income" ? "totalIncome" : "totalExpenses";
        const updatedWalletAmount =
            type === "income"
                ? Number(walletData.amount) + Number(amount)
                : Number(walletData.amount) - Number(amount);
        const updatedTotals =
            type === "income"
                ? Number(walletData.totalIncome) + Number(amount)
                : Number(walletData.totalExpenses) + Number(amount);

        await updateDoc(walletRef, {
            amount: updatedWalletAmount,
            [updateType]: updatedTotals,
        });

        return { success: true };
    } catch (error: any) {
        console.log("error updating the wallet for new transaction: ", error);
        return { success: false, msg: error.message };
    }
};

const revertAndUpdateWallets = async (
    oldTransaction: TransactionType,
    newTransactionAmount: number,
    newTransactionType: string,
    newWalletId: string
) => {
    try {
        const originalWalletSnapshot = await getDoc(
            doc(firestore, "wallets", oldTransaction.walletId)
        );
        const originalWallet = originalWalletSnapshot.data() as WalletType;

        let newWalletSnapshot = await getDoc(
            doc(firestore, "wallets", newWalletId)
        );
        let newWallet = newWalletSnapshot.data() as WalletType;

        const revertType =
            oldTransaction.type === "income" ? "totalIncome" : "totalExpenses";
        const revertIncomeExpense: number =
            oldTransaction.type === "income"
                ? -Number(oldTransaction.amount)
                : Number(oldTransaction.amount);

        const revertedWalletAmount =
            Number(originalWallet.amount) + revertIncomeExpense;
        const revertedIncomeExpenseAmount =
            Number(originalWallet[revertType]) - Number(oldTransaction.amount);

        // ✅ Validation
        if (newTransactionType === "expense") {
            if (
                oldTransaction.walletId === newWalletId &&
                revertedWalletAmount < newTransactionAmount
            ) {
                return {
                    success: false,
                    msg: "Selected wallet does not have enough balance for this transaction",
                };
            }
        }
        if (newWallet.amount! < newTransactionAmount) {
            return {
                success: false,
                msg: "Selected wallet does not have enough balance for this transaction",
            };
        }

        await createOrUpdateWallet({
            id: oldTransaction.walletId,
            amount: revertedWalletAmount,
            [revertType]: revertedIncomeExpenseAmount,
        });

        // Refresh new wallet after revert
        newWalletSnapshot = await getDoc(
            doc(firestore, "wallets", newWalletId)
        );
        newWallet = newWalletSnapshot.data() as WalletType;

        const updateType =
            newTransactionType === "income" ? "totalIncome" : "totalExpenses";
        const updatedTransactionAmount: number =
            newTransactionType === "income"
                ? Number(newTransactionAmount)
                : -Number(newTransactionAmount);
        const newWalletAmount =
            Number(newWallet.amount) + updatedTransactionAmount;
        const newIncomeExpenseAmount =
            Number(newWallet[updateType]) + Number(newTransactionAmount);

        await createOrUpdateWallet({
            id: newWalletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount,
        });

        return { success: true };
    } catch (error: any) {
        console.log("error updating the wallet for new transaction: ", error);
        return { success: false, msg: error.message };
    }
};
