import React from "react";
import { formatCents } from "../../../domain/money";
export const COLORS = ["#72916a", "#ba876b", "#9483ad", "#6f98b0"];
export default function ChartKey({ data, nameKey }) {
    return (
        <ul className="chart-key" aria-label="Chart amounts">
            {data.map((entry, index) => (
                <li key={entry[nameKey]}>
                    <span
                        className="chart-swatch"
                        style={{ background: COLORS[index % COLORS.length] }}
                        aria-hidden="true"
                    />
                    <span>
                        {entry[nameKey]}{" "}
                        <strong>{formatCents(Math.round(entry.amount * 100))}</strong>
                    </span>
                </li>
            ))}
        </ul>
    );
}
