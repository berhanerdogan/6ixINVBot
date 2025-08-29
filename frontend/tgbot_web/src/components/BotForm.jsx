import React, { useState, useEffect } from "react"


export default function BotForm() {
    const [products, setProducts] = useState([])


    useEffect(() => {
        fetch(`http://localhost:4000/api/all-products`)
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) => console.error(err))
    }, [])

    console.log(products)

    return (
        <div>
            <h2>Product List</h2>
            <ul>
                {products.map(product => {
                    <li key={product.ProductID}>{product.Name}</li>
                })}
            </ul>
        </div>
    )
}