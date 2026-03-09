import express from "express";
import Category from "../models/Category";

const router = express.Router();

// Get all categories sorted by order
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Create a new category
router.post("/", async (req, res) => {
    try {
        const { name, order } = req.body;
        const newCategory = new Category({ name, order });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: "Failed to create category", error });
    }
});

// Update a category
router.put("/:id", async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: "Failed to update category", error });
    }
});

// Delete a category
router.delete("/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Failed to delete category", error });
    }
});

export default router;
