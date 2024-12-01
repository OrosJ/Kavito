import ProductModel from "../models/ProductModel.js";
import ProjectModel from "../models/ProjectModel.js";
import InventoryOutModel from "../models/InvOutModel.js";
import { Op } from "sequelize";
import db from "../database/db.js";

export const getStats = async (req, res) => {
    try {
        const [
            totalProducts,
            lowStock,
            activeProjects,
            pendingDeliveries
        ] = await Promise.all([
            // Total de productos
            ProductModel.count(),
            
            // Productos con stock bajo
            ProductModel.count({
                where: {
                    cantidad: {
                        [Op.lt]: 10
                    }
                }
            }),
            
            // Proyectos activos
            ProjectModel.count({
                where: {
                    estado: {
                        [Op.in]: ['PLANIFICACION', 'EN_PROGRESO']
                    }
                }
            }),
            
            // Entregas pendientes
            ProjectModel.count({
                where: {
                    fecha_entrega: {
                        [Op.gte]: new Date()
                    },
                    estado: {
                        [Op.ne]: 'COMPLETADO'
                    }
                }
            })
        ]);

        res.json({
            totalProducts,
            lowStock,
            activeProjects,
            pendingDeliveries
        });

    } catch (error) {
        console.error('Error en getStats:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

export const getInventoryMovements = async (req, res) => {
    try {
        const { range = 'month' } = req.query;
        const date = new Date();
        
        let startDate;
        switch(range) {
            case 'week':
                startDate = new Date(date.setDate(date.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(date.setMonth(date.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(date.setFullYear(date.getFullYear() - 1));
                break;
            default:
                startDate = new Date(date.setMonth(date.getMonth() - 1));
        }

        const movements = await InventoryOutModel.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lte]: new Date()
                }
            },
            include: [{
                model: ProductModel,
                as: 'productos',
                through: {
                    attributes: ['cantidad']
                }
            }],
            order: [['createdAt', 'ASC']]
        });

        // Procesar y agrupar por fecha
        const movementsByDate = movements.reduce((acc, movement) => {
            const date = movement.createdAt.toISOString().split('T')[0];
            
            const totalQuantity = movement.productos.reduce((sum, product) => {
                return sum + product.inventory_out_products.cantidad;
            }, 0);

            if (!acc[date]) {
                acc[date] = {
                    date,
                    salidas: 0
                };
            }

            acc[date].salidas += totalQuantity;
            return acc;
        }, {});

        // Convertir a array y ordenar
        const chartData = Object.values(movementsByDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(chartData);

    } catch (error) {
        console.error('Error en getInventoryMovements:', error);
        res.status(500).json({
            message: 'Error al obtener movimientos de inventario',
            error: error.message
        });
    }
};

export const getUpcomingDeliveries = async (req, res) => {
    try {
        const deliveries = await ProjectModel.findAll({
            where: {
                fecha_entrega: {
                    [Op.gte]: new Date(),
                    [Op.lte]: db.literal('DATE_ADD(CURDATE(), INTERVAL 30 DAY)')
                },
                estado: {
                    [Op.ne]: 'COMPLETADO'
                }
            },
            order: [['fecha_entrega', 'ASC']],
            limit: 5
        });

        res.json(deliveries);
    } catch (error) {
        console.error('Error en getUpcomingDeliveries:', error);
        res.status(500).json({
            message: 'Error al obtener próximas entregas',
            error: error.message
        });
    }
};