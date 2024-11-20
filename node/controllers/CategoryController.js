import CategoryModel from "../models/CategoryModel.js";

export const getAllCategories= async (req, res) => {
    try {
        const categories = await CategoryModel.findAll()
        res.json(categories)
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const getCategory = async (req, res) => {
    try {
        const category= await CategoryModel.findAll({
            where: {
                id:req.params.id
            }
        })
        res.json(category[0])
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const createCategory = async (req, res) => {
    try {
        await CategoryModel.create(req.body)
        res.json({
            "message":"Categoria Creada"
        })
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const updateCategory = async (req, res) => {
    try {
        await CategoryModel.update (req.body, {
            where: {id:req.params.id}
        })
        res.json({
            "message":"Categoria Actualizada"
        })
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const deleteCategory= async (req, res) => {
    try {
        await CategoryModel.destroy({
            where: {id:req.params.id}
        })
        res.json({
            "message":"Categoria Eliminada"
        })
    } catch (error) {
        res.json ({message: error.message})
    }
}