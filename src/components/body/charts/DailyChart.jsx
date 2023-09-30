import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function DailyChart(data) {

    const aggData = [];
    const datesArray = [];

    data.data.forEach((i) => {
        const thisDate = new Date (0);
        thisDate.setUTCSeconds(i.data.date.seconds);
        const dd = thisDate.getDate();
        const mm = thisDate.getMonth() + 1;
        const yy = thisDate.getFullYear();
        const formatedDate = dd + "/" + mm + "/" + yy;

        const index = datesArray.indexOf(formatedDate);
        if (index == -1) {
            datesArray.push(formatedDate);
            let entry = {date: formatedDate, amount: parseInt(i.data.amount)};
            aggData.push(entry);
        }
        else {
            aggData[index].amount += parseInt(i.data.amount);
        }
    });

    return (
        <BarChart width={350} height={200} data={aggData}>
            <Tooltip/>
            <XAxis dataKey="date" tick={{fill:"#ffffff"}} tickLine={{stroke:"#ffffff"}}/>
            <YAxis tick={{fill:"#ffffff"}} tickLine={{stroke:"#ffffff"}}/>
            <Bar dataKey="amount" fill="#B0BEC5"/>
        </BarChart>
    )
}
