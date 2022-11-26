import React from 'react';
import { PieChart, Pie, Legend, Cell } from 'recharts';

export default function CategoryChart(data) {

    const aggData = [];
    const categoriesArray = [];

    data.data.forEach( (i) => {
        const index = categoriesArray.indexOf(i.category)
        if (index == -1) {
            categoriesArray.push(i.category);
            let entry = {category: i.category, amount: parseInt(i.amount)};
            aggData.push(entry);
        }
        else {
            aggData[index].amount += parseInt(i.amount);
        }
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
            <PieChart width={350} height={200} data={aggData}>
                <Legend/>
                <Pie dataKey="amount" nameKey="category" label="category" data={aggData} cx="50%" cy="50%" outerRadius={60} fill="#000000">
                    {aggData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                </Pie>
            </PieChart>
        </div>
    )
}
