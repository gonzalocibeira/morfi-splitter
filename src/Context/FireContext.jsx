import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db, firebaseConfigurationError } from "../components/firebase/firestore";
import { AuthContext } from "./AuthContext";
import { normalizeExpenseRecord } from "../domain/expenses";
import { monthKeyFromDate, monthRangeFromKey } from "../domain/months";

export const FireContext = createContext(null);

const EMPTY_MONTH = Object.freeze({ expenses: [], status: "idle", error: null, invalidCount: 0 });

function readableDataError(error) {
    return error?.message || "Unable to load your expenses. Please try again.";
}

function normalizeParticipants(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((name) => typeof name === "string" && name.trim())
        .map((name) => name.trim())
        .slice(0, 2);
}

export default function FireProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [participants, setParticipants] = useState([]);
    const [profileStatus, setProfileStatus] = useState("idle");
    const [profileError, setProfileError] = useState(null);
    const [months, setMonths] = useState({});
    const [mutationState, setMutationState] = useState({ pending: false, id: null, error: null });
    const generationRef = useRef(0);
    const monthsRef = useRef({});
    const userRef = useRef(user);
    const requestRef = useRef(0);
    const monthRequestsRef = useRef({});

    const replaceMonths = useCallback((nextMonths) => {
        monthsRef.current = nextMonths;
        setMonths(nextMonths);
    }, []);

    const updateMonth = useCallback((monthKey, update) => {
        const current = monthsRef.current[monthKey] || EMPTY_MONTH;
        const nextEntry = typeof update === "function" ? update(current) : update;
        replaceMonths({ ...monthsRef.current, [monthKey]: nextEntry });
    }, [replaceMonths]);

    useEffect(() => {
        userRef.current = user;
        generationRef.current += 1;
        const generation = generationRef.current;
        replaceMonths({});
        setParticipants([]);
        setProfileError(null);
        setMutationState({ pending: false, id: null, error: null });

        if (!user?.uid) {
            setProfileStatus("idle");
            return undefined;
        }

        setProfileStatus("loading");
        getDoc(doc(db, "users", user.uid))
            .then((snapshot) => {
                if (generationRef.current !== generation) {
                    return;
                }

                const names = normalizeParticipants(snapshot.data()?.names);
                setParticipants(names);
                if (!snapshot.exists() || names.length !== 2) {
                    setProfileStatus("error");
                    setProfileError("This account needs exactly two participant names in its profile.");
                    return;
                }
                setProfileStatus("success");
            })
            .catch((error) => {
                if (generationRef.current === generation) {
                    setProfileStatus("error");
                    setProfileError(readableDataError(error));
                }
            });

        return undefined;
    }, [replaceMonths, user]);

    const loadMonth = useCallback(async (monthKey, options = {}) => {
        const range = monthRangeFromKey(monthKey);
        const currentUser = userRef.current;
        if (!range || !currentUser?.uid) {
            return [];
        }

        const cached = monthsRef.current[monthKey];
        if (!options.force && (cached?.status === "success" || cached?.status === "loading")) {
            return cached.expenses;
        }

        const generation = generationRef.current;
        const requestId = ++requestRef.current;
        monthRequestsRef.current[monthKey] = requestId;
        updateMonth(monthKey, (current) => ({ ...current, status: "loading", error: null }));

        try {
            const expensesQuery = query(
                collection(db, "expenses", currentUser.uid, "monthly"),
                where("date", ">=", Timestamp.fromDate(range.start)),
                where("date", "<", Timestamp.fromDate(range.end)),
                orderBy("date", "asc")
            );
            const snapshot = await getDocs(expensesQuery);
            const normalized = snapshot.docs
                .map((expenseDoc) => normalizeExpenseRecord(expenseDoc.id, expenseDoc.data()));
            const expenses = normalized.filter(Boolean);

            if (
                generationRef.current !== generation
                || userRef.current?.uid !== currentUser.uid
                || monthRequestsRef.current[monthKey] !== requestId
            ) {
                return expenses;
            }

            updateMonth(monthKey, {
                expenses,
                status: "success",
                error: null,
                invalidCount: normalized.length - expenses.length
            });
            return expenses;
        } catch (error) {
            if (generationRef.current === generation && userRef.current?.uid === currentUser.uid) {
                updateMonth(monthKey, (current) => ({
                    ...current,
                    status: "error",
                    error: readableDataError(error)
                }));
            }
            throw error;
        }
    }, [updateMonth]);

    const runMutation = useCallback(async (id, action, monthKey) => {
        const generation = generationRef.current;
        const userId = userRef.current?.uid;
        setMutationState({ pending: true, id, error: null });
        try {
            await action();
            if (generationRef.current !== generation || userRef.current?.uid !== userId) {
                return;
            }
            if (monthKey) {
                await loadMonth(monthKey, { force: true });
            }
            if (generationRef.current === generation && userRef.current?.uid === userId) {
                setMutationState({ pending: false, id: null, error: null });
            }
        } catch (error) {
            const message = readableDataError(error);
            if (generationRef.current === generation && userRef.current?.uid === userId) {
                setMutationState({ pending: false, id: null, error: message });
            }
            throw new Error(message);
        }
    }, [loadMonth]);

    const createExpense = useCallback(async (input) => {
        const currentUser = userRef.current;
        if (!currentUser?.uid || !Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) {
            throw new Error("The expense data is invalid.");
        }

        const monthKey = monthKeyFromDate(new Date());
        await runMutation("create", () => addDoc(
            collection(db, "expenses", currentUser.uid, "monthly"),
            {
                name: input.participantName,
                amountCents: input.amountCents,
                date: serverTimestamp(),
                note: input.note || "",
                category: input.category || "Other",
                nonSplit: input.nonSplit === true
            }
        ), monthKey);
    }, [runMutation]);

    const updateExpenseAmount = useCallback(async (id, monthKey, amountCents) => {
        const currentUser = userRef.current;
        if (!currentUser?.uid || !id || !Number.isSafeInteger(amountCents) || amountCents <= 0) {
            throw new Error("Enter a valid positive amount with no more than two decimals.");
        }

        await runMutation(id, () => updateDoc(
            doc(db, "expenses", currentUser.uid, "monthly", id),
            { amountCents, amount: deleteField() }
        ), monthKey);
    }, [runMutation]);

    const deleteExpense = useCallback(async (id, monthKey) => {
        const currentUser = userRef.current;
        if (!currentUser?.uid || !id) {
            throw new Error("Unable to identify the expense.");
        }

        await runMutation(id, () => deleteDoc(
            doc(db, "expenses", currentUser.uid, "monthly", id)
        ), monthKey);
    }, [runMutation]);

    const value = useMemo(() => ({
        participants,
        profileStatus,
        profileError: firebaseConfigurationError || profileError,
        months,
        getMonth: (monthKey) => months[monthKey] || EMPTY_MONTH,
        loadMonth,
        createExpense,
        updateExpenseAmount,
        deleteExpense,
        mutationState
    }), [
        createExpense,
        deleteExpense,
        loadMonth,
        months,
        mutationState,
        participants,
        profileError,
        profileStatus,
        updateExpenseAmount
    ]);

    return <FireContext.Provider value={value}>{children}</FireContext.Provider>;
}
