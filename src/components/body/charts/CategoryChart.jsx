import React from 'react';
import { PieChart, Pie, Legend, Cell } from 'recharts';

export default function CategoryChart(data) {

    const aggData = [];
    const categoriesArray = [];

    data.data.forEach( (i) => {
        const index = categoriesArray.indexOf(i.data.category)
        if (index == -1) {
            categoriesArray.push(i.data.category);
            let entry = {category: i.data.category, amount: parseInt(i.data.amount)};
            aggData.push(entry);
        }
        else {
            aggData[index].amount += parseInt(i.data.amount);
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
