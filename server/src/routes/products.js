import { Router } from "express";
import Product from "../models/Product.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };
  res.json(await Product.find(filter).sort({ createdAt: -1 }));
});

router.post("/", auth, allow("manager", "admin"), async (req, res) => {
  res.status(201).json(await Product.create(req.body));
});

router.patch("/:id", auth, allow("manager", "admin"), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

router.delete("/:id", auth, allow("manager", "admin"), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

export default router;
