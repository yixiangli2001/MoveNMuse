// Shirley
import express from "express";
import {   getCartByUserId,
  addItemToCart,
  removeCartItem,
  removeMultipleCartItems,
  updateCartItem,} from "../controllers/cart.controller.js"


const router = express.Router();

router.get("/:userId", getCartByUserId);

router.delete("/:cartId/:itemId", removeCartItem);
router.put("/:cartId/:itemId", updateCartItem);

//add item to cart
router.post("/addItem", addItemToCart);
router.delete("/removeItems", removeMultipleCartItems);

export default router;
