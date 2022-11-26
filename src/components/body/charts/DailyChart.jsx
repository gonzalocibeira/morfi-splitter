import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function DailyChart(data) {

    const aggData = [];
    const datesArray = [];

    data.data.forEach((i) => {
        const thisDate = new Date (0);
        thisDate.setUTCSeconds(i.date.seconds);
        const dd = thisDate.getDate();
        const mm = thisDate.getMonth() + 1;
        const yy = thisDate.getFullYear();
        const formatedDate = dd + "/" + mm + "/" + yy;

        const index = datesArray.indexOf(formatedDate);
        if (index == -1) {
            datesArray.push(formatedDate);
            let entry = {date: formatedDate, amount: parseInt(i.amount)};
            aggData.push(entry);
        }
        else {
            aggData[index].amount += parseInt(i.amount);
        }
    });

    return (
        <BarChart width={350} height={200} data={aggData}>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <XAxis dataKey="date"/>
            <YAxis/>
            <Bar dataKey="amount" fill="#000000"/>
        </BarChart>
    )
}
