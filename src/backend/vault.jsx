import { databases, account } from "../appwrite";
import { ID, Query } from "appwrite";
import { encryptData, decryptData } from "../crypto";

function generateAccessKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = (len) =>
        Array.from({ length: len }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");
    return `${segment(3)}-${segment(3)}-${segment(3)}`;
}

export async function storePassword(password) {
    const user = await account.get();
    const accessKey = generateAccessKey();
    const encryptedPass = encryptData(password);

    await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_VAULT_COLLECTION_ID,
        ID.unique(),
        {
            accessKey: accessKey,
            encryptedPass: encryptedPass,
            userId: user.$id,
        }
    );

    return accessKey;
}

export async function retrievePassword(accessKey) {
    const user = await account.get();

    const result = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_VAULT_COLLECTION_ID,
        [
            Query.equal("accessKey", accessKey),
            Query.equal("userId", user.$id),
        ]
    );

    if (result.documents.length === 0) {
        throw new Error("Key not found");
    }

    const encrypted = result.documents[0].encryptedPass;
    return decryptData(encrypted);
}