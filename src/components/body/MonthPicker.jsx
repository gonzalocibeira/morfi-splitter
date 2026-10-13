import React, { useEffect, useState } from "react";
import { monthRangeFromKey } from "../../domain/months";

export default function MonthPicker({ value, onChange }) {
    const [draft, setDraft] = useState(value || "");
    useEffect(() => setDraft(value || ""), [value]);

    return (
        <input
            type="month"
            aria-label="Expense month"
            placeholder="YYYY-MM"
            value={draft}
            onChange={(event) => {
                const month = event.target.value;
                setDraft(month);
                // Let text-fallback browsers keep incomplete input while typing.
                if (!month || monthRangeFromKey(month)) {
                    onChange(month || null);
                }
            }}
        />
    );
}
