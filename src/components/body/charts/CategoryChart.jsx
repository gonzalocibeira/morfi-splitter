import React from "react";
import { PieChart, Pie, Legend, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function CategoryChart({ data }) {
    return (
        <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Legend />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} €`, "Amount"]} />
                    <Pie dataKey="amount" nameKey="category" label data={data} cx="50%" cy="50%" outerRadius={75} fill="#000000">
                        {data.map((entry, index) => (
                            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
