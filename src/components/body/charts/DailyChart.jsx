import React from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function DailyChart({ data }) {
    return (
        <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
                <BarChart data={data}>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} €`, "Amount"]} />
                    <XAxis dataKey="date" tick={{ fill: "#ffffff" }} tickLine={{ stroke: "#ffffff" }} />
                    <YAxis tick={{ fill: "#ffffff" }} tickLine={{ stroke: "#ffffff" }} />
                    <Bar dataKey="amount" fill="#B0BEC5" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
