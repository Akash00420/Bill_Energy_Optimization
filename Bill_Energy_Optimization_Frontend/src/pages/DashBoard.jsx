import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import { getAllBills } from "../Reducer/BillSlice";
import { useNavigate } from "react-router-dom";
import DownloadReport from "./DownloadReport";

/* ── Donut Chart ── */
const Donut = ({ percent, color, label, value }) => {
  const r = 36, c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="#f0f4f8" strokeWidth="9" />
          <circle
            cx="45" cy="45" r={r} fill="none"
            stroke={color} strokeWidth="9"
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 16, color: "#0f172a"
        }}>{percent}%</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>₹{value?.toLocaleString("en-IN")}</div>
    </div>
  );
};

/* ── Alert Card ── */
const Alert = ({ type, text }) => {
  const styles = {
    error:   { bg: "#fff0f0", border: "#fca5a5", icon: "!", iconBg: "#fee2e2", iconColor: "#dc2626" },
    warning: { bg: "#fffbeb", border: "#fcd34d", icon: "◷", iconBg: "#fef3c7", iconColor: "#d97706" },
    success: { bg: "#f0fdf4", border: "#86efac", icon: "ℹ", iconBg: "#dcfce7", iconColor: "#16a34a" },
  };
  const s = styles[type];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      background: s.bg, border: `1.5px solid ${s.border}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 10
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: s.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, color: s.iconColor, fontSize: 14, flexShrink: 0
      }}>{s.icon}</div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a202c", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills, loading, error } = useSelector((state) => state.bill);

  useEffect(() => { dispatch(getAllBills()); }, [dispatch]);

  const data = bills && bills.length > 0 ? bills[bills.length - 1] : null;

  const netAmount     = data?.netAmount || 0;
  const grossAmount   = data?.grossAmount || 0;
  const unitsBilled   = data?.unitsBilled || 0;
  const energyCharges = data?.energyCharges || 0;
  const fixedCharges  = data?.fixedDemandCharges || 0;
  const govtDuty      = data?.govtDuty || 0;
  const meterRent     = data?.meterRent || 0;
  const rebate        = data?.rebate || 0;
  const saved         = grossAmount - netAmount;
  const yearlySavings = saved * 12;
  const costPerUnit   = unitsBilled > 0 ? (energyCharges / unitsBilled).toFixed(2) : 0;
  const total         = energyCharges + fixedCharges + govtDuty + meterRent || 1;
  const energyPct     = Math.round((energyCharges / total) * 100);
  const fixedPct      = Math.round((fixedCharges / total) * 100);
  const govtPct       = Math.round((govtDuty / total) * 100);
  const taxPct        = Math.round((meterRent / total) * 100);

  /* ── Smart Alerts ── */
  const alerts = [];
  if (data?.paymentStatus === "Overdue")
    alerts.push({ type: "error",   text: "Your bill is overdue. Pay immediately to avoid disconnection." });
  if (unitsBilled > 300)
    alerts.push({ type: "warning", text: "High load detected between 6 PM – 10 PM. Consider shifting loads." });
  if (data?.meterRent > 0)
    alerts.push({ type: "success", text: "Consider buying your own meter to avoid service rental charges." });
  if (data?.consumerType === "Domestic" && unitsBilled > 200)
    alerts.push({ type: "warning", text: "Set AC temperature to 24°C to reduce energy consumption by up to 18%." });
  if (energyCharges > 1000)
    alerts.push({ type: "success", text: "Switch to LED bulbs and inverter ACs to cut energy charges." });
  if (alerts.length === 0)
    alerts.push({ type: "success", text: "Your usage looks healthy! Keep maintaining good energy habits." });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 57px)" }}>
      <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTop: "4px solid #22c55e", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!data) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 57px)", textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>📂</div>
      <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>No Bills Found</h3>
      <p style={{ color: "#94a3b8", marginBottom: 32 }}>Upload your first electricity bill to get insights.</p>
      <button onClick={() => navigate("/upload")} style={{
        background: "#22c55e", color: "#fff", padding: "16px 40px",
        border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer"
      }}>⚡ Upload Your First Bill</button>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .kpi-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .btn-hover:hover { opacity: 0.88; transform: translateY(-1px); }
        .row-hover:hover { background: #f8fafc; }
        .analyse-hover:hover { background: #22c55e !important; color: #fff !important; }
        .syne { font-family: 'DM Sans', system-ui, -apple-system, sans-serif !important; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 28px 60px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, animation: "fadeUp 0.5s ease both" }}>
          <div>
            <h1 style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", fontSize: 42, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-1px" }}>
              Dashboard
            </h1>
            <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#22c55e" }}>👤</span> Welcome back, <strong style={{ color: "#0f172a" }}>{data.customerName}</strong>
              </span>
              <span style={{ color: "#e2e8f0" }}>|</span>
              <span style={{ fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <span>🏦</span> Account: <strong style={{ color: "#0f172a" }}>{data.consumerNumber}</strong>
              </span>
              <span style={{ color: "#e2e8f0" }}>|</span>
              <span style={{ fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <span>📅</span> Date: <strong style={{ color: "#0f172a" }}>{data.billMonth}</strong>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <DownloadReport data={data} />
            <button className="btn-hover" onClick={() => navigate("/upload")} style={{
              background: "#22c55e", color: "#fff", padding: "11px 22px",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s", boxShadow: "0 4px 16px rgba(34,197,94,0.3)"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
              Upload New Bill
            </button>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28, animation: "fadeUp 0.5s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}>
          {[
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
              iconBg: "#fef3c7",
              label: "UNITS CONSUMED", value: `${unitsBilled} kWh`, badge: `${costPerUnit}/unit`, badgeColor: "#64748b", badgeBg: "#f1f5f9", accent: "#3b82f6"
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
              iconBg: "#dbeafe",
              label: "TOTAL BILL", value: `₹${netAmount.toLocaleString("en-IN")}`, badge: `Gross ₹${grossAmount.toLocaleString("en-IN")}`, badgeColor: "#d97706", badgeBg: "#fef3c7", accent: "#22c55e"
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><text x="4" y="19" fontSize="18" fontWeight="bold" stroke="none" fill="#22c55e">₹</text></svg>,
              iconBg: "#dcfce7",
              label: "REBATE SAVINGS", value: `₹${saved.toLocaleString("en-IN")}`, badge: `+${Math.round((saved/(grossAmount||1))*100)}% saved`, badgeColor: "#16a34a", badgeBg: "#dcfce7", accent: "#22c55e"
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
              iconBg: "#ede9fe",
              label: "YEARLY PROJECTION", value: `₹${yearlySavings.toLocaleString("en-IN")}`, badge: "Based on this bill", badgeColor: "#16a34a", badgeBg: "#dcfce7", accent: "#22c55e"
            },
          ].map((k, i) => (
            <div key={i} className="kpi-hover" style={{
              background: "#fff", borderRadius: 16, padding: "22px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s",
              borderTop: `3px solid ${k.accent}`
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: k.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{k.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 10, letterSpacing: "-0.5px" }}>{k.value}</div>
              <span style={{ background: k.badgeBg, color: k.badgeColor, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>{k.badge}</span>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 20, animation: "fadeUp 0.5s 0.2s ease both", opacity: 0, animationFillMode: "forwards" }}>

          {/* Bill Summary */}
          <div style={{ background: "#0f172a", borderRadius: 20, padding: "28px 32px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>Bill Summary</h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Detailed Expense View</p>
              </div>
              <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
            </div>
            {[
              ["CONSUMER NUMBER", data.consumerNumber, "RATE PER UNIT", `₹${costPerUnit} / kWh`],
              ["BILL MONTH", data.billMonth, "DUE DATE", data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-IN") : "N/A"],
              ["ENERGY CHARGES", `₹${energyCharges.toLocaleString("en-IN")}`, "FIXED CHARGES", `₹${fixedCharges.toLocaleString("en-IN")}`],
              ["GOVERNMENT DUTY", `₹${govtDuty.toLocaleString("en-IN")}`, "OTHER TAX", `₹${meterRent.toLocaleString("en-IN")}`],
            ].map(([l1, v1, l2, v2], i) => (
              <div key={i} className="row-hover" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 16, padding: "14px 0",
                borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
                borderRadius: 8, transition: "background 0.15s"
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{l1}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{v1}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{l2}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{v2}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Projected Savings */}
          <div style={{ background: "#22c55e", borderRadius: 20, padding: "28px 28px", color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: 20, right: 20, width: 70, height: 70, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>⚡</div>
            <h3 style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", fontSize: 16, fontWeight: 800, margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Projected Savings</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, fontWeight: 500 }}>
              <span style={{ opacity: 0.85 }}>Gross Bill</span>
              <span style={{ textDecoration: "line-through", opacity: 0.7 }}>₹{grossAmount.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
              <span style={{ opacity: 0.85 }}>Rebate Applied</span>
              <span>₹{rebate.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.25)", marginBottom: 16 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.85 }}>NET AMOUNT</span>
              <span style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>₹{netAmount.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 11, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div>
                EFFICIENCY WINS
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>₹{yearlySavings.toLocaleString("en-IN")}</div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>YEARLY SAVINGS</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>₹{saved.toLocaleString("en-IN")}</div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>MONTHLY AVG</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bill Breakdown + Smart Insights ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 20, animation: "fadeUp 0.5s 0.3s ease both", opacity: 0, animationFillMode: "forwards" }}>

          {/* Bill Breakdown — Big Donut + Bars */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Bill Breakdown</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Current billing cycle analysis</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 40 }}>

              {/* Big Donut */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {/* bg track */}
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                  {/* energy — green */}
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#22c55e" strokeWidth="18"
                    strokeDasharray={`${(energyPct/100)*376.99} 376.99`}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                    style={{ transition: "stroke-dasharray 1s ease" }} />
                  {/* fixed — blue */}
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#3b82f6" strokeWidth="18"
                    strokeDasharray={`${(fixedPct/100)*376.99} 376.99`}
                    strokeDashoffset={`-${(energyPct/100)*376.99}`}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                    style={{ transition: "all 1s ease" }} />
                  {/* govt — orange */}
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" strokeWidth="18"
                    strokeDasharray={`${(govtPct/100)*376.99} 376.99`}
                    strokeDashoffset={`-${((energyPct+fixedPct)/100)*376.99}`}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                    style={{ transition: "all 1s ease" }} />
                  {/* tax — gray */}
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#cbd5e1" strokeWidth="18"
                    strokeDasharray={`${(taxPct/100)*376.99} 376.99`}
                    strokeDashoffset={`-${((energyPct+fixedPct+govtPct)/100)*376.99}`}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                    style={{ transition: "all 1s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>₹{netAmount.toLocaleString("en-IN")}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Due</div>
                </div>
              </div>

              {/* Legend + Bars */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { label: "Energy Usage",      value: energyCharges, pct: energyPct, color: "#22c55e" },
                  { label: "Fixed Service Fee",  value: fixedCharges,  pct: fixedPct,  color: "#3b82f6" },
                  { label: "Taxes & Levies",     value: govtDuty + meterRent, pct: govtPct + taxPct, color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>₹{item.value.toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ height: 7, background: "#f1f5f9", borderRadius: 100 }}>
                      <div style={{ height: 7, borderRadius: 100, background: item.color, width: `${item.pct}%`, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Insight Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Eco Saving Insight */}
            <div style={{ background: "#f0fdf9", border: "1.5px solid #a7f3d0", borderRadius: 20, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, background: "#22c55e", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Eco-Saving Insight</span>
              </div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: "0 0 16px" }}>
                Reducing AC usage during peak hours (2PM–6PM) could save you <strong style={{ color: "#16a34a" }}>₹{Math.round(saved * 0.15).toLocaleString("en-IN")}/mo.</strong>
              </p>
              <button style={{ width: "100%", background: "#22c55e", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                onMouseOver={e => e.target.style.background="#16a34a"}
                onMouseOut={e => e.target.style.background="#22c55e"}>
                View Saving Tips
              </button>
            </div>

            {/* Appliance Alert */}
            <div style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 20, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, background: "#fee2e2", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  {data?.paymentStatus === "Overdue" ? "Payment Alert" : "Usage Alert"}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: "0 0 16px" }}>
                {data?.paymentStatus === "Overdue"
                  ? "Your bill is overdue. Pay immediately to avoid disconnection and late fees."
                  : unitsBilled > 200
                    ? "High consumption detected. Consider shifting heavy loads to off-peak hours."
                    : "Your energy usage is within normal range. Keep maintaining good habits."}
              </p>
              <button style={{ width: "100%", background: "#fff", color: "#dc2626", border: "1.5px solid #fecaca", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={e => { e.target.style.background="#fee2e2"; }}
                onMouseOut={e => { e.target.style.background="#fff"; }}>
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* ── Payment Status ── */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20, animation: "fadeUp 0.5s 0.4s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <h3 style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 20px", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>Payment Info</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
            {[
              { label: "Status", value: data.paymentStatus, color: data.paymentStatus === "Paid" ? "#16a34a" : data.paymentStatus === "Overdue" ? "#dc2626" : "#d97706" },
              { label: "Consumer Type", value: data.consumerType },
              ...(data.paymentMode ? [{ label: "Payment Mode", value: data.paymentMode }] : []),
              ...(data.securityDeposit > 0 ? [{ label: "Security Deposit", value: `₹${data.securityDeposit}` }] : []),
            ].map((item, i) => (
              <div key={i} style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.color || "#0f172a" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Billing History ── */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20, animation: "fadeUp 0.5s 0.5s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Recent Billing History</h3>
            </div>
            <button style={{ background: "none", border: "none", color: "#22c55e", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              Download All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["BILLING PERIOD", "AMOUNT", "USAGE", "STATUS", "ACTION"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, i) => (
                  <tr key={bill._id} style={{ borderBottom: i < bills.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <td style={{ padding: "20px 16px" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{bill.billMonth}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>INV-{bill._id?.slice(-5)?.toUpperCase()}</div>
                    </td>
                    <td style={{ padding: "20px 16px", fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                      ₹{(bill.netAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "20px 16px", fontSize: 14, color: "#64748b" }}>
                      {bill.unitsBilled} kWh
                    </td>
                    <td style={{ padding: "20px 16px" }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700, padding: "5px 14px", borderRadius: 100,
                        background: bill.paymentStatus === "Paid" ? "#dcfce7" : bill.paymentStatus === "Overdue" ? "#fee2e2" : "#fef9c3",
                        color: bill.paymentStatus === "Paid" ? "#16a34a" : bill.paymentStatus === "Overdue" ? "#dc2626" : "#ca8a04",
                      }}>{bill.paymentStatus}</span>
                    </td>
                    <td style={{ padding: "20px 16px" }}>
                      {bill.paymentStatus === "Pending" || bill.paymentStatus === "Overdue" ? (
                        <button onClick={() => navigate(`/analysis/${bill._id}`)} style={{
                          background: "none", border: "none", color: "#22c55e",
                          fontSize: 14, fontWeight: 700, cursor: "pointer"
                        }}>Pay Now</button>
                      ) : (
                        <button onClick={() => navigate(`/analysis/${bill._id}`)} style={{
                          background: "none", border: "none", cursor: "pointer", padding: 4
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: 20, paddingTop: 28, borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>myEnergy</span>
            </div>
            <div style={{ display: "flex", gap: 32 }}>
              {["Privacy Policy", "Terms of Service", "Support"].map(l => (
                <span key={l} style={{ fontSize: 14, color: "#64748b", cursor: "pointer" }}
                  onMouseOver={e => e.target.style.color="#0f172a"}
                  onMouseOut={e => e.target.style.color="#64748b"}>{l}</span>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>© 2025 myEnergy Systems Inc.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;