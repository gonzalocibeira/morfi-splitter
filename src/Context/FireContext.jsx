import React, {
    createContext,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { firebaseConfigurationError } from "../components/firebase/firestore";
import { AuthContext } from "./AuthContext";
import { normalizeExpenseRecord } from "../domain/expenses";
import { monthKeyFromDate, monthRangeFromKey } from "../domain/months";

export const FireContext = createContext(null);
const EMPTY_MONTH = Object.freeze({
    expenses: [],
    status: "idle",
    error: null,
    warning: null,
    refreshing: false,
    invalidCount: 0,
    loadedAt: 0,
    hasSavedChanges: false,
});
const CACHE_TTL = 60_000;
const getStore = () => import("../components/firebase/expenseStore");
const readableError = (error) =>
    error?.message || "Unable to load your expenses. Please try again.";

export default function FireProvider({ children }) {
    const { user } = useContext(AuthContext);
    const uid = user?.uid;
    const userRef = useRef(uid);
    userRef.current = uid;
    const [participants, setParticipants] = useState([]);
    const participantsRef = useRef([]);
    const [profileStatus, setProfileStatus] = useState("idle");
    const [profileError, setProfileError] = useState(null);
    const [months, setMonths] = useState({});
    const monthsRef = useRef({});
    const [pendingOperations, setPendingOperations] = useState({});
    const operationsRef = useRef(new Map());
    const generation = useRef(0);
    const requests = useRef(new Map());

    const updateMonth = useCallback((key, update) => {
        const current = monthsRef.current[key] || EMPTY_MONTH;
        monthsRef.current = {
            ...monthsRef.current,
            [key]: typeof update === "function" ? update(current) : update,
        };
        setMonths(monthsRef.current);
    }, []);

    useLayoutEffect(() => {
        const version = ++generation.current;
        monthsRef.current = {};
        requests.current.clear();
        operationsRef.current.clear();
        participantsRef.current = [];
        setMonths({});
        setPendingOperations({});
        setParticipants([]);
        setProfileError(null);
        if (!uid || firebaseConfigurationError) {
            setProfileStatus("idle");
            return () => {
                generation.current += 1;
            };
        }
        setProfileStatus("loading");
        getStore()
            .then((store) => store.loadProfile(uid))
            .then((names) => {
                if (version !== generation.current || uid !== userRef.current) return;
                const normalized = Array.isArray(names)
                    ? names
                          .filter((name) => typeof name === "string" && name.trim())
                          .map((name) => name.trim())
                    : [];
                if (normalized.length !== 2 || normalized[0] === normalized[1]) {
                    throw new Error(
                        "This account needs two different participant names in its profile.",
                    );
                }
                participantsRef.current = normalized;
                setParticipants(normalized);
                setProfileStatus("success");
            })
            .catch((error) => {
                if (version !== generation.current || uid !== userRef.current) return;
                setProfileStatus("error");
                setProfileError(readableError(error));
            });
        return () => {
            generation.current += 1;
        };
    }, [uid]);

    const loadMonth = useCallback(
        (monthKey, options = {}) => {
            const range = monthRangeFromKey(monthKey);
            const owner = userRef.current;
            if (!range || !owner || firebaseConfigurationError) return Promise.resolve([]);
            const active = requests.current.get(monthKey);
            if (!options.force && active) return active.promise;
            const cached = monthsRef.current[monthKey];
            if (
                !options.force &&
                cached?.status === "success" &&
                Date.now() - cached.loadedAt < CACHE_TTL
            ) {
                return Promise.resolve(cached.expenses);
            }
            const version = generation.current;
            const request = {};
            const isCurrent = () =>
                version === generation.current &&
                owner === userRef.current &&
                requests.current.get(monthKey) === request;
            updateMonth(monthKey, (current) => ({
                ...current,
                status: current.status === "success" ? "success" : "loading",
                refreshing: current.status === "success",
                error: null,
                warning: null,
            }));
            request.promise = getStore()
                .then((store) => store.loadExpenses(owner, range))
                .then((records) => {
                    const normalized = records.map(({ id, data }) =>
                        normalizeExpenseRecord(id, data),
                    );
                    const expenses = normalized.filter(Boolean);
                    if (isCurrent())
                        updateMonth(monthKey, {
                            expenses,
                            status: "success",
                            error: null,
                            warning: null,
                            refreshing: false,
                            invalidCount: normalized.length - expenses.length,
                            loadedAt: Date.now(),
                            hasSavedChanges: false,
                        });
                    return expenses;
                })
                .catch((error) => {
                    if (isCurrent())
                        updateMonth(monthKey, (current) => ({
                            ...current,
                            refreshing: false,
                            status: current.status === "success" ? "success" : "error",
                            error: current.status === "success" ? null : readableError(error),
                            warning: current.hasSavedChanges
                                ? "Your saved changes are safe. Could not refresh the latest totals. Retry the refresh; do not submit the expense again."
                                : current.status === "success"
                                  ? "Could not refresh expenses. Showing previously loaded data. Retry to get the latest totals."
                                  : null,
                        }));
                    throw error;
                })
                .finally(() => {
                    if (requests.current.get(monthKey) === request)
                        requests.current.delete(monthKey);
                });
            requests.current.set(monthKey, request);
            return request.promise;
        },
        [updateMonth],
    );

    const runMutation = useCallback(
        (id, action, monthKey, patch) => {
            if (operationsRef.current.has(id)) return operationsRef.current.get(id);
            const owner = userRef.current;
            const version = generation.current;
            const valid = () => version === generation.current && owner === userRef.current;
            setPendingOperations((current) => ({ ...current, [id]: true }));
            const promise = getStore()
                .then((store) => {
                    if (!valid()) throw new Error("Your session changed. Please try again.");
                    return action(store, owner);
                })
                .then((result) => {
                    if (!valid()) return;
                    // Invalidate reads started before the acknowledged write.
                    requests.current.delete(monthKey);
                    updateMonth(monthKey, (current) => ({
                        ...current,
                        expenses: patch(current.expenses, result),
                        status: current.status === "error" ? "idle" : current.status,
                        loadedAt: 0,
                        hasSavedChanges: true,
                        error: null,
                        warning: null,
                    }));
                    // A refresh failure must never make a committed write look unsuccessful.
                    loadMonth(monthKey, { force: true }).catch(() => undefined);
                    return result;
                })
                .finally(() => {
                    if (!valid()) return;
                    operationsRef.current.delete(id);
                    setPendingOperations((current) => {
                        const next = { ...current };
                        delete next[id];
                        return next;
                    });
                });
            operationsRef.current.set(id, promise);
            return promise;
        },
        [loadMonth, updateMonth],
    );

    const createExpense = useCallback(
        (input) => {
            if (
                !userRef.current ||
                !participantsRef.current.includes(input.participantName) ||
                !Number.isSafeInteger(input.amountCents) ||
                input.amountCents <= 0
            ) {
                return Promise.reject(
                    new Error("Choose a participant and enter a valid positive amount."),
                );
            }
            const occurredAt = new Date();
            return runMutation(
                "create",
                (store, owner) => store.addExpense(owner, input),
                monthKeyFromDate(occurredAt),
                (expenses, id) => [...expenses, { ...input, id, occurredAt }],
            );
        },
        [runMutation],
    );

    const updateExpenseAmount = useCallback(
        (id, monthKey, amountCents) => {
            if (
                !userRef.current ||
                !id ||
                !monthRangeFromKey(monthKey) ||
                !Number.isSafeInteger(amountCents) ||
                amountCents <= 0
            ) {
                return Promise.reject(
                    new Error("Enter a valid positive amount with no more than two decimals."),
                );
            }
            return runMutation(
                id,
                (store, owner) => store.changeAmount(owner, id, amountCents),
                monthKey,
                (expenses) =>
                    expenses.map((expense) =>
                        expense.id === id ? { ...expense, amountCents } : expense,
                    ),
            );
        },
        [runMutation],
    );

    const deleteExpense = useCallback(
        (id, monthKey) => {
            if (!userRef.current || !id || !monthRangeFromKey(monthKey))
                return Promise.reject(new Error("Unable to identify the expense."));
            return runMutation(
                id,
                (store, owner) => store.removeExpense(owner, id),
                monthKey,
                (expenses) => expenses.filter((expense) => expense.id !== id),
            );
        },
        [runMutation],
    );

    const value = useMemo(
        () => ({
            participants,
            profileStatus,
            profileError: firebaseConfigurationError || profileError,
            getMonth: (key) => months[key] || EMPTY_MONTH,
            loadMonth,
            createExpense,
            updateExpenseAmount,
            deleteExpense,
            pendingOperations,
        }),
        [
            participants,
            profileStatus,
            profileError,
            months,
            loadMonth,
            createExpense,
            updateExpenseAmount,
            deleteExpense,
            pendingOperations,
        ],
    );
    return <FireContext.Provider value={value}>{children}</FireContext.Provider>;
}
