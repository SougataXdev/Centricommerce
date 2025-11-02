import express from "express";
import { getCategories } from "../controllers/product.controller";


const router = express.Router();


router.get('/get-categories',getCategories);

export default router;