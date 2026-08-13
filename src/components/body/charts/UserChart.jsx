import React from "react";
import { PieChart, Pie, Legend, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F"];

export default function UserChart({ data }) {
    return (
        <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Legend />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} €`, "Amount"]} />
                    <Pie dataKey="amount" nameKey="name" label data={data} cx="50%" cy="50%" outerRadius={75} fill="#000000">
                        {data.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
