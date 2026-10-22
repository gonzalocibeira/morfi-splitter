const MONEY_PATTERN = /^(\d+)(?:[.,](\d{1,2}))?$/;
const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function parseMoneyToCents(value) {
    if (typeof value !== "string" && typeof value !== "number") {
        return null;
    }

    if (typeof value === "number" && !Number.isFinite(value)) {
        return null;
    }

    const match = String(value).trim().match(MONEY_PATTERN);
    if (!match) {
        return null;
    }

    const whole = Number(match[1]);
    const fraction = Number((match[2] || "").padEnd(2, "0"));
    const cents = whole * 100 + fraction;

    return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function centsToInputValue(cents) {
    if (!Number.isSafeInteger(cents) || cents < 0) {
        return "";
    }

    return (cents / 100).toFixed(2);
}

export function formatCents(cents) {
    const safeCents = Number.isSafeInteger(cents) ? cents : 0;

    return currencyFormatter.format(safeCents / 100);
}

export function centsToChartValue(cents) {
    return cents / 100;
}
