import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const URI = 'http://localhost:8000/products/';
const CATEGORY_URI = 'http://localhost:8000/categories/';  // Ruta para obtener las categorías

const CompCreateProduct = () => {
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [precio, setPrecio] = useState('');
    const [categorias, setCategorias] = useState([]);  // Estado para almacenar las categorías
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');  // Estado para la categoría seleccionada
    const navigate = useNavigate();

    // Obtener las categorías al cargar el componente
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(CATEGORY_URI);
                setCategorias(response.data);  // Establecer las categorías obtenidas
            } catch (error) {
                console.error('Error al obtener las categorías', error);
            }
        };

        fetchCategories();
    }, []);

    // Manejar la creación del producto
    const store = async (e) => {
        e.preventDefault();
        // Enviar los datos del producto y la categoría seleccionada
        await axios.post(URI, {
            descripcion,
            cantidad,
            precio,
            categoria: categoriaSeleccionada  // Enviar el id de la categoría seleccionada
        });
        navigate('/products');  // Redirigir a la lista de productos después de crear el producto
    };

    return (
        <div>
            <h1>Crear Producto</h1>
            <form onSubmit={store}>
                <div className='mb-3'>
                    <label className='form-label'>Descripción del producto:</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        type="text"
                        className="form-control"
                        placeholder="Escribe la descripción del producto"
                    />
                </div>
                {/* Lista desplegable de categorías */}
                <div>
                    <label>Selecciona una categoría:</label>
                    <select
                        value={categoriaSeleccionada}
                        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                        className="form-control"
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.categoryname}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Cantidad:</label>
                    <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        className="form-control"
                        placeholder="Cantidad del producto"
                    />
                </div>

                <div>
                    <label>Precio:</label>
                    <input
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        className="form-control"
                        placeholder="Precio del producto"
                        step="0.01"
                    />
                </div>
                <button type='submit' className='btn btn-primary'>Crear Producto</button>
            </form>
        </div>
    );
};

export default CompCreateProduct;
