const Bill = require("../../models/billModel/billModel");
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const scanAndCreateBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    console.log("📁 File received:", req.file.originalname, req.file.mimetype);

    // ✅ works for BOTH diskStorage (path) and memoryStorage (buffer)
    let base64Image;
    if (req.file.buffer) {
      base64Image = req.file.buffer.toString("base64");
      console.log("📦 Using buffer (memoryStorage)");
    } else if (req.file.path) {
      base64Image = fs.readFileSync(req.file.path).toString("base64");
      console.log("💾 Using disk file:", req.file.path);
    } else {
      return res.status(400).json({ success: false, message: "Could not read file" });
    }

    const mimeType = req.file.mimetype;
    console.log("🔍 Sending to Claude Vision...");

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Extract all data from this electricity bill and return ONLY a valid JSON object. No markdown, no backticks, no extra text whatsoever. Use these exact keys:
{
  "consumerNumber": "",
  "customerName": "",
  "address": "",
  "consumerType": "Domestic",
  "billMonth": "",
  "billDate": "",
  "dueDate": "",
  "unitsBilled": 0,
  "energyCharges": 0,
  "fixedDemandCharges": 0,
  "govtDuty": 0,
  "meterRent": 0,
  "adjustments": 0,
  "grossAmount": 0,
  "rebate": 0,
  "netAmount": 0,
  "loadKVA": 0,
  "securityDeposit": 0,
  "paymentStatus": "Pending"
}
Rules:
- billMonth format: MM/YYYY e.g. "11/2025"
- billDate and dueDate format: DD/MM/YYYY e.g. "18/11/2025"
- All amounts must be numbers not strings
- Return ONLY the JSON nothing else`,
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].text.trim();
    console.log("✅ Claude raw response:", rawText);

    let extracted;
    try {
      extracted = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) extracted = JSON.parse(match[0]);
      else throw new Error("Could not parse bill data from Claude response");
    }

    console.log("📊 Extracted:", extracted);

    const parseDate = (str) => {
      if (!str) return new Date();
      const p = str.split("/");
      return p.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`) : new Date(str);
    };

    const newBill = new Bill({
      consumerNumber:     extracted.consumerNumber || "N/A",
      customerName:       extracted.customerName || "N/A",
      address:            extracted.address || "",
      consumerType:       extracted.consumerType || "Domestic",
      billMonth:          extracted.billMonth || "",
      billDate:           parseDate(extracted.billDate),
      dueDate:            parseDate(extracted.dueDate),
      unitsBilled:        parseFloat(extracted.unitsBilled) || 0,
      energyCharges:      parseFloat(extracted.energyCharges) || 0,
      fixedDemandCharges: parseFloat(extracted.fixedDemandCharges) || 0,
      govtDuty:           parseFloat(extracted.govtDuty) || 0,
      meterRent:          parseFloat(extracted.meterRent) || 0,
      adjustments:        parseFloat(extracted.adjustments) || 0,
      grossAmount:        parseFloat(extracted.grossAmount) || 0,
      rebate:             parseFloat(extracted.rebate) || 0,
      netAmount:          parseFloat(extracted.netAmount) || 0,
      loadKVA:            parseFloat(extracted.loadKVA) || 0,
      securityDeposit:    parseFloat(extracted.securityDeposit) || 0,
      paymentStatus:      extracted.paymentStatus || "Pending",
      filePath:           req.file.path || req.file.originalname,
    });

    const savedBill = await newBill.save();
    console.log("✅ Bill saved:", savedBill._id);

    res.status(200).json({
      success: true,
      message: "Bill scanned and saved successfully",
      billId: savedBill._id,
      data: savedBill,
    });

  } catch (error) {
    console.error("❌ Controller error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { scanAndCreateBill };