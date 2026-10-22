import React, { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import ChartKey, { COLORS } from "./ChartKey";
import { formatCents } from "../../../domain/money";
function UserChart({ data }) {
    return (
        <>
            <div className="chart-canvas">
                <ResponsiveContainer>
                    <PieChart>
                        <Tooltip
                            formatter={(value) => [formatCents(Math.round(value * 100)), "Amount"]}
                        />
                        <Pie
                            dataKey="amount"
                            nameKey="name"
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={3}
                            isAnimationActive={false}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="var(--surface)"
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <ChartKey data={data} nameKey="name" />
        </>
    );
}
export default memo(UserChart);
