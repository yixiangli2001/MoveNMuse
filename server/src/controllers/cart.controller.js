// Shirley
import Cart from "../models/cart.model.js";
import Course from "../models/course.model.js";
import { CourseSession } from "../models/courseSession.model.js";
import { RoomSlot } from "../models/roomSlot.model.js";
import Room from "../models/room.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// helper to enrich cart with product and occurrence details
async function enrichCart(cartDoc) {
  if (!cartDoc) return cartDoc;
  const cart = cartDoc.toObject ? cartDoc.toObject() : cartDoc;
  if (!Array.isArray(cart.cartItems) || cart.cartItems.length === 0)
    return cart;

  const enrichedItems = await Promise.all(
    cart.cartItems.map(async (item) => {
      let product = null;
      let occurrence = null;

      if (item.productType === "Course") {
        product = await Course.findOne({ courseId: item.productId }).lean();
        occurrence = await CourseSession.findOne({
          sessionId: item.occurrenceId,
        }).lean();
      } else if (item.productType === "Room") {
        product = await Room.findOne({ roomId: item.productId }).lean();
        occurrence = await RoomSlot.findOne({
          roomSlotId: item.occurrenceId,
        }).lean();
      }

      const occurrences =
        item.productType === "Course"
          ? await CourseSession.find({ courseId: item.productId }).lean()
          : await RoomSlot.find({ roomId: item.productId }).lean();

      return {
        ...item,
        product,
        occurrence,
        occurrences,
      };
    })
  );

  return { ...cart, cartItems: enrichedItems };
}

// Get cart for a user
const getCartByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ userId: Number(userId) });
  if (!cart) throw new ApiError(404, "Cart not found");
  
  const enriched = await enrichCart(cart);
  return res.status(200).json(new ApiResponse(200, enriched, "Cart fetched successfully"));
});

// Add item to cart
const addItemToCart = asyncHandler(async (req, res) => {
  const { userId, productId, productType, occurrenceId } = req.body;

  let cart = await Cart.findOne({ userId: Number(userId) });
  if (!cart) {
    const lastCart = await Cart.findOne().sort({ cartId: -1 });
    const newCartId = (lastCart?.cartId || 0) + 1;
    cart = await Cart.create({ userId: Number(userId), cartId: newCartId, cartItems: [] });
  }

  const lastItem = cart.cartItems.sort((a, b) => b.itemId - a.itemId)[0];
  const newItemId = (lastItem?.itemId || 0) + 1;

  const newItem = {
    itemId: newItemId,
    productId: Number(productId),
    productType,
    occurrenceId: Number(occurrenceId),
  };

  cart.cartItems.push(newItem);
  await cart.save();

  return res.status(201).json(new ApiResponse(201, null, "Item added to cart"));
});

// Remove item from cart
const removeCartItem = asyncHandler(async (req, res) => {
  const { cartId, itemId } = req.params;

  const cart = await Cart.findOne({ cartId: Number(cartId) });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.cartItems = cart.cartItems.filter(
    (item) => item.itemId !== Number(itemId)
  );
  await cart.save();

  const enriched = await enrichCart(cart);
  return res.status(200).json(new ApiResponse(200, enriched, "Item removed successfully"));
});

const removeMultipleCartItems = asyncHandler(async (req, res) => {
  const { cartId, itemIds } = req.body;

  const cart = await Cart.findOne({ cartId: Number(cartId) });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.cartItems = cart.cartItems.filter(
    (item) => !itemIds.includes(item.itemId)
  );
  await cart.save();

  const enriched = await enrichCart(cart);
  return res.status(200).json(new ApiResponse(200, enriched, "Items removed successfully"));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { cartId, itemId } = req.params;
  const { occurrenceId } = req.body;

  const updated = await Cart.findOneAndUpdate(
    { cartId: Number(cartId), "cartItems.itemId": Number(itemId) },
    { $set: { "cartItems.$.occurrenceId": Number(occurrenceId) } },
    { new: true }
  );

  if (!updated) throw new ApiError(404, "Cart item not found");

  const enriched = await enrichCart(updated);
  return res.status(200).json(new ApiResponse(200, enriched, "Cart item updated successfully"));
});

export {
  getCartByUserId,
  addItemToCart,
  removeCartItem,
  removeMultipleCartItems,
  updateCartItem,
};
