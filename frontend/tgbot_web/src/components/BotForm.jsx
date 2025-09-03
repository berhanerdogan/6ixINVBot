import React, { useEffect, useState } from "react";

export default function BotForm() {

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [visible, setVisible] = useState(null)
    const [formData, setFormData] = useState({
        bName: "",
        date: "",
        shift: "",
        products: [],
        deposited: "",
        expected: "",
        cash: "",
        coin: "",
        total: ""
    });

    useEffect(() => {
        const productData = async () => {
            try {
                const res = await fetch(`https://sixixinvbot.onrender.com/api/all-products`)
                const data = await res.json()
                setProducts(data)

                console.log(data)

                setFormData(prev => ({
                    ...prev,
                    products: data.map(p => ({
                        ProductID: p.ProductID,
                        Name: p.Name,
                        Quantity: ''
                    }))
                }));
            } catch (error) {
                console.error(error)
            }
        }
        productData()
    }, [])


    const nextPage = () => setPage(prev => prev + 1)
    const prevPage = () => setPage(prev => prev - 1)


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData)
        try {
            await fetch('https://sixixinvbot.onrender.com/api/all-products', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(FormData)
            })

        } catch (error) {
            console.error(error)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleProductChange = (index, value) => {
        const newProducts = [...formData.products];
        newProducts[index] = {
            ...newProducts[index],
            Quantity: value
        };
        setFormData(prev => ({
            ...prev,
            products: newProducts
        }));
    };




    return (
        <div className="main-wrapper">
            <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">

                {page === 1 && (
                    <div>
                        <input name="bName" value={formData.bName} onChange={handleChange} placeholder="Budtender Name" />
                        <input name="date" value={formData.date} onChange={handleChange} placeholder="Date" />
                        <input name="shift" value={formData.shift} onChange={handleChange} placeholder="Shift" />
                    </div>
                )}

                {page === 2 && (
                    <div>
                        <h2>Products</h2>
                        {products.map((product, index) => (
                            <div key={product.ProductID} className="product-item">
                                <label onClick={() => setVisible(prev => prev === product.ProductID ? null : product.ProductID)} style={{ cursor: 'pointer' }}>
                                    {product.Name} | {product.Quantity}
                                </label>

                                {visible == product.ProductID && (
                                    <input
                                        value={formData.products[index]?.Quantity || ''}
                                        onChange={e => handleProductChange(index, e.target.value)}
                                        placeholder={product.Quantity}
                                        autoFocus
                                        className="product-input"

                                    />
                                )}
                            </div>
                        ))}

                    </div>
                )}

                {page === 3 && (
                    <div>
                        <input name="deposited" value={formData.deposited} onChange={handleChange} placeholder="Deposited" />
                        <input name="expected" value={formData.expected} onChange={handleChange} placeholder="Expected" />
                        <input name="cash" value={formData.cash} onChange={handleChange} placeholder="Cash" />
                        <input name="coin" value={formData.coin} onChange={handleChange} placeholder="Coin" />
                        <input name="total" value={formData.total} onChange={handleChange} placeholder="Total" />
                    </div>
                )}

                <div className="form-buttons">
                    <button type="button" onClick={prevPage} className="bg-black">
                        Prev
                    </button>
                    <button type="submit" className="bg-black">
                        Save
                    </button>
                    <button type="button" onClick={nextPage} className="bg-black">
                        Next
                    </button>
                </div>

            </form>
        </div>
    )
}
