import axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const URI = 'http://localhost:8000/products/'
const URI_CATEGORIES = 'http://localhost:8000/categories/'

const CreateProduct = () => {
    const navigate = useNavigate()
    
    // State para los campos del formulario
    const [descripcion, setDescripcion] = useState('')
    const [cantidad, setCantidad] = useState('')
    const [precio, setPrecio] = useState('')
    const [categoria, setCategoria] = useState('')
    const [image, setImage] = useState(null)
    
    // State para las categorías
    const [categories, setCategories] = useState([])

    // State para manejar los errores
    const [error, setError] = useState('')

    // Obtener las categorías al cargar el componente
    useEffect(() => {
        const getCategories = async () => {
            try {
                const res = await axios.get(URI_CATEGORIES)
                setCategories(res.data)  // Guarda las categorías disponibles
            } catch (error) {
                console.error("Error al obtener las categorías:", error)
            }
        }

        getCategories()
    }, [])

    // Función para manejar el submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validación de campos
        if (!descripcion || !cantidad || !precio || !categoria || !image) {
            setError('Por favor, complete todos los campos.')
            return
        }

        const formData = new FormData()
        formData.append('descripcion', descripcion)
        formData.append('cantidad', cantidad)
        formData.append('precio', precio)
        formData.append('categoria', categoria)
        formData.append('image', image)

        try {
            await axios.post(URI, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            navigate('/products')  // Redirige a la lista de productos
        } catch (error) {
            setError('Hubo un error al crear el producto.')
            console.error("Error al crear el producto:", error)
        }
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Crear Producto</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="descripcion" 
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)} 
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="cantidad" className="form-label">Cantidad</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="cantidad" 
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)} 
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="precio" className="form-label">Precio</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="precio" 
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)} 
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="categoria" className="form-label">Categoría</label>
                    <select 
                        className="form-select" 
                        id="categoria" 
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)} 
                        required
                    >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.categoryname}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="image" className="form-label">Imagen</label>
                    <input 
                        type="file" 
                        className="form-control" 
                        id="image" 
                        onChange={(e) => setImage(e.target.files[0])} 
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">Crear Producto</button>
            </form>
        </div>
    )
}

export default CreateProduct
