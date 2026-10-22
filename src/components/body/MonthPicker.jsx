import React, { useEffect, useState } from "react";
import { monthRangeFromKey } from "../../domain/months";
import Icon from "../ui/Icon";
export default function MonthPicker({ value, onChange }) {
    const [draft, setDraft] = useState(value || "");
    useEffect(() => setDraft(value || ""), [value]);
    return (
        <label className="month-picker">
            <span>
                <Icon name="calendar" size={18} />
                Month
            </span>
            <input
                type="month"
                aria-label="Expense month"
                placeholder="YYYY-MM"
                value={draft}
                onChange={(event) => {
                    const month = event.target.value;
                    setDraft(month);
                    if (!month || monthRangeFromKey(month)) onChange(month || null);
                }}
            />
        </label>
    );
}
