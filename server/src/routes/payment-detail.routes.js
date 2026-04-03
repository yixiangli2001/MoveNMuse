// Shirley
import express from "express";
import { readPaymentDetail, addPaymentDetail, setDefaultPaymentDetail, removePaymentDetail } from "../controllers/paymentDetail.controller.js";
import { set } from "mongoose";


const router = express.Router();

router.get("/", readPaymentDetail);
router.delete("/:paymentDetailId", removePaymentDetail); 
router.post("/addPaymentDetail", addPaymentDetail)

router.post("/setDefault", setDefaultPaymentDetail);





export default router;
