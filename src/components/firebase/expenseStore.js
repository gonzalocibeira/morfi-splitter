import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { firebaseApp } from "./firestore";
const db = getFirestore(firebaseApp);
const expensesPath = (uid) => collection(db, "expenses", uid, "monthly");
export async function loadProfile(uid) {
    const snapshot = await getDoc(doc(db, "users", uid));
    return snapshot.exists() ? snapshot.data()?.names : null;
}
export async function loadExpenses(uid, range) {
    const snapshot = await getDocs(
        query(
            expensesPath(uid),
            where("date", ">=", Timestamp.fromDate(range.start)),
            where("date", "<", Timestamp.fromDate(range.end)),
            orderBy("date", "asc"),
        ),
    );
    return snapshot.docs.map((entry) => ({ id: entry.id, data: entry.data() }));
}
export async function addExpense(uid, input) {
    const result = await addDoc(expensesPath(uid), {
        name: input.participantName,
        amountCents: input.amountCents,
        date: serverTimestamp(),
        note: input.note || "",
        category: input.category || "Other",
        nonSplit: input.nonSplit === true,
    });
    return result.id;
}
export function changeAmount(uid, id, amountCents) {
    return updateDoc(doc(db, "expenses", uid, "monthly", id), {
        amountCents,
        amount: deleteField(),
    });
}
export function removeExpense(uid, id) {
    return deleteDoc(doc(db, "expenses", uid, "monthly", id));
}
