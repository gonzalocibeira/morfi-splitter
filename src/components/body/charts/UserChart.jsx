import React from 'react';
import { PieChart, Pie, Legend, Cell } from 'recharts';

export default function UserChart(data) {

    const aggData = [];
    const usersArray = [];

    data.data.forEach( (i) => {
        const index = usersArray.indexOf(i.name)
        if (index == -1) {
            usersArray.push(i.name);
            let entry = {name: i.name, amount: parseInt(i.amount)};
            aggData.push(entry);
        }
        else {
            aggData[index].amount += parseInt(i.amount);
        }
    });

    const COLORS = ['#0088FE', '#00C49F'];

    return (
        <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
            <PieChart width={350} height={200} data={aggData}>
                <Legend/>
                <Pie dataKey="amount" nameKey="name" label="name" data={aggData} cx="50%" cy="50%" outerRadius={60} fill="#000000">
                    {aggData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                </Pie>
            </PieChart>
        </div>
    )
}
