import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from 'sweetalert2';

const URI = "http://localhost:8000/products/";

const CompShowProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  // Obtener los productos
  const getProducts = async () => {
    try {
      const res = await axios.get(URI);
      setProducts(res.data); // Corregido: actualizar el estado correctamente
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${URI}${id}`);
        // Mostrar mensaje de éxito
        Swal.fire(
          "Eliminado",
          "El producto ha sido eliminado correctamente",
          "success"
        );
        // Recargar la lista de productos
        getProducts();
      } catch (error) {
        // Mostrar mensaje de error
        Swal.fire("Error", "No se pudo eliminar el producto", "error");
        console.error(error);
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dataToExport = products;

    const addHeader = (doc) => {
      doc.setFillColor(63, 81, 181);
      doc.rect(0, 0, doc.internal.pageSize.width, 65, "F");

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, 40, 40, "S");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("(Logo)", 27, 35);

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("FERRETERÍA KAVITO", 60, 30);

      doc.setFontSize(10);
      doc.text("Dirección: [Tu dirección aquí]", 60, 40);
      doc.text("Teléfono: [Tu teléfono]", 60, 45);
      doc.text("Email: [Tu email]", 60, 50);

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(15, 60, 195, 60);
    };

    doc.setFillColor(240, 240, 240);
    doc.rect(0, 65, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(16);
    doc.text("INFORME DE INVENTARIO", doc.internal.pageSize.width / 2, 78, {
      align: "center",
    });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 15, 90);

    const statsY = 100;
    const statsHeight = 25;

    const totalProductos = dataToExport.length;
    const valorTotal = dataToExport.reduce((sum, product) => {
      const precio = Number(product.precio) || 0;
      const cantidad = Number(product.cantidad) || 0;
      return sum + precio * cantidad;
    }, 0);
    const totalItems = dataToExport.reduce(
      (sum, product) => sum + (Number(product.cantidad) || 0),
      0
    );

    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(63, 81, 181);
    doc.setLineWidth(0.1);
    doc.roundedRect(15, statsY, 180, statsHeight, 3, 3, "FD");

    doc.setTextColor(63, 81, 181);
    doc.setFontSize(12);
    doc.text("Resumen de Inventario", 20, statsY + 8);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(
      `Total Productos: ${totalProductos} | Items en Stock: ${totalItems} | Valor Total: Bs. ${valorTotal.toFixed(
        2
      )}`,
      20,
      statsY + 18
    );

    const tableRows = dataToExport.map((product, index) => {
      const precio = Number(product.precio) || 0;
      const cantidad = Number(product.cantidad) || 0;
      return [
        index + 1,
        product.descripcion || "Sin descripción",
        product.category?.categoryname || "Sin categoría",
        cantidad,
        `Bs. ${precio.toFixed(2)}`,
        `Bs. ${(precio * cantidad).toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      head: [
        [
          "#",
          "Descripción",
          "Categoría",
          "Stock",
          "Precio Unit.",
          "Valor Total",
        ],
      ],
      body: tableRows,
      startY: statsY + statsHeight + 10,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
        halign: "left",
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 60 },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
      },
      didDrawPage: function (data) {
        addHeader(doc);
      },
      margin: { top: 70, left: 15, right: 15 },
    });

    const addFooter = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setDrawColor(63, 81, 181);
        doc.setLineWidth(0.5);
        doc.line(
          15,
          doc.internal.pageSize.height - 20,
          doc.internal.pageSize.width - 15,
          doc.internal.pageSize.height - 20
        );

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          "© 2024 Ferretería KAVITO - Todos los derechos reservados",
          15,
          doc.internal.pageSize.height - 10
        );
      }
    };

    addFooter(doc);
    doc.save("informe-inventario.pdf");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        size: 50,
      },
      {
        accessorKey: "descripcion",
        header: "Descripcion",
      },
      {
        accessorKey: "category.categoryname",
        header: "Categoria",
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        size: 70,
      },
      {
        accessorKey: "precio",
        header: "Precio",
        size: 70,
        Cell: ({ row }) => {
          // Ver el valor exacto que llega
          const precio = Number(row.original.precio);
          return isNaN(precio) ? "Bs. 0.00" : `Bs. ${precio.toFixed(2)}`;
        },
      },
      {
        accessorKey: "image",
        header: "Imagen",
        Cell: ({ row }) => (
          <img
            src={row.original.image} // Asegúrate de que la URL de la imagen esté bien formada
            alt={""} // Opcional: puedes poner una descripción alternativa
            style={{ width: "50px", height: "50px", objectFit: "cover" }} // Ajusta el estilo según lo necesites
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="container">
      <h1 style={{ color: "black", fontWeight: 800, fontSize: "2rem" }}>TODOS LOS PRODUCTOS</h1>
      <div className="row">
        <div className="col">
          <Link to="/create" className="btn btn-primary mt-2 mb-2">
            <i className="fa-regular fa-square-plus"></i> NUEVO PRODUCTO
          </Link>
          {products.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={products}
              enableRowActions
              renderTopToolbarCustomActions={() => (
                <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
                  <Button
                    color="error"
                    onClick={handleExportPDF}
                    startIcon={<PdfIcon />}
                    variant="contained"
                  >
                    Exportar
                  </Button>
                </Box>
              )}
              renderRowActions={({ row }) => (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/edit/${row.original.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => deleteProduct(row.original.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              positionActionsColumn="last"
            />
          ) : (
            <p>Cargando datos...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompShowProducts;
