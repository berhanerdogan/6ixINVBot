import React, { useState, useEffect } from "react"


export default function BotForm() {
    const [products, setProducts] = useState([])


    useEffect(() => {
        fetch(`http://localhost:4000/api/all-products`)
            .then((res) => res.json())
            .then((data) => {
                setProducts(data)
                console.log(data)
            })
            .catch((err) => console.error(err))
    }, [])

    return (
        <div>
            <h2>Product List</h2>
        </div>
    )
}