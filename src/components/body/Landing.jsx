import React from 'react'

export default function Landing() {
    return (
        <>
            <div style={styles}>
                <h2 style={{fontSize:"25px"}}>
                    The total spent this month is:
                </h2>
                <h2 style={{fontSize:"50px"}}>
                    xxx€
                </h2>
            </div>
        </>
    )
}

const styles = {
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center"
}