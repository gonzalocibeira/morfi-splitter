import { centsToChartValue, parseMoneyToCents } from "./money";
import { dateKey, formatExpenseDate } from "./months";

const DEFAULT_CATEGORY = "Other";

function firestoreDateToDate(value) {
    if (value && typeof value.toDate === "function") {
        return value.toDate();
    }

    if (value && Number.isFinite(value.seconds)) {
        return new Date(value.seconds * 1000);
    }

    if (value instanceof Date) {
        return value;
    }

    return null;
}

export function normalizeExpenseRecord(id, data) {
    const amountCents = Number.isSafeInteger(data?.amountCents) && data.amountCents > 0
        ? data.amountCents
        : parseMoneyToCents(data?.amount);
    const occurredAt = firestoreDateToDate(data?.date);
    const participantName = typeof data?.name === "string" ? data.name.trim() : "";

    if (!id || !participantName || !amountCents || !occurredAt || Number.isNaN(occurredAt.getTime())) {
        return null;
    }

    return {
        id,
        participantName,
        amountCents,
        occurredAt,
        category: typeof data.category === "string" && data.category.trim()
            ? data.category.trim()
            : DEFAULT_CATEGORY,
        note: typeof data.note === "string" ? data.note : "",
        nonSplit: data.nonSplit === true
    };
}

function addToMap(map, key, amountCents) {
    map.set(key, (map.get(key) || 0) + amountCents);
}

function mapToChartData(map, labelKey, labelFormatter = (value) => value) {
    return Array.from(map, ([key, amountCents]) => ({
        [labelKey]: labelFormatter(key),
        amount: centsToChartValue(amountCents)
    }));
}

export function buildChartData(expenses) {
    const daily = new Map();
    const categories = new Map();
    const participants = new Map();
    const dates = new Map();

    expenses.forEach((expense) => {
        const dayKey = dateKey(expense.occurredAt);
        dates.set(dayKey, expense.occurredAt);
        addToMap(daily, dayKey, expense.amountCents);
        addToMap(categories, expense.category || DEFAULT_CATEGORY, expense.amountCents);
        addToMap(participants, expense.participantName, expense.amountCents);
    });

    return {
        daily: mapToChartData(
            new Map(Array.from(daily).sort(([left], [right]) => left.localeCompare(right))),
            "date",
            (key) => formatExpenseDate(dates.get(key))
        ),
        categories: mapToChartData(categories, "category"),
        participants: mapToChartData(participants, "name")
    };
}

function roundHalfAwayFromZero(value) {
    return Math.sign(value) * Math.round(Math.abs(value));
}

export function calculateSettlement(expenses, participants) {
    const [first, second] = participants;
    const totals = {
        [first]: { sharedCents: 0, nonSplitCents: 0 },
        [second]: { sharedCents: 0, nonSplitCents: 0 }
    };
    let totalCents = 0;

    expenses.forEach((expense) => {
        totalCents += expense.amountCents;
        const participantTotal = totals[expense.participantName];
        if (!participantTotal) {
            return;
        }

        if (expense.nonSplit) {
            participantTotal.nonSplitCents += expense.amountCents;
        } else {
            participantTotal.sharedCents += expense.amountCents;
        }
    });

    if (!first || !second) {
        return { totalCents, totals, owedCents: 0 };
    }

    const sharedDifference = totals[first].sharedCents - totals[second].sharedCents;
    const owedCents = roundHalfAwayFromZero(sharedDifference / 2)
        + totals[first].nonSplitCents
        - totals[second].nonSplitCents;

    return { totalCents, totals, owedCents };
}
