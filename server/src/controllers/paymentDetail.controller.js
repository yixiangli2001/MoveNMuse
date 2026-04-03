// Shirley
import { PaymentDetail } from "../models/paymentDetail.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Read paymentDetail data
const readPaymentDetail = asyncHandler(async (req, res) => {
    const userId = Number(req.query.userId);
    if (isNaN(userId)) {
        throw new ApiError(400, "Invalid or missing userId");
    }

    const paymentDetails = await PaymentDetail.find({ userId }).lean();
    return res.status(200).json(new ApiResponse(200, paymentDetails, "Payment details fetched successfully"));
});

// Add a new paymentDetail
const addPaymentDetail = asyncHandler(async (req, res) => {
    const {
      userId,
      cardBrand,
      name,
      nickname,
      cardNumber,
      cardSecurityCode,
      expiryMonth,
      expiryYear,
      isDefault,
    } = req.body || {};

    if (!userId || !cardBrand || !name || !cardNumber || !expiryMonth || !expiryYear) {
        throw new ApiError(400, "Missing required fields");
    }

    let makeDefault = Boolean(isDefault);
    const existingCount = await PaymentDetail.countDocuments({ userId });
    if (existingCount === 0) makeDefault = true;

    if (makeDefault) {
      await PaymentDetail.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    let paymentDetailId = 0;
    const lastPaymentDetail = await PaymentDetail.findOne().sort({ paymentDetailId: -1 });
    paymentDetailId = (lastPaymentDetail?.paymentDetailId || 0) + 1;

    const doc = await PaymentDetail.create({
      paymentDetailId,
      userId,
      cardBrand,
      name,
      nickname,
      cardNumber,
      cardSecurityCode,
      expiryMonth,
      expiryYear,
      isDefault: makeDefault,
    });

    const result = {
      paymentDetailId: doc.paymentDetailId,
      cardBrand: doc.cardBrand,
      nickname: doc.nickname,
      name: doc.name,
      cardNumber: doc.cardNumber,
      expiryMonth: doc.expiryMonth,
      expiryYear: doc.expiryYear,
      isDefault: doc.isDefault,
    };

    return res.status(201).json(new ApiResponse(201, result, "Payment detail created successfully"));
});

// Remove a paymentDetail by paymentDetailId 
const removePaymentDetail = asyncHandler(async (req, res) => {
    const rawPid = req.params.paymentDetailId;
    const pid = Number(rawPid);
    if (!Number.isFinite(pid)) {
        throw new ApiError(400, "Invalid paymentDetailId");
    }

    const deleted = await PaymentDetail.findOneAndDelete({ paymentDetailId: pid});
    if (!deleted) throw new ApiError(404, "Payment detail not found");

    return res.status(200).json(new ApiResponse(200, null, "Payment detail removed successfully"));
});

// Find paymentDetail contents for booking by paymentDetail id
const getPaymentDetailById = asyncHandler(async (req, res) => {
    const paymentDetailId = Number(req.params.paymentDetailId);
    const paymentDetail = await PaymentDetail.findById(paymentDetailId);

    if (!paymentDetail) throw new ApiError(404, "Payment detail not found");

    return res.status(200).json(new ApiResponse(200, paymentDetail, "Payment detail fetched successfully"));
});

// Set default payment detail
const setDefaultPaymentDetail = asyncHandler(async (req, res) => {
    const { userId, paymentDetailId } = req.body;

    await PaymentDetail.updateMany(
      { userId, isDefault: true },
      { $set: { isDefault: false } }
    );

    const updated = await PaymentDetail.findOneAndUpdate(
      { userId, paymentDetailId: Number(paymentDetailId) },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!updated) throw new ApiError(404, "Payment detail not found");

    return res.status(200).json(new ApiResponse(200, updated, "Default payment detail set successfully"));
});

export { 
    readPaymentDetail, 
    addPaymentDetail, 
    removePaymentDetail, 
    getPaymentDetailById, 
    setDefaultPaymentDetail 
};
