import ClientModel from "../models/ClientModel.js";

export const getAllClients = async (req, res) => {
    try {
        const clients = await ClientModel.findAll()
        res.json(clients)
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const getClient = async (req, res) => {
    try {
        const client= await ClientModel.findAll({
            where: {
                id:req.params.id
            }
        })
        res.json(client[0])
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const createClient = async (req, res) => {
    try {
        await ClientModel.create(req.body)
        res.json({
            "message":"Cliente Creado"
        })
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const updateClient = async (req, res) => {
    try {
        await ClientModel.update (req.body, {
            where: {id:req.params.id}
        })
        res.json({
            "message":"Cliente Actualizado"
        })
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const deleteClient = async (req, res) => {
    try {
        await ClientModel.destroy({
            where: {id:req.params.id}
        })
        res.json({
            "message":"Cliente Eliminado"
        })
    } catch (error) {
        res.json ({message: error.message})
    }
}