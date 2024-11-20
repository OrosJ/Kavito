import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const URI = 'http://localhost:8000/products/';

const CompEditProduct = () => {
  const { id } = useParams(); // Obtener el id del producto de la URL
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const navigate = useNavigate();

  const updateProduct = async (e) =>{
    e.preventDefault()
    await axios.put(URI+id, {
        descripcion: descripcion,
        cantidad: cantidad,
        precio: precio
    })
    navigate('/')
  }

  useEffect( ()=>{
    getProductById()
  },[])

  const getProductById = async () =>{
    const res = await axios.get(URI+id)
    setDescripcion(res.data.descripcion)
    setCantidad(res.data.cantidad)
    setPrecio(res.data.precio)
  }

  return (
    <div className="container mt-4">
      <h1>Editar Producto</h1>
      <form onSubmit={updateProduct}>
        <div className="mb-3">
          <label className="form-label">Descripción del producto:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            type="text"
            className="form-control"
            placeholder="Escribe la descripción del producto"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Cantidad:</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="form-control"
            placeholder="Cantidad del producto"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Precio:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="form-control"
            placeholder="Precio del producto"
            step="0.01"
          />
        </div>

        <button type="submit" className="btn btn-success">Actualizar Producto</button>
      </form>
    </div>
  );
};

export default CompEditProduct;
