// Shirley
import { Payment } from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//Process a payment
const processPayment = asyncHandler(async (req, res) => {
    const body = req.body || {};
    const { orderId: rawOrderId, amount: rawAmount, userId: rawUserId, paymentDetailId: rawPaymentDetailId } = body;

    if (!rawOrderId || !rawAmount || !rawUserId || !rawPaymentDetailId) {
        throw new ApiError(400, "Missing required fields");
    }

    const orderId = Number(rawOrderId);
    const userId = Number(rawUserId);
    const amount = Number(rawAmount);
    const paymentDetailId = Number(rawPaymentDetailId);

    const lastPayment = await Payment.findOne().sort({ paymentId: -1 });
    const newPaymentId = (lastPayment?.paymentId || 0) + 1;

    const newPayment = new Payment({
      paymentId: newPaymentId,
      orderId,
      amount,
      status: "Successful",
      userId,
      paymentDetailId,
      paymentDate: new Date(),
    });

    await newPayment.save();
    return res.status(201).json(new ApiResponse(201, { payment: newPayment }, "Payment processed successfully"));
});

// Get payment history
const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "paymentdetails",
          localField: "paymentDetailId",
          foreignField: "paymentDetailId",
          as: "paymentDetail",
        },
      },
      { $unwind: { path: "$paymentDetail", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          paymentId: 1,
          orderId: 1,
          status: 1,
          userId: 1,
          paymentDate: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentDetailId: 1,
          amount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "decimal"] },
              { $toDouble: "$amount" },
              "$amount",
            ],
          },
          paymentDetail: {
            _id: "$paymentDetail._id",
            paymentDetailId: "$paymentDetail.paymentDetailId",
            cardBrand: "$paymentDetail.cardBrand",
            nickname: "$paymentDetail.nickname",
            name: "$paymentDetail.name",
            expiryMonth: "$paymentDetail.expiryMonth",
            expiryYear: "$paymentDetail.expiryYear",
            isDefault: "$paymentDetail.isDefault",
            last4: {
              $cond: [
                { $ifNull: ["$paymentDetail.cardNumber", false] },
                {
                  $substr: [
                    "$paymentDetail.cardNumber",
                    { $subtract: [{ $strLenCP: "$paymentDetail.cardNumber" }, 4] },
                    4,
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

// Get payment history by userId
const getPaymentHistoryById = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        throw new ApiError(400, "Missing userId");
    }

    const payments = await Payment.aggregate([
      { $match: { userId: Number(userId) } },
      {
        $lookup: {
          from: "paymentdetails",
          localField: "paymentDetailId",
          foreignField: "paymentDetailId",
          as: "paymentDetail",
        },
      },
      { $unwind: { path: "$paymentDetail", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          paymentId: 1,
          orderId: 1,
          status: 1,
          userId: 1,
          paymentDate: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentDetailId: 1,
          amount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "decimal"] },
              { $toDouble: "$amount" },
              "$amount",
            ],
          },
          paymentDetail: {
            _id: "$paymentDetail._id",
            paymentDetailId: "$paymentDetail.paymentDetailId",
            cardBrand: "$paymentDetail.cardBrand",
            nickname: "$paymentDetail.nickname",
            name: "$paymentDetail.name",
            expiryMonth: "$paymentDetail.expiryMonth",
            expiryYear: "$paymentDetail.expiryYear",
            isDefault: "$paymentDetail.isDefault",
            last4: {
              $cond: [
                { $ifNull: ["$paymentDetail.cardNumber", false] },
                {
                  $substr: [
                    "$paymentDetail.cardNumber",
                    { $subtract: [{ $strLenCP: "$paymentDetail.cardNumber" }, 4] },
                    4,
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, payments, "Payment history fetched successfully"));
});

export { processPayment, getPaymentHistoryById, getAllPayments };
