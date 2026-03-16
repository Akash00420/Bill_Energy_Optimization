// // models/Bill.js
// /*const mongoose = require('mongoose');

// const billSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   billingPeriod: { type: String },          
//   uploadDate: { type: Date, default: Date.now },
//   pdfPath: { type: String },
//   consumerNumber: String,
//   totalAmount: Number,
//   unitsConsumed: Number,
//   billDate: Date,
//   dueDate: Date,
//   tariffCategory: String,                   
//   rawText: String,                          
//   analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' },
// }, { timestamps: true });

// module.exports = mongoose.model('Bill', billSchema);*/


// const mongoose = require("mongoose");

// const billSchema = new mongoose.Schema(
//   {
//     consumerNumber: {
//       type: String,
//       required: [true, "Consumer number is required"],
//       trim: true,
//     },

//     customerId: {
//       type: String,
//       trim: true,
//     },

//     customerName: {
//       type: String,
//       required: [true, "Customer name is required"],
//       trim: true,
//     },

//     address: {
//       type: String,
//       trim: true,
//     },

//     consumerType: {
//       type: String,
//       enum: ["Domestic", "Commercial", "Industrial"],
//       default: "Domestic",
//     },

//     billMonth: {
//       type: String, // Example: "09/2023"
//       required: [true, "Bill month is required"],
//     },

//     billDate: {
//       type: Date,
//       required: true,
//     },

//     dueDate: {
//       type: Date,
//       required: [true, "Due date is required"],
//     },

//     unitsBilled: {
//       type: Number,
//       required: [true, "Units billed is required"],
//       min: 0,
//     },

//     currentReadingDate: {
//       type: Date,
//     },

//     previousReadingDate: {
//       type: Date,
//     },

//     energyCharges: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     fixedDemandCharges: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     govtDuty: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     meterRent: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     adjustments: {
//       type: Number,
//       default: 0,
//     },

//     grossAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     rebate: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     netAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Paid", "Overdue"],
//       default: "Pending",
//     },

//     paymentMode: {
//       type: String,
//       enum: ["UPI", "Wallet", "NetBanking", "Cash", "Card"],
//     },

//     lastPaymentDate: {
//       type: Date,
//     },

//     loadKVA: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     securityDeposit: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );


// // 🔹 Virtual Field: Cost Per Unit
// billSchema.virtual("costPerUnit").get(function () {
//   if (this.unitsBilled === 0) return 0;
//   return (this.energyCharges / this.unitsBilled).toFixed(2);
// });


// // 🔹 Auto Update Payment Status Before Save
// billSchema.pre("save", function (next) {
//   if (this.netAmount > 0 && new Date() > this.dueDate && this.paymentStatus !== "Paid") {
//     this.paymentStatus = "Overdue";
//   }
//   next();
// });


// module.exports = mongoose.model("Bill", billSchema);


// models/billModel/billModel.js

const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    // ✅ ADD THIS FIELD
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    consumerNumber: {
      type: String,
      required: [true, "Consumer number is required"],
      trim: true,
    },
    customerId: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    consumerType: {
      type: String,
      enum: ["Domestic", "Commercial", "Industrial"],
      default: "Domestic",
    },
    billMonth: {
      type: String,
      required: [true, "Bill month is required"],
    },
    billDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    unitsBilled: {
      type: Number,
      required: [true, "Units billed is required"],
      min: 0,
    },
    currentReadingDate: { type: Date },
    previousReadingDate: { type: Date },
    energyCharges: { type: Number, default: 0, min: 0 },
    fixedDemandCharges: { type: Number, default: 0, min: 0 },
    govtDuty: { type: Number, default: 0, min: 0 },
    meterRent: { type: Number, default: 0, min: 0 },
    adjustments: { type: Number, default: 0 },
    grossAmount: { type: Number, required: true, min: 0 },
    rebate: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },
    paymentMode: {
      type: String,
      enum: ["UPI", "Wallet", "NetBanking", "Cash", "Card"],
    },
    lastPaymentDate: { type: Date },
    loadKVA: { type: Number, default: 0, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

billSchema.virtual("costPerUnit").get(function () {
  if (!this.unitsBilled) return 0;
  return this.energyCharges / this.unitsBilled;
});

billSchema.pre("save", function () {
  if (
    this.netAmount > 0 &&
    new Date() > this.dueDate &&
    this.paymentStatus !== "Paid"
  ) {
    this.paymentStatus = "Overdue";
  }
});

module.exports = mongoose.model("Bill", billSchema);