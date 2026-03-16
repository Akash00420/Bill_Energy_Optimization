const express = require("express");
const router = express.Router();
const Bill = require("../../models/billModel/billModel");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

router.post("/upload-bill", protect, async (req, res) => {
  try {
    const {
      consumerNumber, customerName, address, consumerType,
      billMonth, billDate, dueDate, unitsBilled, energyCharges,
      fixedDemandCharges, govtDuty, meterRent, adjustments,
      grossAmount, rebate, netAmount, loadKVA, securityDeposit,
    } = req.body;

    if (!consumerNumber || !customerName) {
      return res.status(400).json({ success: false, message: "Consumer number and name are required" });
    }

    const newBill = new Bill({
      userId:             req.user.id,   // ✅ from JWT token
      consumerNumber,
      customerName,
      address:            address || "",
      consumerType:       consumerType || "Domestic",
      billMonth,
      billDate:           new Date(billDate),
      dueDate:            new Date(dueDate),
      unitsBilled:        parseFloat(unitsBilled) || 0,
      energyCharges:      parseFloat(energyCharges) || 0,
      fixedDemandCharges: parseFloat(fixedDemandCharges) || 0,
      govtDuty:           parseFloat(govtDuty) || 0,
      meterRent:          parseFloat(meterRent) || 0,
      adjustments:        parseFloat(adjustments) || 0,
      grossAmount:        parseFloat(grossAmount) || 0,
      rebate:             parseFloat(rebate) || 0,
      netAmount:          parseFloat(netAmount) || 0,
      loadKVA:            parseFloat(loadKVA) || 0,
      securityDeposit:    parseFloat(securityDeposit) || 0,
      filePath:           "manual-entry",
    });

    const savedBill = await newBill.save();

    res.status(200).json({
      success: true,
      message: "Bill saved successfully",
      billId: savedBill._id,
      data: savedBill,
    });

  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;