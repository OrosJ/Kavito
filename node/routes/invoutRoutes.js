import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { createInventoryOut, getAllInventoryOuts, updateInventoryOut, deleteInventoryOut, getInventoryOutById } from "../controllers/InvOutController.js";

const router = express.Router();

router.post("/", authenticateToken, createInventoryOut); // Registrar una nueva salida
router.get("/", getAllInventoryOuts); // Obtener todas las salidas
router.get("/:id", getInventoryOutById); // Obtener por id
router.put("/:id", updateInventoryOut); // Registrar una nueva salida
router.delete("/:id", deleteInventoryOut); // Obtener todas las salidas


export default router;
