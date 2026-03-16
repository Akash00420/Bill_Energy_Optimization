import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { uploadBill, clearError } from "../Reducer/BillSlice";
import "../assets/custom.css";

const initialForm = {
  consumerNumber: "",
  customerName: "",
  address: "",
  consumerType: "Domestic",
  billMonth: "",
  billDate: "",
  dueDate: "",
  unitsBilled: "",
  energyCharges: "",
  fixedDemandCharges: "",
  govtDuty: "",
  meterRent: "",
  adjustments: "",
  grossAmount: "",
  rebate: "",
  netAmount: "",
  loadKVA: "",
  securityDeposit: "",
};

const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconReceipt = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const UploadBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.bill);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => { dispatch(clearError()); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const saved =
    (parseFloat(form.grossAmount) || 0) - (parseFloat(form.netAmount) || 0);
  const ratePerUnit =
    form.unitsBilled > 0 && form.energyCharges > 0
      ? (parseFloat(form.energyCharges) / parseFloat(form.unitsBilled)).toFixed(2)
      : "0.00";

  const validate = () => {
    const required = [
      "consumerNumber", "customerName", "billMonth", "billDate",
      "dueDate", "unitsBilled", "grossAmount", "netAmount",
    ];
    for (let f of required) {
      if (!form[f]) {
        setFormError(`Please fill in: ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const result = await dispatch(uploadBill(form));
    if (uploadBill.fulfilled.match(result)) navigate("/dashboard"); // ✅ go to dashboard after upload
  };

  return (
    <div className="ub-page">
      <div className="ub-wrap">

        <div className="ub-page-header">
          <h1>Add Electricity Bill</h1>
          <p>Keep track of your energy consumption and optimize your savings.</p>
        </div>

        {(error || formError) && (
          <div className="ub-error">❌ {formError || error}</div>
        )}

        {/* Card 1: Consumer Details */}
        <div className="ub-card">
          <div className="ub-card-header">
            <IconUser />
            <h3>Consumer Details</h3>
          </div>
          <div className="ub-grid2">
            <div className="ub-field">
              <label>Consumer Number <span className="ub-req">*</span></label>
              <input name="consumerNumber" value={form.consumerNumber} onChange={handleChange} placeholder="e.g. 12000826491" />
            </div>
            <div className="ub-field">
              <label>Customer Name <span className="ub-req">*</span></label>
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Full name on bill" />
            </div>
            <div className="ub-field">
              <label>Consumer Type</label>
              <select name="consumerType" value={form.consumerType} onChange={handleChange}>
                <option value="Domestic">Domestic</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
            <div className="ub-field">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address on bill" />
            </div>
          </div>
        </div>

        {/* Card 2: Bill Period & Usage */}
        <div className="ub-card">
          <div className="ub-card-header">
            <IconCalendar />
            <h3>Bill Period &amp; Usage</h3>
          </div>
          <div className="ub-grid3">
            <div className="ub-field">
              <label>Bill Month <span className="ub-req">*</span></label>
              <input name="billMonth" value={form.billMonth} onChange={handleChange} placeholder="MM/YYYY" />
            </div>
            <div className="ub-field">
              <label>Bill Date <span className="ub-req">*</span></label>
              <input name="billDate" type="date" value={form.billDate} onChange={handleChange} />
            </div>
            <div className="ub-field">
              <label>Due Date <span className="ub-req">*</span></label>
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
            </div>
          </div>

          <div className="ub-divider"></div>

          <div className="ub-grid3">
            <div className="ub-field">
              <label>Units Billed (kWh) <span className="ub-req">*</span></label>
              <input name="unitsBilled" type="number" value={form.unitsBilled} onChange={handleChange} placeholder="e.g. 36" />
            </div>
            <div className="ub-field">
              <label>Load (KVA)</label>
              <input name="loadKVA" type="number" value={form.loadKVA} onChange={handleChange} placeholder="e.g. 0.4" />
            </div>
            <div className="ub-field">
              <label>Security Deposit (₹)</label>
              <div className="ub-prefix">
                <input name="securityDeposit" type="number" value={form.securityDeposit} onChange={handleChange} placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Charges Breakdown */}
        <div className="ub-card">
          <div className="ub-card-header">
            <IconReceipt />
            <h3>Charges Breakdown</h3>
          </div>
          <div className="ub-grid2">
            <div className="ub-field">
              <label>Energy Charges (₹)</label>
              <div className="ub-prefix">
                <input name="energyCharges" type="number" value={form.energyCharges} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="ub-field">
              <label>Fixed / Demand Charges (₹)</label>
              <div className="ub-prefix">
                <input name="fixedDemandCharges" type="number" value={form.fixedDemandCharges} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="ub-field">
              <label>Govt Duty (₹)</label>
              <div className="ub-prefix">
                <input name="govtDuty" type="number" value={form.govtDuty} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="ub-field">
              <label>Meter Rent (₹)</label>
              <div className="ub-prefix">
                <input name="meterRent" type="number" value={form.meterRent} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="ub-field">
              <label>Adjustments (₹)</label>
              <div className="ub-prefix">
                <input name="adjustments" type="number" value={form.adjustments} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="ub-field">
              <label>Rebate (₹)</label>
              <div className="ub-prefix">
                <input name="rebate" type="number" value={form.rebate} onChange={handleChange} placeholder="0" />
              </div>
            </div>
          </div>

          <div className="ub-divider"></div>

          <div className="ub-grid2">
            <div className="ub-field">
              <label>Gross Amount (₹) <span className="ub-req">*</span></label>
              <div className="ub-prefix">
                <input name="grossAmount" type="number" value={form.grossAmount} onChange={handleChange} placeholder="0" className="ub-big-input" />
              </div>
            </div>
            <div className="ub-field">
              <label>Net Amount Payable (₹) <span className="ub-req">*</span></label>
              <div className="ub-prefix">
                <input name="netAmount" type="number" value={form.netAmount} onChange={handleChange} placeholder="0" className="ub-big-input" />
              </div>
            </div>
          </div>

          <div className="ub-summary-bar">
            <div className="ub-s-card">
              <div className="ub-s-label">Total Charges</div>
              <div className="ub-s-val">₹{parseFloat(form.grossAmount || 0).toLocaleString("en-IN")}</div>
            </div>
            <div className="ub-s-card">
              <div className="ub-s-label">Payable</div>
              <div className="ub-s-val">₹{parseFloat(form.netAmount || 0).toLocaleString("en-IN")}</div>
            </div>
            <div className="ub-s-card green">
              <div className="ub-s-label green">You Saved</div>
              <div className="ub-s-val green">₹{saved.toLocaleString("en-IN")}</div>
            </div>
            <div className="ub-s-card amber">
              <div className="ub-s-label amber">Rate / Unit</div>
              <div className="ub-s-val amber">₹{ratePerUnit}</div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button className="ub-submit" onClick={handleSubmit} disabled={loading}>
          {loading
            ? "⏳ Saving your bill..."
            : <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ marginRight: "8px", verticalAlign: "middle" }}>
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span style={{ verticalAlign: "middle" }}>Analyse My Bill</span>
              </>
          }
        </button>

      </div>
    </div>
  );
};

export default UploadBill;