import React, { memo } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatCents } from "../../../domain/money";
function DailyChart({ data }) {
    return (
        <>
            <div className="chart-canvas">
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 12, right: 4, left: -20, bottom: 5 }}
                        accessibilityLayer
                    >
                        <CartesianGrid stroke="#e7eadf" vertical={false} />
                        <Tooltip
                            cursor={{ fill: "#e8eddf" }}
                            formatter={(value) => [formatCents(Math.round(value * 100)), "Amount"]}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#68716a", fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={25}
                        />
                        <YAxis
                            tick={{ fill: "#68716a", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={62}
                        />
                        <Bar
                            dataKey="amount"
                            fill="#829b72"
                            radius={[5, 5, 0, 0]}
                            maxBarSize={38}
                            isAnimationActive={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <table className="srOnly">
                <caption>Daily expense amounts in euros</caption>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry) => (
                        <tr key={entry.date}>
                            <td>{entry.date}</td>
                            <td>{formatCents(Math.round(entry.amount * 100))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
export default memo(DailyChart);
