import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    QueryConstraint,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";

const useFetchData = <T>(
    collectonName: string, // collectionName that we're fetching the data from
    constraints: QueryConstraint[] = [] // an array of all the constraints
) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // hook to register onsnapshot Hook
    useEffect(() => {
        // if no collectionName received, return at once
        if (!collectonName) return;
        // else
        const collectionRef = collection(firestore, collectonName);
        const q = query(collectionRef, ...constraints); // query

        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const fetchedData = snapshot.docs.map((doc) => {
                    // return the data
                    return {
                        id: doc.id,
                        ...doc.data(),
                    };
                }) as T[];
                // after this, set the data state
                setData(fetchedData);
                // stop loading, after we done fetching data
                setLoading(false);
            },
            (err) => {
                console.log("Error fetching data: ", err);
                setError(err.message);
                setLoading(false);
            }
        );

        // call the unsub func when this component unmounts to unsubscribe from this hook
        return () => unsub();
    }, []);

    return { data, loading, error };
};

export default useFetchData;

const styles = StyleSheet.create({});
