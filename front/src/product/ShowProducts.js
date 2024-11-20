import axios from 'axios'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const URI = 'http://localhost:8000/products/'

const CompShowProducts = () => {
    const [products, setProducts] = useState([])  // Nombre corregido de `setProduct` a `setProducts`
    
    useEffect(() => {
        getProducts()
    }, [])

    // Obtener los productos
    const getProducts = async () => {
        try {
            const res = await axios.get(URI)
            setProducts(res.data)  // Corregido: actualizar el estado correctamente
        } catch (error) {
            console.error("Error al obtener los productos:", error)
        }
    }

    // Eliminar un producto
    const deleteProduct = async (id) => {
        try {
            await axios.delete(`${URI}${id}`)
            getProducts()  // Vuelve a obtener los productos después de la eliminación
        } catch (error) {
            console.error("Error al eliminar el producto:", error)
        }
    }

    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <Link to="/create" className='btn btn-primary mt-2 mb-2'>
                        <i className="fa-regular fa-square-plus"></i> NUEVO REGISTRO
                    </Link>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Descripción</th>
                                <th scope="col">Categoria</th>
                                <th scope="col">Cantidad</th>
                                <th scope="col">Precio</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.descripcion}</td>
                                    <td>{product.category.categoryname}</td>
                                    <td>{product.cantidad}</td>
                                    <td>{product.precio}</td>
                                    <td>
                                        <Link to={`/edit/${product.id}`} className='btn btn-info'>
                                            <i className="fa-regular fa-pen-to-square"></i> Editar
                                        </Link>
                                        <button onClick={() => deleteProduct(product.id)} className='btn btn-danger'>
                                            <i className="fa-regular fa-trash-can"></i> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default CompShowProducts
