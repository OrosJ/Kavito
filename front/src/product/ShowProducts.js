import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Tooltip, Box, Chip, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PdfIcon from "@mui/icons-material/PictureAsPdf";
import InventoryIcon from "@mui/icons-material/Inventory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
/* import "../styles/ShowProducts.css" */

const URI = "http://localhost:8000/products/";

const CompShowProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts();
  }, []);

  // Obtener los productos
  const getProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(URI);
      console.log("Productos recibidos:", res.data);
      setProducts(res.data || []); 
    } catch (error) {
      setError(
        error.response?.data?.message || "Error al cargar los productos"
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los productos",
      });
    } finally {
      setLoading(false);
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
      // Ajusta el tamaño del rectángulo del encabezado (más bajo)
      doc.setFillColor(63, 81, 181); // Color de fondo
      doc.rect(0, 0, doc.internal.pageSize.width, 50, "F"); // Reducido de 65 a 50
    
      // Dibuja un cuadro alrededor del logo
      doc.setDrawColor(255, 255, 255); // Color de borde blanco
      doc.setLineWidth(0.5);
      doc.rect(15, 5, 40, 40, "S"); // Ajusta la posición para un rectángulo más pequeño
    
      // Agrega la imagen del logo (ajusta la ruta y las dimensiones según sea necesario)
      // El método `addImage` requiere la URL de la imagen, tipo de imagen (JPG, PNG), y las coordenadas.
      doc.addImage('images/logo.png', 'PNG', 15, 5, 40, 40);  // Cambia 'ruta/a/tu/logo.png' por la ruta real
    
      // Ajustar texto en la parte superior
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255); // Color de texto blanco
      doc.text("FERRETERÍA KAVITO", 60, 25); // Mover el texto hacia abajo para ajustarlo
    
      // Ajustar otros textos (Dirección, Teléfono, etc.)
      doc.setFontSize(10);
      doc.text("Dirección: Calle Boqueron N°1355 entre Colombia y Almirante Grau", 60, 35);
      doc.text("Teléfono: 76788361", 60, 40);
      doc.text("Email: ", 60, 45);
    
      // Línea separadora (ajustada para el nuevo tamaño del encabezado)
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(15, 48, 195, 48); // Ajustado a 48 por la reducción de la altura del encabezado
    };

    doc.setFillColor(240, 240, 240);
    doc.rect(0, 50, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(16);
    doc.text("INFORME DE INVENTARIO", doc.internal.pageSize.width / 2, 63, {
      align: "center",
    });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 15, 75);

    const statsY = 85;
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

  const getStockStatus = (cantidad, cantidad_reservada) => {
    const disponible = cantidad - cantidad_reservada;
    if (disponible <= 0) return "error";
    if (disponible <= 5) return "warning";
    return "success";
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
        header: "Stock",
        size: 200,
        Cell: ({ row }) => {
          const cantidad = Number(row.original.cantidad) || 0;
          const reservada = Number(row.original.cantidad_reservada) || 0;
          const disponible = cantidad - reservada;

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Stock Total">
                <Chip
                  icon={<InventoryIcon />}
                  label={`Total: ${cantidad}`}
                  color={cantidad > 0 ? "primary" : "default"}
                  size="small"
                />
              </Tooltip>
              {reservada > 0 && (
                <Tooltip title="Cantidad Reservada">
                  <Chip
                    label={`Reservado: ${reservada}`}
                    color="warning"
                    size="small"
                  />
                </Tooltip>
              )}
              <Tooltip title="Stock Disponible">
                <Chip
                  label={`Disponible: ${disponible}`}
                  color={getStockStatus(cantidad, reservada)}
                  variant="outlined"
                  size="small"
                />
              </Tooltip>
            </Stack>
          );
        },
      },
      {
        accessorKey: "precio",
        header: "Precio",
        size: 100,
        Cell: ({ row }) => {
          // Ver el valor exacto que llega
          const precio = Number(row.original.precio);
          return isNaN(precio) ? "Bs. 0.00" : `Bs. ${precio.toFixed(2)}`;
        },
      },
      {
        accessorKey: "image",
        header: "Imagen",
        size: 100,
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {row.original.image ? (
              <img
                src={row.original.image}
                alt={row.original.descripcion}
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "grey.200",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                }}
              >
                <InventoryIcon color="disabled" />
              </Box>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Fecha de Registro",
        size: 100,
        Cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          const formattedDate = date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          return <span>{formattedDate}</span>;
        },
      },
    ],
    []
  );

  return (
    <div className="container">
      <h1 style={{ color: "black", fontWeight: 800, fontSize: "2rem" }}>
        INVENTARIO DE PRODUCTOS
      </h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row">
        <div className="col">
          <Link to="/create" className="btn btn-primary mt-2 mb-2">
            <i className="fa-regular fa-square-plus"></i> NUEVO PRODUCTO
          </Link>

          <MaterialReactTable
            columns={columns}
            data={products}
            enableRowActions
            state={{ isLoading: loading, showProgressBars: loading, }}
            renderEmptyRowsFallback={() => (
              <center style={{ padding: '2rem' }}>
                {loading ? 'Cargando productos...' : 'No hay productos registrados'}
              </center>
            )}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
                <Button
                  color="error"
                  onClick={handleExportPDF}
                  startIcon={<PdfIcon />}
                  variant="contained"
                >
                  Exportar PDF
                </Button>
              </Box>
            )}
            renderRowActions={({ row }) => (
              <Box sx={{ display: "flex", gap: "0.5rem" }}>
                <Tooltip title="Editar">
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
            muiTableBodyRowProps={({ row }) => ({
              sx: {
                backgroundColor:
                  row.original.cantidad - row.original.cantidad_reservada <= 0
                    ? "rgba(255, 0, 0, 0.1)"
                    : row.original.cantidad - row.original.cantidad_reservada <=
                      5
                    ? "rgba(255, 255, 0, 0.1)"
                    : "inherit",
              },
            })}
            positionActionsColumn="last"
            localization={{
              noRecordsToDisplay: "No hay productos registrados",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompShowProducts;
