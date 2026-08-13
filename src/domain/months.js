const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function monthKeyFromDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

export function monthRangeFromKey(monthKey) {
    const match = typeof monthKey === "string" ? monthKey.match(MONTH_KEY_PATTERN) : null;
    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;

    return {
        start: new Date(year, monthIndex, 1),
        end: new Date(year, monthIndex + 1, 1)
    };
}

export function formatMonthKey(monthKey) {
    const range = monthRangeFromKey(monthKey);
    if (!range) {
        return "";
    }

    return new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric"
    }).format(range.start);
}

export function formatExpenseDate(date) {
    return new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

export function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
