import React, { useEffect, useMemo, useState } from "react";
import logo from "./assets/trustflow-logo-transparent.png";
import momoLogo from "./assets/momo-logo.png"; // Đặt logo MoMo của bạn tại src/assets/momo-logo.png

const MOMO_LOGO_URL = momoLogo;
const MOCK_USER = {
  id: "894206",
  name: "Nguyễn Văn Donor",
  email: "donor@example.com",
  avatar: "https://i.pravatar.cc/150?img=11",
  totalDonated: 15500000,
  joinedCampaigns: 2,
};


const STORAGE_KEYS = {
  accounts: "trustflow_accounts_v1",
  session: "trustflow_session_v1",
};

const defaultAccount = {
  ...MOCK_USER,
  password: "123456",
  identityVerified: true,
  activityHistory: [],
  transactions: [
    { id:"TX001", amount:500000, campaign:"Cứu trợ Bão Yagi khẩn cấp", date:"10/09/2026 14:30" },
    { id:"TX002", amount:15000000, campaign:"Xây điểm trường Bản Mù", date:"20/05/2026 09:15" },
  ],
  createdCampaigns: [],
  joinedCampaignsList: ["c2", "c3"],
};

function readAccounts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.accounts) || "{}"); }
  catch { return {}; }
}

function writeAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function makeActivity(type, message) {
  return {
    id: "ACT-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    type,
    message,
    date: new Date().toLocaleString("vi-VN"),
  };
}

const initialCampaigns = [
  {
    id: "c1",
    title: "Cứu trợ Bão Yagi khẩn cấp",
    category: "Thảm họa",
    image: "https://images.unsplash.com/photo-1473643033502-d9db915a770a?auto=format&fit=crop&q=80&w=900",
    description: "Hỗ trợ bà con vùng bão lũ khắc phục hậu quả, cung cấp nhu yếu phẩm khẩn cấp. Nguồn tiền được giải ngân theo kế hoạch minh bạch.",
    goal: 500000000,
    raised: 250000000,
    donors: 1542,
    daysLeft: 15,
    status: "ACTIVE",
    trustScore: 98,
    duration: "Khẩn cấp",
    organizer: "Hội Chữ Thập Đỏ VN",
    budgetPlan: [
      { item: "Mì tôm (Thùng Hảo Hảo)", price: 120000, qty: 1000 },
      { item: "Gạo tẻ (Bao 10kg)", price: 180000, qty: 1000 },
    ],
  },
  {
    id: "c2",
    title: "Hỗ trợ thiết bị y tế tuyến huyện",
    category: "Y tế",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80&w=900",
    description: "Mua bổ sung thiết bị y tế thiết yếu cho bệnh viện tuyến huyện.",
    goal: 300000000,
    raised: 172000000,
    donors: 923,
    daysLeft: 31,
    status: "ACTIVE",
    trustScore: 94,
    duration: "Dài hạn",
    organizer: "Nhịp Cầu Yêu Thương",
    budgetPlan: [
      { item: "Máy monitor theo dõi", price: 25000000, qty: 4 },
      { item: "Bộ dụng cụ cấp cứu", price: 5000000, qty: 10 },
    ],
  },
  {
    id: "c3",
    title: "Xây điểm trường Bản Mù",
    category: "Giáo dục",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=900",
    description: "Dự án xây dựng 3 phòng học kiên cố thay thế lớp học tạm bợ cho trẻ em vùng cao.",
    goal: 350000000,
    raised: 120000000,
    donors: 856,
    daysLeft: 60,
    status: "ACTIVE",
    trustScore: 88,
    duration: "Dài hạn",
    organizer: "Dự Án Sức Mạnh 2000",
    budgetPlan: [],
  },
];

const money = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

function Icon({ name, size = 22 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    user: <><circle cx="12" cy="7" r="3.5"/><path d="M5.5 20c.4-4 2.7-6 6.5-6s6.1 2 6.5 6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    heart: <path d="M20.8 8.9c0 5.1-8.8 10.1-8.8 10.1S3.2 14 3.2 8.9A5 5 0 0 1 12 6.1a5 5 0 0 1 8.8 2.8Z"/>,
    shield: <><path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    back: <path d="m15 18-6-6 6-6"/>,
    share: <><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    file: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>,
    edit: <><path d="m4 20 4.5-1 9.7-9.7a2.1 2.1 0 0 0-3-3L6 16z"/><path d="m14 7 3 3"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    warning: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/></>,
    bank: <><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v10M19 6v10M8 9v7M12 9v7M16 9v7"/><path d="M4 19h16"/></>,
    fingerprint: <><path d="M12 11a2 2 0 0 1 2 2v4"/><path d="M9 13a3 3 0 0 1 6 0v5"/><path d="M6 13a6 6 0 0 1 12 0v3"/><path d="M4 13a8 8 0 0 1 16 0v2"/><path d="M8 18v1"/><path d="M12 20v1"/><path d="M16 18v1"/></>,
    idCard: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16c.5-2 1.3-3 2.5-3s2 .9 2.5 3M13 10h5M13 14h5"/></>,
    face: <><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M8.5 14.5c2 2 5 2 7 0"/></>,
    plusCircle: <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
    trash: <><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></>,
    mapPin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    zap: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    unlock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    fileText: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    flag: <><path d="M5 21V4"/><path d="M5 5c4-3 6 3 10 0 1-.8 2.5-.8 4 0v8c-4-3-6 3-10 0"/></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14"/><path d="M17 13h4"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Button({ children, onClick, variant="primary", disabled=false }) {
  return <button disabled={disabled} className={`tf-btn ${variant}`} onClick={onClick}>{children}</button>;
}

function CreateScreen({ draft, setDraft, quoteFile, setQuoteFile, quoteItems, setQuoteItems, onCreate, onBack, notify }) {
  const [step, setStep] = useState(1);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  const totalExpected = quoteItems.reduce(
    (sum, item) => sum + Number(item.supplier || 0) * Number(item.qty || 0),
    0
  );

  const updateDraft = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const addFieldPhoto = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const remaining = Math.max(0, 5 - draft.fieldPhotos.length);
    const previews = files.slice(0, remaining).map((file) => URL.createObjectURL(file));
    setDraft((prev) => ({ ...prev, fieldPhotos: [...prev.fieldPhotos, ...previews].slice(0, 5) }));
  };

  const removeFieldPhoto = (index) => setDraft((prev) => ({
    ...prev,
    fieldPhotos: prev.fieldPhotos.filter((_, i) => i !== index),
  }));

  const updateQuoteItem = (id, key, value) => {
    setQuoteItems((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const addQuoteItem = () => setQuoteItems((prev) => [
    ...prev,
    {
      id: `item-${Date.now()}`,
      code: `ITEM_${String(prev.length + 1).padStart(3, "0")}`,
      name: `Hạng mục ${prev.length + 1}`,
      supplier: 0,
      market: 0,
      qty: 1,
    },
  ]);

  const removeQuoteItem = (id) => setQuoteItems((prev) => prev.filter((item) => item.id !== id));

  const analyzeQuote = () => {
    if (!quoteFile) {
      notify("Hãy upload báo giá trước khi yêu cầu AI phân tích OCR.");
      return false;
    }

    // Frontend hiện tại không đọc nội dung PDF/Excel thật; OCR được mô phỏng bằng dữ liệu động.
    // Nếu người dùng đã thêm/sửa hạng mục thì giữ nguyên. Nếu chưa có dòng nào, tạo một dòng
    // từ chính tên file để người dùng tiếp tục nhập giá/SL trong Bản Dự Toán AI.
    setQuoteItems((prev) => {
      if (prev.length > 0) {
        return prev.map((item, index) => ({
          ...item,
          code: item.code || `ITEM_${String(index + 1).padStart(3, "0")}`,
          name: item.name || `Hạng mục ${index + 1}`,
          supplier: Number(item.supplier || 0),
          market: Number(item.market || 0),
          qty: Math.max(1, Number(item.qty || 1)),
        }));
      }

      const rawName = quoteFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
      return [{
        id: `ocr-${Date.now()}`,
        code: "OCR_001",
        name: rawName || "Hạng mục từ báo giá",
        supplier: 0,
        market: 0,
        qty: 1,
      }];
    });

    setAiAnalyzed(true);
    notify("AI OCR đã phân tích báo giá mô phỏng. Kiểm tra và chỉnh bảng dự toán trước khi lưu.");
    return true;
  };

  const next = () => {
    if (step === 1) {
      if (!draft.title.trim()) return notify("Vui lòng nhập tên quỹ.");
      if (!draft.description.trim()) return notify("Vui lòng nhập mô tả mục tiêu.");
      if (!draft.gps.trim()) return notify("Vui lòng nhập tọa độ GPS.");
      if (!draft.floodLevel.trim()) return notify("Vui lòng nhập mức ngập lụt.");
      if (!draft.priorityHouseholds.trim()) return notify("Vui lòng nhập số hộ ưu tiên.");
      if (!draft.priorityVulnerablePeople.trim()) return notify("Vui lòng nhập số người thuộc nhóm ưu tiên.");
      if (draft.fieldPhotos.length < 3) return notify("Vui lòng tải ít nhất 3 ảnh thực địa.");
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!quoteFile) return notify("Vui lòng upload báo giá.");
      if (!aiAnalyzed) {
        if (analyzeQuote()) setStep(3);
        return;
      }
      setStep(3);
      return;
    }
    onCreate();
  };

  return (
    <div className="screen create-flow-screen">
      <header className="topbar create-topbar">
        <button type="button" onClick={() => (step > 1 ? setStep(step - 1) : onBack())}><Icon name="back" /></button>
        <strong>{step === 1 ? "Tạo quỹ" : step === 2 ? "Upload Báo Giá" : "Bản Dự Toán AI"}</strong>
        <span>{step}/3</span>
      </header>

      <div className="create-progress">
        <span className={step >= 1 ? "done blue-step" : ""} />
        <span className={step >= 2 ? "done green-step" : ""} />
        <span className={step >= 3 ? "done gold-step" : ""} />
      </div>

      {step === 1 && (
        <div className="create-step create-step-one">
          <label className="create-label">TÊN QUỸ QUYÊN GÓP
            <input value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} placeholder="Vd: Cứu trợ khẩn cấp miền Trung..." />
          </label>
          <label className="create-label">MÔ TẢ MỤC TIÊU
            <textarea value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} placeholder="Nhập lý do và hoàn cảnh..." />
          </label>
          <section className="field-report-card">
            <div className="field-report-title"><Icon name="alert" size={19} /><strong>Báo cáo thực địa (Live)</strong></div>
            <div className="field-grid">
              <label>TỌA ĐỘ GPS<input value={draft.gps} onChange={(e) => updateDraft("gps", e.target.value)} placeholder="Vd: 16.04, 108.2" /></label>
              <label>MỨC NGẬP LỤT<input value={draft.floodLevel} onChange={(e) => updateDraft("floodLevel", e.target.value)} placeholder="Vd: 2.5 mét" /></label>
              <label>TÌNH TRẠNG ĐIỆN/NƯỚC<select value={draft.waterElectricity} onChange={(e) => updateDraft("waterElectricity", e.target.value)}><option>Mất hoàn toàn</option><option>Mất một phần</option><option>Hoạt động bình thường</option></select></label>
              <label>SỐ HỘ ƯU TIÊN<input value={draft.priorityHouseholds} onChange={(e) => updateDraft("priorityHouseholds", e.target.value.replace(/\D/g, ""))} placeholder="Vd: 150" /></label>
              <label>TRẺ EM & THAI PHỤ<input value={draft.priorityVulnerablePeople} onChange={(e) => updateDraft("priorityVulnerablePeople", e.target.value.replace(/\D/g, ""))} placeholder="Vd: 120" /></label>
            </div>
          </section>
          <section className="field-photo-section">
            <div className="create-section-title">TẢI ẢNH THỰC ĐỊA (3-5 ẢNH)</div>
            <div className="photo-grid">
              {draft.fieldPhotos.length < 5 && <label className="photo-add-card"><Icon name="camera" size={25} /><span>Thêm ảnh</span><input type="file" accept="image/*" multiple onChange={addFieldPhoto} /></label>}
              {draft.fieldPhotos.map((src, index) => <div className="photo-preview" key={`${src}-${index}`}><img src={src} alt={`Thực địa ${index + 1}`} /><button type="button" onClick={() => removeFieldPhoto(index)}>×</button></div>)}
            </div>
          </section>
          <Button
              onClick={next}
              disabled={
                !draft.title.trim() ||
                !draft.description.trim() ||
                !draft.gps.trim() ||
                !draft.floodLevel.trim() ||
                !draft.priorityHouseholds.trim() ||
                !draft.priorityVulnerablePeople.trim() ||
                draft.fieldPhotos.length < 3
              }
            >
              Tiếp tục · Upload báo giá
            </Button>
        </div>
      )}

      {step === 2 && (
        <div className="create-step create-step-two">
          <section className="quote-upload-card">
            <div className="quote-icon"><Icon name="file" size={40} /></div>
            <h2>Tải lên Báo giá Đại lý (Có mộc đỏ)</h2>
            <p>Hệ thống AI sẽ bóc tách danh mục hàng hóa, đối chiếu <b>Giá Sỉ</b> bạn cung cấp với <b>Giá Trần Bán Lẻ</b> trên thị trường.</p>
            <label className="quote-dropzone">
              <Icon name="upload" size={34} />
              <span>{quoteFile ? quoteFile.name : "Tải file Báo Giá Excel/PDF"}</span>
              <input type="file" accept=".pdf,.xls,.xlsx,.csv,image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setQuoteFile(file); setAiAnalyzed(false); } }} />
            </label>
            {quoteFile && <div className="quote-file-chip"><Icon name="check" size={16} /><span>{quoteFile.name}</span><button type="button" onClick={() => { setQuoteFile(null); setAiAnalyzed(false); }}>×</button></div>}
          </section>
          <Button onClick={next}><Icon name="shield" size={19} />{aiAnalyzed ? "Xem Bản Dự Toán AI" : "Yêu cầu AI Phân tích OCR"}</Button>
        </div>
      )}

      {step === 3 && (
        <div className="create-step create-step-three">
          <section className="budget-success-card">
            <div className="budget-success-icon"><Icon name="check" size={23} /></div>
            <div><strong>Bản Dự Toán Cân Bằng</strong><p>AI đã phân tích. Bạn có thể điều chỉnh số lượng (SL) dựa vào thống kê thực tế.</p></div>
          </section>
          <section className="budget-card">
            <div className="budget-heading"><span>MỤC TIÊU DỰ KIẾN</span><strong>{money(totalExpected)}</strong></div>
            <div className="budget-table-head"><span>MÃ & ITEM</span><span>GIÁ SỈ (SỬA)</span><span>TRẦN</span><span>SL (SỬA)</span><span /></div>
            <div className="budget-rows">
              {quoteItems.map((item) => <div className="budget-row" key={item.id}>
                <div className="budget-item-info"><small>{item.code}</small><input value={item.name} onChange={(e) => updateQuoteItem(item.id, "name", e.target.value)} /></div>
                <input className="number-edit" value={item.supplier} onChange={(e) => updateQuoteItem(item.id, "supplier", e.target.value.replace(/\D/g, ""))} />
                <input className="market-edit" value={item.market} onChange={(e) => updateQuoteItem(item.id, "market", e.target.value.replace(/\D/g, ""))} placeholder="—" />
                <input className="qty-edit" value={item.qty} onChange={(e) => updateQuoteItem(item.id, "qty", e.target.value.replace(/\D/g, ""))} />
                <button className="delete-item" type="button" title="Xóa dòng" onClick={() => removeQuoteItem(item.id)}><Icon name="trash" size={15} /></button>
              </div>)}
            </div>
            <button className="add-budget-item" type="button" onClick={addQuoteItem}><Icon name="plusCircle" size={18} />Thêm hạng mục</button>
          </section>
          <Button onClick={onCreate}>Lưu Nháp & Cung Cấp Pháp Lý</Button>
        </div>
      )}
    </div>
  );
}




function Auth({ onLogin, onRegister, onFingerprint, notify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const submit = () => {
    if (!email.trim()) return notify("Vui lòng nhập email.");
    if (!password) return notify("Vui lòng nhập mật khẩu.");
    onLogin(email, password, remember);
  };

  return (
    <main className="login-page">
      <div className="ambient ambient-blue" />
      <div className="ambient ambient-green" />
      <section className="login-card">
        <div className="brand">
          <img src={logo} className="logo-image" alt="TrustFlow AI" />
          <div className="brand-copy">
            <div className="brand-name"><span className="brand-trust">TRUST</span><span className="brand-flow">FLOW</span><span className="brand-ai">AI</span></div>
            <div className="brand-subtitle">OPEN BANKING & OCR AUDIT</div>
          </div>
        </div>
        <div className="welcome">
          <h1>Chào mừng trở lại</h1>
          <div className="trust-pill"><span className="blue">MINH BẠCH</span><b>•</b><span className="green">NIỀM TIN</span><b>•</b><span className="gold">LAN TỎA</span></div>
        </div>

        <div className="login-form">
          <label className="register-field"><span>EMAIL</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="you@example.com" autoComplete="email" /></label>
          <label className="register-field"><span>MẬT KHẨU</span>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Nhập mật khẩu" autoComplete="current-password" style={{ paddingRight: 82, width: "100%", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", border:0, background:"transparent", cursor:"pointer" }}>{showPassword ? "Ẩn" : "Hiện"}</button>
            </div>
          </label>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Ghi nhớ đăng nhập trên thiết bị này</label>
          <Button onClick={submit}><Icon name="user" />Đăng nhập bằng Email</Button>
        </div>

        <div className="actions auth-actions">
          <Button onClick={onRegister} variant="secondary">Đăng ký tài khoản</Button>
          <button className="fingerprint-login-btn" type="button" onClick={onFingerprint}>
            <span className="fingerprint-login-icon"><Icon name="fingerprint" size={29} /></span>
            <span><b>Đăng nhập bằng vân tay</b><small>Xác thực nhanh kiểu VNeID</small></span>
            <span className="fingerprint-arrow">›</span>
          </button>
          <small>Prototype: tài khoản được lưu cục bộ trên trình duyệt.</small>
        </div>
      </section>
    </main>
  );
}

function Register({ onComplete, onBack, notify }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [facePhoto, setFacePhoto] = useState(null);
  const [cccdPhoto, setCccdPhoto] = useState(null);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const nextToVerification = () => {
    if (!form.name.trim()) return notify("Vui lòng nhập họ và tên.");
    if (!form.email.trim()) return notify("Vui lòng nhập email.");
    if (!form.password) return notify("Vui lòng tạo mật khẩu.");
    if (form.password.length < 6) return notify("Mật khẩu mô phỏng cần ít nhất 6 ký tự.");
    if (form.password !== form.confirmPassword) return notify("Mật khẩu xác nhận chưa khớp.");
    setStep(2);
  };

  const pickImage = (setter) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setter({ file, url: URL.createObjectURL(file), name: file.name });
  };

  const finishRegistration = () => {
    if (!facePhoto) return notify("Vui lòng thêm hình ảnh khuôn mặt.");
    if (!cccdPhoto) return notify("Vui lòng thêm ảnh CCCD.");
    const id = String(Math.floor(100000 + Math.random() * 900000));
    onComplete({ ...MOCK_USER, id, name: form.name.trim(), email: normalizeEmail(form.email), password: form.password, avatar: facePhoto.url, totalDonated: 0, joinedCampaigns: 0, identityVerified: true, facePhoto: facePhoto.url, cccdPhoto: cccdPhoto.url });
  };

  return (
    <main className="auth-secondary-page">
      <section className="register-card">
        <header className="register-header">
          <button type="button" onClick={() => step === 1 ? onBack() : setStep(1)} className="register-back"><Icon name="back" size={22} /></button>
          <div><small>TRUSTFLOW AI</small><h1>{step === 1 ? "Tạo tài khoản" : "Xác minh danh tính"}</h1></div>
          <span className="register-step">{step}/2</span>
        </header>
        <div className="register-progress"><span className={step >= 1 ? "active" : ""} /><span className={step >= 2 ? "active" : ""} /></div>

        {step === 1 && (
          <div className="register-form">
            <div className="register-intro"><div className="register-icon"><Icon name="user" size={28} /></div><div><h2>Đăng ký tài khoản</h2><p>Thông tin này được dùng để tạo hồ sơ TrustFlow của bạn.</p></div></div>
            <label className="register-field"><span>HỌ VÀ TÊN</span><input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Nguyễn Văn A" /></label>
            <label className="register-field"><span>EMAIL</span><input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" /></label>
            <label className="register-field"><span>MẬT KHẨU</span><input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Tối thiểu 6 ký tự" /></label>
            <label className="register-field"><span>XÁC NHẬN MẬT KHẨU</span><input type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Nhập lại mật khẩu" /></label>
            <Button onClick={nextToVerification}>Tiếp tục xác minh danh tính</Button>
          </div>
        )}

        {step === 2 && (
          <div className="identity-form">
            <div className="identity-notice"><Icon name="shield" size={25} /><div><strong>Thêm thông tin xác minh</strong><p>Đây là bước mô phỏng. Chưa có kết nối eKYC hoặc cơ sở dữ liệu thật.</p></div></div>
            <label className={`identity-upload ${facePhoto ? "uploaded" : ""}`}>
              <input type="file" accept="image/*" onChange={pickImage(setFacePhoto)} />
              {facePhoto ? <img src={facePhoto.url} alt="Ảnh khuôn mặt" /> : <><span className="identity-upload-icon"><Icon name="face" size={34} /></span><strong>Ảnh khuôn mặt</strong><small>Chọn ảnh rõ mặt từ thiết bị</small></>}
              <span className="identity-upload-badge">{facePhoto ? "Đã thêm" : "Thêm ảnh"}</span>
            </label>
            <label className={`identity-upload id-upload ${cccdPhoto ? "uploaded" : ""}`}>
              <input type="file" accept="image/*" onChange={pickImage(setCccdPhoto)} />
              {cccdPhoto ? <img src={cccdPhoto.url} alt="CCCD" /> : <><span className="identity-upload-icon"><Icon name="idCard" size={34} /></span><strong>Ảnh CCCD</strong><small>Chọn ảnh CCCD từ thiết bị</small></>}
              <span className="identity-upload-badge">{cccdPhoto ? "Đã thêm" : "Thêm ảnh"}</span>
            </label>
            <Button onClick={finishRegistration} disabled={!facePhoto || !cccdPhoto}>Hoàn tất đăng ký</Button>
            <small className="simulation-note">Sau này backend có thể thay bước này bằng eKYC/CCCD thật.</small>
          </div>
        )}
      </section>
    </main>
  );
}

function FingerprintLogin({ onSuccess, onBack }) {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    setSuccess(false);
    window.setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      window.setTimeout(() => onSuccess(), 650);
    }, 1700);
  };

  return (
    <main className="fingerprint-page">
      <section className="fingerprint-card">
        <button className="fingerprint-back" type="button" onClick={onBack}><Icon name="back" size={23} /></button>
        <div className={`fingerprint-ring ${scanning ? "scanning" : ""} ${success ? "verified" : ""}`}><div className="fingerprint-scan-line" /><Icon name="fingerprint" size={96} /></div>
        <div className="fingerprint-copy"><small>TRUSTFLOW AI · XÁC THỰC</small><h1>{success ? "Xác thực thành công" : scanning ? "Đang xác thực..." : "Đăng nhập bằng vân tay"}</h1><p>{success ? "Danh tính đã được xác nhận. Đang mở TrustFlow..." : scanning ? "Giữ ngón tay trên cảm biến mô phỏng." : "Chạm vào nút bên dưới để bắt đầu xác thực sinh trắc học."}</p></div>
        {!success && <button className={`fingerprint-scan-button ${scanning ? "scanning" : ""}`} type="button" onClick={startScan}><Icon name="fingerprint" size={30} />{scanning ? "Đang quét vân tay..." : "Chạm để xác thực"}</button>}
        <div className="fingerprint-security"><Icon name="shield" size={17} /><span>Xác thực sinh trắc học · Mô phỏng frontend</span></div>
      </section>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("default");
  const [donationAmount, setDonationAmount] = useState("");
  const [joined, setJoined] = useState(["c2", "c3"]);
  const [transactions, setTransactions] = useState([]);
  const [created, setCreated] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [toast, setToast] = useState("");

  const [createDraft, setCreateDraft] = useState({
    title: "",
    description: "",
    gps: "",
    floodLevel: "",
    waterElectricity: "Mất hoàn toàn",
    priorityHouseholds: "",
    priorityVulnerablePeople: "",
    fieldPhotos: [],
  });

  const [quoteFile, setQuoteFile] = useState(null);
  // Dữ liệu báo giá chỉ được tạo từ thao tác người dùng/OCR mô phỏng, không cố định 2 dòng mẫu.
  const [quoteItems, setQuoteItems] = useState([]);
  // Minh chứng được lưu riêng theo từng quỹ để tạo nhiều quỹ không bị dùng chung trạng thái.
  const [legalEvidenceByCampaign, setLegalEvidenceByCampaign] = useState({});
  const [evidenceLoading, setEvidenceLoading] = useState(null);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const saveCurrentAccount = (nextUser, overrides = {}) => {
    const accounts = readAccounts();
    const key = normalizeEmail(nextUser.email);
    const current = accounts[key] || {};
    accounts[key] = {
      ...current,
      ...nextUser,
      ...overrides,
      updatedAt: new Date().toISOString(),
    };
    writeAccounts(accounts);
  };

  const updateCampaign = (campaignId, patch) => {
    const applyPatch = (item) => item.id === campaignId ? { ...item, ...patch } : item;
    setCampaigns((prev) => prev.map(applyPatch));
    setCreated((prev) => prev.map(applyPatch));
    setSelected((prev) => prev?.id === campaignId ? { ...prev, ...patch } : prev);

    if (user?.email) {
      const accounts = readAccounts();
      const key = normalizeEmail(user.email);
      const account = accounts[key];
      if (account) {
        const nextCreated = (account.createdCampaigns || []).map(applyPatch);
        accounts[key] = { ...account, createdCampaigns: nextCreated, updatedAt: new Date().toISOString() };
        writeAccounts(accounts);
      }
    }
  };

  const login = (email = MOCK_USER.email, password = MOCK_USER.password || "123456", remember = true) => {
    const key = normalizeEmail(email);
    const accounts = readAccounts();
    if (!accounts[key]) {
      if (key === normalizeEmail(MOCK_USER.email) && password === "123456") {
        accounts[key] = {
          ...defaultAccount,
          email: MOCK_USER.email,
          activityHistory: [makeActivity("login", "Đăng nhập tài khoản")],
        };
        writeAccounts(accounts);
      } else {
        return notify("Tài khoản không tồn tại. Vui lòng đăng ký trước.");
      }
    }
    const account = accounts[key];
    if (account.password !== password) return notify("Email hoặc mật khẩu không đúng.");

    const activity = makeActivity("login", "Đăng nhập tài khoản");
    const updated = { ...account, activityHistory: [activity, ...(account.activityHistory || [])].slice(0, 100) };
    accounts[key] = updated;
    writeAccounts(accounts);
    setUser(updated);
    setTransactions(updated.transactions || []);
    setJoined(updated.joinedCampaignsList || []);
    setCreated(updated.createdCampaigns || []);
    setActivityHistory(updated.activityHistory || []);
    if (remember) localStorage.setItem(STORAGE_KEYS.session, key);
    else localStorage.removeItem(STORAGE_KEYS.session);
    setScreen("dashboard");
  };

  useEffect(() => {
    const key = localStorage.getItem(STORAGE_KEYS.session);
    if (!key) return;
    const account = readAccounts()[key];
    if (!account) return;
    setUser(account);
    setTransactions(account.transactions || []);
    setJoined(account.joinedCampaignsList || []);
    setCreated(account.createdCampaigns || []);
    setActivityHistory(account.activityHistory || []);
    setScreen("dashboard");
  }, []);

  const recordActivity = (type, message, patch = {}) => {
    if (!user?.email) return;
    const activity = makeActivity(type, message);
    const nextHistory = [activity, ...(activityHistory || [])].slice(0, 100);
    const nextUser = { ...user, ...patch, activityHistory: nextHistory };
    setUser(nextUser);
    setActivityHistory(nextHistory);
    saveCurrentAccount(nextUser, patch);
  };

  const logout = () => {
    if (user?.email) {
      const activity = makeActivity("logout", "Đăng xuất tài khoản");
      const nextHistory = [activity, ...(activityHistory || [])].slice(0, 100);
      saveCurrentAccount(user, { activityHistory: nextHistory });
    }
    localStorage.removeItem(STORAGE_KEYS.session);
    setUser(null);
    setTransactions([]);
    setCreated([]);
    setActivityHistory([]);
    setScreen("auth");
  };

  const filtered = useMemo(() => {
    let list = campaigns.filter(c => c.status === "ACTIVE");
    if (category !== "Tất cả") list = list.filter(c => c.category === category);
    if (search.trim()) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    if (sort === "urgency") list.sort((a,b) => a.daysLeft-b.daysLeft);
    if (sort === "trust") list.sort((a,b) => b.trustScore-a.trustScore);
    if (sort === "amount") list.sort((a,b) => b.raised-a.raised);
    return list;
  }, [campaigns, category, search, sort]);

  const openCampaign = (c) => { setSelected(c); setScreen("campaignDetail"); };

  const addDonation = () => {
    const amount = Number(donationAmount);
    if (!amount || amount < 10000) return notify("Số tiền tối thiểu mô phỏng là 10.000đ.");
    setScreen("momoSandbox");
  };

  const finishDonation = () => {
    const amount = Number(donationAmount);
    setCampaigns(prev => prev.map(c => c.id === selected.id
      ? { ...c, raised: c.raised + amount, donors: c.donors + 1 }
      : c
    ));
    const tx = {
      id: "TX" + String(transactions.length + 3).padStart(3,"0"),
      amount,
      campaign: selected.title,
      campaignId: selected.id,
      recipient: selected.organizer || "TrustFlow AI",
      message: `${user?.id || "894206"} ${amount.toLocaleString("vi-VN")} Ủng hộ ${selected.title}`,
      fee: 0,
      total: amount,
      date: new Date().toLocaleString("vi-VN")
    };
    const nextTransactions = [tx, ...transactions];
    const nextJoined = joined.includes(selected.id) ? joined : [...joined, selected.id];
    const nextTotal = Number(user?.totalDonated || 0) + amount;
    setTransactions(nextTransactions);
    setJoined(nextJoined);
    recordActivity("donation", `Đã ủng hộ ${money(amount)} cho "${selected.title}"`, {
      totalDonated: nextTotal,
      joinedCampaigns: nextJoined.length,
      transactions: nextTransactions,
      joinedCampaignsList: nextJoined,
    });
    setDonationAmount("");
    setScreen("transactionResult");
  };

  const createCampaign = () => {
    const totalBudget = quoteItems.reduce(
      (sum, item) => sum + Number(item.supplier || 0) * Number(item.qty || 0),
      0
    );

    const newCamp = {
      id: "draft-" + Date.now(),
      title: createDraft.title || "Chiến dịch mới",
      category: "Cộng đồng",
      image:
        createDraft.fieldPhotos[0] ||
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=900",
      description: createDraft.description || "Bản nháp chiến dịch được tạo trong chế độ mô phỏng.",
      goal: Math.max(totalBudget, 100000000),
      raised: 0,
      donors: 0,
      daysLeft: 60,
      status: "DRAFT",
      trustScore: 0,
      duration: "Đang chờ pháp lý",
      organizer: user?.name || "Người tạo quỹ",
      budgetPlan: quoteItems.map((item) => ({
        item: item.name,
        price: Number(item.supplier || 0),
        qty: Number(item.qty || 0),
      })),
      fieldReport: {
        gps: createDraft.gps,
        floodLevel: createDraft.floodLevel,
        waterElectricity: createDraft.waterElectricity,
        priorityHouseholds: createDraft.priorityHouseholds,
        priorityVulnerablePeople: createDraft.priorityVulnerablePeople,
        photos: createDraft.fieldPhotos,
      },
      quoteFile: quoteFile?.name || "",
      legalEvidence: { cccd: "pending", expense: "pending", bank: "pending" },
      legalReady: false,
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    setCreated((prev) => [newCamp, ...prev]);
    recordActivity("campaign", `Đã tạo bản nháp chiến dịch "${newCamp.title}"`, {
      createdCampaigns: [newCamp, ...created],
    });

    setCreateDraft({
      title: "", description: "", gps: "", floodLevel: "",
      waterElectricity: "Mất hoàn toàn", priorityHouseholds: "", priorityVulnerablePeople: "", fieldPhotos: [],
    });
    setQuoteFile(null);
    setQuoteItems([]);
    setLegalEvidenceByCampaign((prev) => ({
      ...prev,
      [newCamp.id]: { cccd: "pending", expense: "pending", bank: "pending" },
    }));

    notify("Đã lưu nháp. Hãy bổ sung minh chứng pháp lý để mở khóa quỹ.");
    setScreen("profileCreated");
  };


  if (screen === "auth") return <Auth onLogin={login} onRegister={() => setScreen("register")} onFingerprint={() => setScreen("fingerprint")} notify={notify} />;
  if (screen === "register") return <Register onComplete={(newUser) => {
    const key = normalizeEmail(newUser.email);
    const accounts = readAccounts();
    if (accounts[key]) return notify("Email này đã được đăng ký. Hãy đăng nhập.");
    const account = {
      ...newUser,
      password: newUser.password,
      totalDonated: 0,
      joinedCampaigns: 0,
      joinedCampaignsList: [],
      transactions: [],
      createdCampaigns: [],
      activityHistory: [makeActivity("register", "Tạo tài khoản TrustFlow")],
      createdAt: new Date().toISOString(),
    };
    accounts[key] = account;
    writeAccounts(accounts);
    localStorage.setItem(STORAGE_KEYS.session, key);
    setUser(account);
    setTransactions([]);
    setJoined([]);
    setCreated([]);
    setActivityHistory(account.activityHistory);
    setScreen("dashboard");
  }} onBack={() => setScreen("auth")} notify={notify} />;
  if (screen === "fingerprint") return <FingerprintLogin onSuccess={() => login(user?.email || MOCK_USER.email, readAccounts()[normalizeEmail(user?.email || MOCK_USER.email)]?.password || "123456", true)} onBack={() => setScreen("auth")} />;
  if (screen === "dashboard") return <Dashboard campaigns={filtered} search={search} setSearch={setSearch} category={category} setCategory={setCategory} sort={sort} setSort={setSort} openCampaign={openCampaign} setScreen={setScreen} user={user} />;
  if (screen === "campaignDetail") return <CampaignDetail campaign={campaigns.find(c=>c.id===selected?.id) || selected} joined={joined.includes(selected?.id)} setScreen={setScreen} />;
  if (screen === "donate") return <Donate campaign={selected} amount={donationAmount} setAmount={setDonationAmount} onBack={()=>setScreen("campaignDetail")} onPay={addDonation} />;
  if (screen === "momoSandbox") return <MomoSandbox amount={donationAmount} campaign={selected} user={user} onBack={()=>setScreen("donate")} onSuccess={finishDonation} />;
  if (screen === "transactionResult") return <TransactionResult amount={transactions[0]?.amount} campaign={selected} onHome={()=>setScreen("dashboard")} />;
  if (screen === "createIntro") return <CreateIntro setScreen={setScreen} />;
  if (screen === "create") return (
    <CreateScreen
      draft={createDraft}
      setDraft={setCreateDraft}
      quoteFile={quoteFile}
      setQuoteFile={setQuoteFile}
      quoteItems={quoteItems}
      setQuoteItems={setQuoteItems}
      onCreate={createCampaign}
      onBack={() => setScreen("createIntro")}
      notify={notify}
    />
  );
  if (screen === "profileJoined") return (
    <JoinedCampaigns campaigns={campaigns.filter((c) => joined.includes(c.id))} setScreen={setScreen} select={setSelected} />
  );
  if (screen === "profileCreated") return (
    <CreatedCampaigns campaigns={created} campaignsState={campaigns} setScreen={setScreen} select={setSelected} />
  );
  if (screen === "legalEvidence") {
    const selectedEvidence = legalEvidenceByCampaign[selected?.id] || selected?.legalEvidence || { cccd: "pending", expense: "pending", bank: "pending" };
    return (
      <LegalEvidence
        campaign={selected}
        evidence={selectedEvidence}
        setEvidence={(next) => setLegalEvidenceByCampaign((prev) => ({ ...prev, [selected?.id]: next }))}
        evidenceLoading={evidenceLoading}
        setEvidenceLoading={setEvidenceLoading}
        setCampaigns={setCampaigns}
        setCreated={setCreated}
        setScreen={setScreen}
        notify={notify}
      />
    );
  }
  if (screen === "organizerDashboard") return <FieldDashboard campaign={campaigns.find((c) => c.id === selected?.id) || selected} setScreen={setScreen} notify={notify} updateCampaign={updateCampaign} />;
  if (screen === "profile") return <Profile user={user} transactions={transactions} joined={joined} campaigns={campaigns} created={created} setScreen={setScreen} setSelected={setSelected} setUser={setUser} notify={notify} logout={logout} />;
  return null;

  function Dashboard({ campaigns, search, setSearch, category, setCategory, sort, setSort, openCampaign, setScreen, user }) {
    return <AppShell setScreen={setScreen} screen="dashboard">
      <div className="dashboard-content">
        <div className="welcome-bar"><div><small>Xin chào</small><strong>{user?.name}</strong></div><img src={user?.avatar} alt="avatar"/></div>
        <section className="hero-card"><div><span>TRUSTFLOW AI</span><h1>Minh bạch hơn.<br/><em>Niềm tin hơn.</em></h1><p>Khám phá các chiến dịch được xác thực và theo dõi dòng tiền minh bạch.</p></div><div className="hero-icon"><Icon name="shield" size={38}/></div></section>
        <div className="search-row"><div className="search-box"><Icon name="search"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm quỹ cứu trợ..."/></div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="default">Mặc định</option><option value="urgency">Khẩn cấp</option><option value="trust">Uy tín</option><option value="amount">Đã gây quỹ</option></select></div>
        <div className="category-row">{["Tất cả","Thảm họa","Y tế","Giáo dục"].map(x=><button className={category===x?"category active":"category"} onClick={()=>setCategory(x)} key={x}>{x}</button>)}</div>
        <div className="section-title"><div><span>DISCOVER</span><h2>Quỹ đang hoạt động</h2></div><small>{campaigns.length} chiến dịch</small></div>
        <div className="campaign-list">{campaigns.map(c=><CampaignCard key={c.id} campaign={c} onClick={()=>openCampaign(c)}/>)}</div>
        {!campaigns.length && <div className="empty">Không tìm thấy quỹ phù hợp.</div>}
      </div>
    </AppShell>;
  }

  function CampaignCard({campaign,onClick}) {
    const progress=Math.min(100,campaign.raised/campaign.goal*100);
    return <article className="campaign-card" onClick={onClick}><div className="campaign-cover"><img src={campaign.image} alt="" onError={e=>e.currentTarget.style.display="none"}/><span className="trust-badge"><Icon name="shield" size={13}/> {campaign.trustScore}</span><span className="status-badge">{campaign.duration}</span></div><div className="campaign-body"><small>{campaign.category} · Còn {campaign.daysLeft} ngày</small><h3>{campaign.title}</h3><p>{campaign.organizer}</p><div className="money"><b>{money(campaign.raised)}</b><span>/ {money(campaign.goal)}</span></div><div className="progress"><span style={{width:`${progress}%`}}/></div><div className="campaign-footer"><span>{campaign.donors.toLocaleString("vi-VN")} lượt ủng hộ</span><b>{progress.toFixed(0)}%</b></div></div></article>;
  }

  function CampaignDetail({campaign,joined,setScreen}) {
    const progress=Math.min(100,campaign.raised/campaign.goal*100);
    return <div className="screen"><header className="topbar"><button onClick={()=>setScreen("dashboard")}><Icon name="back"/></button><strong>Chi tiết chiến dịch</strong><button onClick={()=>notify("Đã sao chép liên kết mô phỏng.")}><Icon name="share"/></button></header><div className="detail"><img className="detail-image" src={campaign.image} alt=""/><div className="detail-content"><div className="trust-line"><Icon name="shield"/> Trust Score {campaign.trustScore}/100</div><h1>{campaign.title}</h1><p>{campaign.description}</p><div className="organizer"><div className="org-avatar">TF</div><div><small>TỔ CHỨC</small><b>{campaign.organizer}</b></div></div><div className="stats"><div><small>ĐÃ GÂY QUỸ</small><b>{money(campaign.raised)}</b></div><div><small>MỤC TIÊU</small><b>{money(campaign.goal)}</b></div><div><small>NHÀ HẢO TÂM</small><b>{campaign.donors}</b></div></div><div className="progress big"><span style={{width:`${progress}%`}}/></div><div className="campaign-footer"><span>Còn {campaign.daysLeft} ngày</span><b>{progress.toFixed(0)}%</b></div><h3>Dự toán mua sắm minh bạch (AI OCR)</h3><div className="budget">{campaign.budgetPlan?.length ? campaign.budgetPlan.map((x,i)=><div key={i}><div><b>{x.item}</b><small>SL: {x.qty} × {money(x.price)}</small></div><strong>{money(x.price*x.qty)}</strong></div>) : <p>Chưa có danh mục dự toán chi tiết.</p>}</div><Button onClick={()=>setScreen("donate")}><Icon name="heart"/>Quyên góp vào quỹ này</Button>{joined&&<div className="joined">✓ Bạn đã tham gia chiến dịch này</div>}</div></div></div>;
  }

  function Donate({campaign,amount,setAmount,onBack,onPay}) {
    const formatted=amount?Number(amount).toLocaleString("vi-VN"):"";
    return <div className="screen"><header className="topbar"><button onClick={onBack}><Icon name="back"/></button><strong>Quyên góp</strong><span/></header><div className="donate-content"><div className="donate-campaign"><img src={campaign.image} alt=""/><div><small>QUYÊN GÓP CHO</small><b>{campaign.title}</b></div></div><h2>Nhập số tiền</h2><div className="amount-box"><input inputMode="numeric" value={formatted} onChange={e=>setAmount(e.target.value.replace(/\D/g,"").slice(0,9))}/><span>VNĐ</span></div><div className="quick-amounts">{[50000,100000,200000,500000].map(x=><button key={x} onClick={()=>setAmount(String(x))}>{money(x)}</button>)}</div><div className="secure-note"><Icon name="shield"/> Giao dịch mô phỏng an toàn · MoMo Sandbox</div><Button disabled={!amount || Number(amount)<=0} onClick={onPay}>Tiếp tục thanh toán · {Number(amount||0).toLocaleString("vi-VN")}đ</Button></div></div>;
  }

  function MomoSandbox({amount,campaign,user,onBack,onSuccess}) {
    const [step,setStep]=useState("wallet");
    const numericAmount = Number(amount || 0);
    const formattedAmount = numericAmount.toLocaleString("vi-VN");
    const recipient = campaign?.organizer || "TrustFlow AI";
    const transactionMessage = `${user?.id || "894206"} ${formattedAmount} Ủng hộ ${campaign?.title || "TrustFlow AI"}`;
    const [pin,setPin]=useState("");
    const [otp,setOtp]=useState("");

    const pressKey=(key)=>{
      if(key==="⌫") return setPin(pin.slice(0,-1));
      if(key==="C") return setPin("");
      if(pin.length<6) setPin(pin+key);
    };

    if(step==="processing") return <div className="momo-screen processing">
      <div className="momo-processing-logo"><img src={MOMO_LOGO_URL} alt="MoMo"/></div>
      <div className="spinner momo-spinner"/>
      <h2>Đang xử lý giao dịch</h2>
      <p>Vui lòng không thoát ứng dụng</p>
    </div>;

    if(step==="wallet") return <div className="momo-screen">
      <header className="momo-topbar">
        <button onClick={onBack}><Icon name="back" size={24}/></button>
        <div className="momo-title">Đăng nhập Ví <img src={MOMO_LOGO_URL} alt="MoMo"/></div><span/>
      </header>
      <div className="momo-login">
        <img className="momo-avatar" src={MOMO_LOGO_URL} alt="MoMo"/>
        <h2>Chào, Nguyễn Văn Donor</h2>
        <p>Vui lòng nhập mật khẩu để đăng nhập</p>
        <div className="momo-pin-dots">{[0,1,2,3,4,5].map(i=><i key={i} className={pin.length>i?"filled":""}/>)}</div>
        <button className="momo-forgot" onClick={()=>setPin("")}>Quên mật khẩu?</button>
      </div>
      <div className="momo-keyboard">
        <div className="momo-numpad">{[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((n,i)=><button key={i} disabled={n===""} onClick={()=>pressKey(n)}>{n}</button>)}</div>
        <button className="momo-primary" disabled={pin.length<6} onClick={()=>setStep("confirm")}>Đăng nhập</button>
        <div className="momo-secure"><Icon name="shield" size={14}/> Thông tin của bạn được bảo mật</div>
      </div>
    </div>;

    if(step==="confirm") return <div className="momo-screen">
      <header className="momo-gradient-head">
        <button onClick={()=>setStep("wallet")}><Icon name="back" size={24}/></button>
        <strong>Thanh toán an toàn</strong><span/>
      </header>
      <div className="momo-payment-page">
        <section className="momo-card">
          <div className="momo-card-label">NGUỒN TIỀN</div>
          <div className="momo-source"><img src={MOMO_LOGO_URL} alt="MoMo"/><div><b>Ví MoMo</b><small>Số dư khả dụng · Ví mô phỏng</small></div><span>›</span></div>
        </section>
        <section className="momo-card merchant-card">
          <div className="momo-card-label">THANH TOÁN CHO</div>
          <div className="momo-merchant"><div className="merchant-icon">TF</div><div><b>TrustFlow AI</b><small>Quyên góp thiện nguyện</small></div><Icon name="check" size={18}/></div>
          <div className="momo-amount"><small>SỐ TIỀN THANH TOÁN</small><strong>{formattedAmount}đ</strong></div>
        </section>

        <section className="momo-card momo-transaction-detail">
          <h3>CHI TIẾT GIAO DỊCH</h3>
          <div className="momo-detail-row"><span>Chuyển đến</span><b>{recipient}</b></div>
          <div className="momo-detail-row"><span>Số tiền</span><b>{formattedAmount}đ</b></div>
          <div className="momo-detail-row message-row"><span>Tin nhắn</span><b>{transactionMessage}</b></div>
          <div className="momo-detail-divider"/>
          <div className="momo-detail-row"><span>Phí giao dịch</span><b className="free-fee">Miễn phí</b></div>
          <div className="momo-detail-total"><span>TỔNG TIỀN</span><strong>{formattedAmount}đ</strong></div>
        </section>

        <div className="momo-bottom-pay"><div><small>TỔNG THANH TOÁN</small><strong>{formattedAmount}đ</strong></div><button onClick={()=>setStep("otp")}>Xác nhận</button></div>
      </div>
    </div>;

    return <div className="momo-screen">
      <header className="momo-gradient-head"><button onClick={()=>setStep("confirm")}><Icon name="back" size={24}/></button><strong>Xác thực giao dịch</strong><span/></header>
      <div className="momo-otp-page">
        <img src={MOMO_LOGO_URL} className="momo-otp-logo" alt="MoMo"/>
        <h2>Nhập mã OTP</h2><p>Mã OTP mô phỏng đã được gửi đến số điện thoại của bạn.</p>
        <input className="momo-otp-input" autoFocus value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="••••••"/>
        <div className="momo-otp-demo">OTP demo: <b>123456</b></div>
        <button className="momo-primary" disabled={otp.length<6} onClick={()=>{setStep("processing");setTimeout(onSuccess,1200)}}>Xác nhận thanh toán</button>
        <button className="momo-link" onClick={()=>setOtp("")}>Gửi lại mã OTP</button>
      </div>
    </div>;
  }

  function TransactionResult({amount,campaign,onHome}) {
    return <div className="result-screen"><div className="result-check"><Icon name="check" size={42}/></div><h1>Giao dịch thành công</h1><p>Cảm ơn bạn đã lan tỏa giá trị.</p><div className="receipt"><small>MÃ GIAO DỊCH</small><b>TX{Date.now().toString().slice(-6)}</b><small>SỐ TIỀN</small><strong>{money(amount)}</strong><small>CHIẾN DỊCH</small><b>{campaign?.title}</b><span>✓ Đã ghi nhận vào lịch sử quyên góp</span></div><Button onClick={onHome}>Về Trang chủ</Button></div>;
  }

  function CreateIntro({setScreen}) {
    return <div className="screen padded"><button className="round-back" onClick={()=>setScreen("dashboard")}><Icon name="back"/></button><div className="create-intro"><span className="section-label">CREATE WITH TRUST</span><h1>Khởi tạo niềm tin,<br/>Lan tỏa giá trị</h1><p>Cùng TrustFlow AI tạo nên những chiến dịch thiện nguyện minh bạch, an toàn và hiệu quả.</p></div><div className="choice-list"><button onClick={()=>setScreen("create")}><Icon name="user"/><div><b>Tạo quỹ Cá nhân</b><small>Dành cho nhà hảo tâm cá nhân.</small><em>Hạn mức mô phỏng: 100.000.000đ</em></div></button><button onClick={()=>setScreen("create")}><Icon name="shield"/><div><b>Tạo quỹ Tổ chức</b><small>Dành cho tổ chức, doanh nghiệp.</small><em>Yêu cầu xác minh hồ sơ</em></div></button></div></div>;
  }

  function JoinedCampaigns({ campaigns, setScreen, select }) {
    return (
      <div className="screen folder-list-screen">
        <header className="topbar">
          <button type="button" onClick={() => setScreen("profile")}><Icon name="back" /></button>
          <strong>Quỹ Đã Tham Gia</strong>
          <span />
        </header>
        <div className="folder-list-content">
          {!campaigns.length ? (
            <div className="empty">Bạn chưa tham gia quỹ nào.</div>
          ) : (
            campaigns.map((campaign) => (
              <button key={campaign.id} type="button" className="folder-campaign-card" onClick={() => { select(campaign); setScreen("campaignDetail"); }}>
                <img src={campaign.image} alt="" />
                <span className="folder-campaign-info">
                  <small>{campaign.category}</small>
                  <strong>{campaign.title}</strong>
                  <span>{money(campaign.raised)} / {money(campaign.goal)}</span>
                </span>
                <span className="folder-arrow">›</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  function CreatedCampaigns({ campaigns, campaignsState, setScreen, select }) {
    return (
      <div className="screen created-campaign-screen">
        <header className="topbar">
          <button onClick={() => setScreen("profile")}><Icon name="back" /></button>
          <strong>Quản Lý Quỹ Đã Tạo</strong>
          <span />
        </header>

        <div className="created-list">
          {!campaigns.length ? (
            <div className="empty">Chưa có chiến dịch nào.</div>
          ) : (
            campaigns.map((createdCampaign) => {
              const campaign = campaignsState.find((item) => item.id === createdCampaign.id) || createdCampaign;
              const legalDone = campaign.legalEvidence && Object.values(campaign.legalEvidence).every((value) => value === "verified");

              return (
                <article key={campaign.id} className={`created-campaign-card ${legalDone ? "active-campaign" : "pending-campaign"}`}>
                  <div className="created-card-top">
                    <div className={`created-card-icon ${legalDone ? "active" : "pending"}`}>
                      <Icon name={legalDone ? "check" : "file"} size={24} />
                    </div>
                    <span className={`created-status ${legalDone ? "active" : "pending"}`}>
                      {legalDone ? "● Đang hoạt động" : "Cờ Đỏ: Chờ pháp lý"}
                    </span>
                  </div>

                  <h2>{campaign.title}</h2>
                  <div className="created-card-divider" />

                  {!legalDone ? (
                    <button className="legal-action" type="button" onClick={() => { select(campaign); setScreen("legalEvidence"); }}>
                      <Icon name="alert" size={15} />
                      Nhấn để bổ sung giấy tờ pháp lý để mở khóa quỹ.
                    </button>
                  ) : (
                    <button className="field-dashboard-link" type="button" onClick={() => { select(campaign); setScreen("organizerDashboard"); }}>
                      <Icon name="plusCircle" size={17} />
                      Bảng Điều Khiển Hiện Trường
                    </button>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    );
  }

  function LegalEvidence({ campaign, evidence, setEvidence, evidenceLoading, setEvidenceLoading, setCampaigns, setCreated, setScreen, notify }) {
    const verifyEvidence = (key) => {
      if (evidenceLoading) return;
      setEvidenceLoading(key);

      window.setTimeout(() => {
        const nextEvidence = { ...evidence, [key]: "verified" };
        const isComplete = Object.values(nextEvidence).every((value) => value === "verified");
        setEvidence(nextEvidence);

        const update = (item) => item.id === campaign.id
          ? { ...item, legalEvidence: nextEvidence, legalReady: isComplete, status: isComplete ? "ACTIVE" : "DRAFT", duration: isComplete ? "Đang hoạt động" : "Đang chờ pháp lý" }
          : item;

        setCampaigns((prev) => prev.map(update));
        setCreated((prev) => prev.map(update));
        setEvidenceLoading(null);
        notify(isComplete ? "Đã đủ minh chứng. Quỹ đã được mở khóa." : "Đã xác minh minh chứng.");
      }, 1100);
    };

    const items = [
      { key: "cccd", icon: "scan", title: "Quét QR thẻ CCCD", subtitle: "Định danh người đại diện", tone: "blue" },
      { key: "expense", icon: "file", title: "Báo cáo dự chi (Đã sửa)", subtitle: "Bản PDF/Excel đối soát", tone: "gold" },
      { key: "bank", icon: "bank", title: "Tài khoản ngân hàng", subtitle: "Liên kết Open Banking", tone: "purple" },
    ];

    const complete = Object.values(evidence).every((value) => value === "verified");

    return (
      <div className="screen legal-evidence-screen">
        <button className="floating-back" type="button" onClick={() => setScreen("profileCreated")}><Icon name="back" size={24} /></button>
        <div className="legal-evidence-header">
          <div className="legal-warning-icon"><Icon name="alert" size={38} /></div>
          <h1>Bổ Sung Minh Chứng</h1>
          <p>Quỹ bị cắm cờ đỏ do thiếu pháp lý. Hãy cập nhật các giấy tờ sau để hệ thống xét duyệt.</p>
        </div>
        <div className="evidence-list">
          {items.map((item) => {
            const verified = evidence[item.key] === "verified";
            const loading = evidenceLoading === item.key;
            return (
              <button key={item.key} type="button" disabled={verified || !!evidenceLoading} className={`evidence-card ${verified ? "verified" : ""}`} onClick={() => !verified && verifyEvidence(item.key)}>
                <span className={`evidence-icon ${item.tone}`}>
                  {loading ? <span className="mini-spinner" /> : <Icon name={verified ? "check" : item.icon} size={23} />}
                </span>
                <span className="evidence-text">
                  <strong>{item.title}</strong>
                  <small>{loading ? "Đang xác minh..." : verified ? "Đã xác minh thành công" : item.subtitle}</small>
                </span>
                <span className="evidence-status">
                  {loading ? <span className="loading-dots"><i /><i /><i /></span> : verified ? <Icon name="check" size={18} /> : "›"}
                </span>
              </button>
            );
          })}
        </div>
        {complete && <div className="legal-complete-banner"><Icon name="check" size={18} />Đã đủ minh chứng pháp lý · Quỹ đã được mở khóa.</div>}
      </div>
    );
  }

  function FieldDashboard({ campaign, setScreen, notify, updateCampaign }) {
    const field = campaign?.fieldReport || {};
    const budgetTotal = Math.max(0, Number(campaign?.goal || 0));
    const fixedTargetFromPlan = Number((campaign?.budgetPlan || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0));
    const fixedFundTarget = fixedTargetFromPlan > 0 ? Math.min(fixedTargetFromPlan, budgetTotal) : Math.round(budgetTotal * 0.7);
    const flexibleFundTarget = Math.max(0, budgetTotal - fixedFundTarget);
    const defaultOps = {
      phaseState: "PHASE_1",
      activeTab: "FIELD",
      isLocked: false,
      isProjectEnded: false,
      detectedAtmCashPool: 20000000,
      declaredCashSpent: 0,
      expenses: [],
    };
    const [ops, setOps] = useState(campaign?.fieldOperations || defaultOps);
    const [newExpense, setNewExpense] = useState({ title: "", amount: "", fundType: "LINH HOẠT" });
    const [anomalyExplanation, setAnomalyExplanation] = useState("");
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const [surplusForm, setSurplusForm] = useState({ title: "", amount: "" });
    const [reportOpen, setReportOpen] = useState(false);
    const [viewRole, setViewRole] = useState(campaign?.fieldOperations?.viewRole || "BTC");
    const [docModalExpense, setDocModalExpense] = useState(null);
    const [docForm, setDocForm] = useState({ explanation: "", fundType: "CỐ ĐỊNH", receiptImg: null, proofImg: null, missingReceipt: false });
    const [cashModalOpen, setCashModalOpen] = useState(false);

    useEffect(() => {
      setOps(campaign?.fieldOperations || defaultOps);
    }, [campaign?.id]);

    const persistOps = (patch, message) => {
      setOps((prev) => {
        const next = { ...prev, ...patch };
        updateCampaign(campaign.id, { fieldOperations: next });
        return next;
      });
      if (message) notify(message);
    };

    const expenses = ops.expenses || [];
    const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const spentFixed = expenses.filter((e) => e.fundType === "CỐ ĐỊNH").reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const spentFlexible = expenses.filter((e) => e.fundType === "LINH HOẠT").reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const remainingAtmCash = Math.max(0, Number(ops.detectedAtmCashPool || 0) - Number(ops.declaredCashSpent || 0));
    const surplusBalance = Math.max(0, budgetTotal - totalSpent);
    const pendingFlagsCount = expenses.filter((e) => e.flagStatus === "FLAGGED" || e.flagStatus === "EXPLAINED_PENDING_VOTE").length;
    const verifiedAmount = expenses.filter((e) => e.status === "VERIFIED" || e.status === "NEEDS_EXPLANATION").reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const dcr = totalSpent > 0 ? Math.round((verifiedAmount / totalSpent) * 100) : 100;
    const unassigned = expenses.filter((e) => e.fundType === "CHƯA_TAG");
    const phase1Missing = [
      !field.gps && "GPS",
      !field.floodLevel && "Mức ngập lụt",
      !field.priorityHouseholds && "Số hộ ưu tiên",
      !field.priorityVulnerablePeople && "Trẻ em & Thai phụ",
      !(campaign?.budgetPlan || []).length && !budgetTotal && "Ngân sách / báo giá",
    ].filter(Boolean);
    // Giai đoạn 1 là bước chốt vận hành, không khóa người dùng khỏi GĐ2 chỉ vì
    // một trường dữ liệu phụ chưa có. Các dữ liệu đã nhập vẫn được giữ nguyên
    // và GĐ2 sẽ hiển thị "Chưa cập nhật" ở những trường còn thiếu.
    const phase1Ready = phase1Missing.length === 0;

    const pushExpense = (expense, message) => persistOps({ expenses: [expense, ...expenses] }, message);

    const simulateBank = () => {
      const amount = 2000000 + Math.floor(Math.random() * 3000000);
      pushExpense({
        id: `EXP_${Date.now()}`,
        bankTxId: `TX${Math.floor(100000 + Math.random() * 899999)}`,
        method: "OPENBANKING_API",
        bankRawContent: "CHUYEN KHOAN MUA VAT TU CUU TRO REALTIME",
        amount,
        bankTime: new Date().toLocaleString("vi-VN"),
        fundType: "CHƯA_TAG",
        explanationText: "",
        receiptImg: null,
        proofImg: null,
        status: "WAITING_DOC",
        flagsCount: 0,
        flagDetails: "",
        flagStatus: "NONE",
        approveVotes: 0,
        rejectVotes: 0,
        isMissingDoc: false,
      }, "OpenBanking API realtime: đã ghi nhận một biến động chi.");
    };

    const simulateAtm = () => persistOps({ detectedAtmCashPool: Number(ops.detectedAtmCashPool || 0) + 5000000 }, "OpenBanking ATM: đã ghi nhận rút thêm 5.000.000đ.");

    const addCashExpense = () => {
      const amount = Number(newExpense.amount);
      if (!newExpense.title.trim()) return notify("Vui lòng nhập mục đích chi thực địa.");
      if (!amount || amount > remainingAtmCash) return notify("Số tiền chi vượt quá hạn mức tiền mặt còn lại.");
      const expense = {
        id: `CASH_${Date.now()}`,
        bankTxId: `CASH_${expenses.length + 1}`,
        method: "PETTY_CASH",
        bankRawContent: `CHI TIỀN MẶT THỰC ĐỊA: ${newExpense.title || "Chi mua sắm lẻ"}`,
        amount,
        bankTime: new Date().toLocaleString("vi-VN"),
        fundType: newExpense.fundType,
        explanationText: newExpense.title || "Chi tiền mặt nhỏ lẻ thực địa",
        receiptImg: field.photos?.[0] || null,
        proofImg: field.photos?.[0] || null,
        status: "VERIFIED",
        flagsCount: 0,
        flagDetails: "",
        flagStatus: "NONE",
        approveVotes: 0,
        rejectVotes: 0,
        isMissingDoc: false,
      };
      persistOps({ expenses: [expense, ...expenses], declaredCashSpent: Number(ops.declaredCashSpent || 0) + amount }, "Đã khai báo khoản chi tiền mặt thực địa.");
      setNewExpense({ title: "", amount: "", fundType: "LINH HOẠT" });
      setCashModalOpen(false);
    };

    const readFilePreview = (file, callback) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => callback(reader.result, file.name);
      reader.readAsDataURL(file);
    };

    const openDocumentModal = (expense) => {
      setDocModalExpense(expense);
      setDocForm({
        explanation: expense.explanationText || "",
        fundType: expense.fundType === "CHƯA_TAG" ? "CỐ ĐỊNH" : (expense.fundType || "CỐ ĐỊNH"),
        receiptImg: expense.receiptImg || null,
        proofImg: expense.proofImg || null,
        missingReceipt: !!expense.isMissingDoc,
      });
    };

    const saveDocuments = () => {
      if (!docModalExpense) return;
      const next = expenses.map((e) => e.id === docModalExpense.id ? {
        ...e,
        explanationText: docForm.explanation.trim() || e.explanationText || e.bankRawContent,
        fundType: docForm.fundType,
        receiptImg: docForm.receiptImg,
        proofImg: docForm.proofImg,
        isMissingDoc: docForm.missingReceipt,
        status: docForm.receiptImg && docForm.proofImg && !docForm.missingReceipt ? "VERIFIED" : "WAITING_DOC",
      } : e);
      persistOps({ expenses: next }, "Đã lưu hóa đơn/chứng từ và ảnh vật lý cho khoản chi.");
      setDocModalExpense(null);
    };

    const switchRole = (nextRole) => {
      setViewRole(nextRole);
      persistOps({ viewRole: nextRole }, nextRole === "BTC" ? "Đã chuyển sang vai trò BTC." : "Đã chuyển sang vai trò Donor.");
    };

    const flagExpense = (expenseId) => {
      const next = expenses.map((e) => e.id === expenseId ? { ...e, flagsCount: Number(e.flagsCount || 0) + 1, flagDetails: "Giá cao bất thường", flagStatus: "FLAGGED", status: Number(e.flagsCount || 0) + 1 >= 10 ? "NEEDS_EXPLANATION" : e.status } : e);
      persistOps({ expenses: next }, "Đã cắm cờ khoản chi để yêu cầu giải trình.");
    };

    const submitExplanation = (expenseId) => {
      if (!anomalyExplanation.trim()) return notify("Vui lòng nhập nội dung giải trình.");
      persistOps({ expenses: expenses.map((e) => e.id === expenseId ? { ...e, explanationText: anomalyExplanation.trim(), flagStatus: "EXPLAINED_PENDING_VOTE" } : e) }, "Đã gửi giải trình, chờ Donor bỏ phiếu.");
      setAnomalyExplanation("");
      setSelectedExpenseId(null);
    };

    const voteExplanation = (expenseId, approve) => {
      persistOps({ expenses: expenses.map((e) => {
        if (e.id !== expenseId) return e;
        const approveVotes = approve ? Number(e.approveVotes || 0) + 1 : Number(e.approveVotes || 0);
        const rejectVotes = approve ? Number(e.rejectVotes || 0) : Number(e.rejectVotes || 0) + 1;
        const resolved = approveVotes >= 3;
        return { ...e, approveVotes, rejectVotes, flagStatus: resolved ? "RESOLVED" : "EXPLAINED_PENDING_VOTE", status: resolved ? "VERIFIED" : e.status, flagsCount: resolved ? 0 : Number(e.flagsCount || 0) };
      }) }, approve ? "Đã ghi nhận phiếu đồng ý gỡ cờ." : "Đã ghi nhận phiếu bác bỏ giải trình.");
    };

    const spendSurplus = () => {
      const amount = Number(surplusForm.amount);
      if (!amount || amount > surplusBalance) return notify("Số tiền vượt quá số dư quỹ.");
      pushExpense({
        id: `SURPLUS_${Date.now()}`,
        bankTxId: `TX99${Math.floor(100 + Math.random() * 900)}`,
        method: "OPENBANKING_API",
        bankRawContent: `CHI DƯ QUỸ MUA BỔ SUNG: ${surplusForm.title}`,
        amount,
        bankTime: new Date().toLocaleString("vi-VN"),
        fundType: "CỐ ĐỊNH",
        explanationText: `[Bổ sung dư quỹ]: ${surplusForm.title || "Mua thêm hàng cứu trợ"}`,
        receiptImg: field.photos?.[0] || null,
        proofImg: field.photos?.[0] || null,
        status: "VERIFIED",
        flagsCount: 0,
        flagDetails: "",
        flagStatus: "NONE",
        approveVotes: 0,
        rejectVotes: 0,
        isMissingDoc: false,
      }, "Đã khai báo chi bổ sung từ dư quỹ.");
      setSurplusForm({ title: "", amount: "" });
    };

    const goPhase2 = () => {
      // Không chặn chuyển giai đoạn. Nếu còn thiếu dữ liệu, vẫn chuyển sang GĐ2
      // nhưng thông báo rõ để người dùng biết những mục cần bổ sung.
      const message = phase1Missing.length
        ? `Đã chốt GĐ1 và chuyển sang GĐ2. Cần bổ sung: ${phase1Missing.join(", ")}.`
        : "Đã chốt ngân sách thực hiện. Chuyển sang Giai đoạn 2.";
      persistOps({ phaseState: "PHASE_2", activeTab: "P2_DISBURSE" }, message);
    };

    const goPhase3 = () => persistOps({ phaseState: "PHASE_3", activeTab: "P3_RECONCILE" }, "Đã hoàn thành GĐ 2. Chuyển sang GĐ 3 đối soát.");

    const finalizeProject = () => {
      if (surplusBalance > 0) return notify(`Dự án vẫn còn dư ${money(surplusBalance)}. Cần giải ngân hết trước khi tổng kết.`);
      if (pendingFlagsCount > 0) return notify("Vẫn còn khoản chi bị cắm cờ chưa được giải quyết.");
      persistOps({ isLocked: true, isProjectEnded: true, activeTab: "P3_SURPLUS" }, "Tổng kết thành công. Dự án đã khóa sổ bất biến.");
      setReportOpen(true);
    };

    const phaseLabel = ops.isProjectEnded ? "🏁 ĐÃ HOÀN THÀNH DỰ ÁN" : ops.phaseState === "PHASE_3" ? "🏁 GĐ 3: ĐỐI SOÁT & KHÓA SỔ" : "⚡ GĐ 2: GIẢI NGÂN REALTIME";

    return <div className="field-dashboard-screen">
      <header className="field-dashboard-topbar">
        <button type="button" onClick={() => setScreen("profileCreated")}><Icon name="back" size={20}/></button>
        <div><small>TRUSTFLOW · FIELD CONTROL</small><strong>{campaign.title}</strong></div>
        <div className="role-switch" aria-label="Đổi vai trò">
          <button className={viewRole === "BTC" ? "active" : ""} onClick={() => switchRole("BTC")}>BTC</button>
          <button className={viewRole === "DONOR" ? "active donor" : ""} onClick={() => switchRole("DONOR")}>Donor</button>
        </div>
        <span className={`phase-pill ${ops.phaseState === "PHASE_3" ? "purple" : "green"}`}>{phaseLabel}</span>
      </header>

      <main className="field-dashboard-main">
        {ops.phaseState === "PHASE_1" && <>
          <section className="field-hero-card">
            <div className="field-section-title"><Icon name="mapPin" size={23}/><h2>Cập nhật Khung thực địa</h2></div>
            <div className="field-map-card">
              {field.photos?.[0] ? <img src={field.photos[0]} alt="Ảnh thực địa"/> : <div className="field-map-placeholder"><Icon name="mapPin" size={46}/></div>}
              <div className="gps-chip">GPS: {field.gps || "Chưa cập nhật"}</div>
            </div>
            <div className="field-two-stats">
              <div><small>MỨC NGẬP LỤT</small><strong>{field.floodLevel || "Chưa cập nhật"}</strong></div>
              <div><small>TÌNH TRẠNG ĐIỆN</small><strong className="danger-text">{field.waterElectricity || "Chưa cập nhật"}</strong></div>
            </div>
          </section>
          <section className="field-priority-card">
            <div className="field-section-title"><Icon name="users" size={23}/><h2>Quy mô & Nhóm Ưu Tiên</h2></div>
            <div className="priority-row"><span>Số hộ đang bị cô lập</span><strong>{Number(field.priorityHouseholds || 0).toLocaleString("vi-VN")} Hộ</strong></div>
            <div className="priority-row"><span>Trẻ em & Thai phụ</span><strong className="amber-number">~ {Number(field.priorityVulnerablePeople || 0).toLocaleString("vi-VN")} Người</strong></div>
            <div className="priority-row"><span>Ảnh minh chứng thực địa</span><strong>{field.photos?.length || 0} Ảnh</strong></div>
          </section>
          <section className="field-budget-card">
            <div className="field-section-title"><Icon name="fileText" size={22}/><h2>Ngân sách đã lập</h2></div>
            <div className="budget-summary-row"><span>Tổng ngân sách dự kiến</span><strong>{money(budgetTotal)}</strong></div>
            <div className="budget-summary-row"><span>Hạng mục AI OCR</span><strong>{campaign.budgetPlan?.length || 0} mục</strong></div>
          </section>
          <section className="phase1-lock-card">
            <div className="phase1-lock-title"><span>CHỐT GIAI ĐOẠN 1</span><b>KHUNG THỰC ĐỊA → NGÂN SÁCH</b></div>
            <p>GPS, mức ngập, tình trạng điện/nước, quy mô hộ ưu tiên và bản dự toán là dữ liệu đầu vào cho các giai đoạn giải ngân.</p>
            <button type="button" className="phase1-red-button" onClick={goPhase2}><Icon name="lock" size={18}/> CHỐT NGÂN SÁCH THỰC HIỆN <Icon name="arrowRight" size={18}/></button>
          </section>
        </>}

        {ops.phaseState !== "PHASE_1" && <>
          <div className="field-phase-tabs">
            <button className={ops.activeTab === "P2_DISBURSE" ? "active green" : ""} onClick={() => persistOps({activeTab:"P2_DISBURSE"})}>GĐ2: Giải Ngân Realtime</button>
            <button className={ops.activeTab === "P2_PETTY_CASH" ? "active green" : ""} onClick={() => persistOps({activeTab:"P2_PETTY_CASH"})}>Sổ Quỹ Tiền Mặt</button>
            {ops.phaseState === "PHASE_3" && <>
              <button className={ops.activeTab === "P3_RECONCILE" ? "active purple" : ""} onClick={() => persistOps({activeTab:"P3_RECONCILE"})}>GĐ3: Đối Soát</button>
              <button className={ops.activeTab === "P3_ANOMALY" ? "active purple" : ""} onClick={() => persistOps({activeTab:"P3_ANOMALY"})}>Giải Trình Cờ {pendingFlagsCount > 0 && <b>{pendingFlagsCount}</b>}</button>
              <button className={ops.activeTab === "P3_SURPLUS" ? "active purple" : ""} onClick={() => persistOps({activeTab:"P3_SURPLUS"})}>Tổng Kết & Dư Quỹ</button>
            </>}
          </div>

          {ops.activeTab === "P2_DISBURSE" && <section className="ops-panel">
            <div className="ops-panel-title"><span><Icon name="shield" size={19}/> Bảng Theo Dõi Dòng Tiền BTC Chi Tiết</span><b>REALTIME AUDIT</b></div>
            <div className="fund-meter"><span>1. Quỹ Cố Định</span><strong>{money(spentFixed)} / {money(fixedFundTarget)}</strong><i><em style={{width:`${Math.min(100, fixedFundTarget ? spentFixed/fixedFundTarget*100 : 0)}%`}}/></i></div>
            <div className="fund-meter"><span>2. Quỹ Linh Hoạt</span><strong>{money(spentFlexible)} / {money(flexibleFundTarget)}</strong><i><em className="purple-bar" style={{width:`${Math.min(100, flexibleFundTarget ? spentFlexible/flexibleFundTarget*100 : 0)}%`}}/></i></div>
            <div className="fund-meter"><span>3. Quỹ Tiền Mặt ATM</span><strong>{money(ops.declaredCashSpent || 0)} / {money(ops.detectedAtmCashPool || 0)}</strong><i><em className="amber-bar" style={{width:`${Math.min(100, ops.detectedAtmCashPool ? (ops.declaredCashSpent||0)/ops.detectedAtmCashPool*100 : 0)}%`}}/></i></div>
            <div className="ops-two-stats"><div><small>Giao dịch chưa Tag Quỹ</small><strong>{unassigned.length} · {money(unassigned.reduce((s,e)=>s+Number(e.amount||0),0))}</strong></div><div><small>Tỷ lệ Phủ Chứng Từ (DCR)</small><strong className="success-text">{dcr}% khép kín</strong></div></div>
            <div className="phase-switch-card"><div><small>Giai đoạn vận hành</small><strong>GĐ 2 - GIẢI NGÂN REALTIME</strong></div><button onClick={goPhase3}>HOÀN THÀNH GĐ 2 → CHUYỂN SANG GĐ 3 <Icon name="arrowRight" size={17}/></button></div>
            <div className="api-row"><div><b><Icon name="bank" size={17}/> OpenBanking API Webhook</b><small>Tự động nhận biến động số dư từ Ngân Hàng</small></div><button onClick={simulateBank}>+ Giả Lập API Bank</button></div>
            <div className="expense-list"><h3>Danh Sách Khoản Chi Thực Địa Realtime</h3>
              {expenses.length === 0 ? <div className="empty">Chưa có giao dịch. Hãy mô phỏng API Bank hoặc khai báo tiền mặt.</div> : expenses.map((item) => {
                const hasReceipt = !!item.receiptImg;
                const hasProof = !!item.proofImg;
                const closed = hasReceipt && hasProof && !item.isMissingDoc;
                return <article className="expense-ledger-card" key={item.id}>
                  <div className="ledger-topline">
                    <span className="ledger-id">{item.bankTxId}</span>
                    <span className={`ledger-method ${item.method === "PETTY_CASH" ? "cash" : "bank"}`}>{item.method === "PETTY_CASH" ? "PETTY_CASH" : "OPENBANKING_API"}</span>
                    <span className={`ledger-state ${closed ? "closed" : "flagged"}`}>{closed ? "● KHÉP KÍN CHỨNG TỪ" : "⚠ CÓ CỜ - CHỜ GIẢI TRÌNH"}</span>
                  </div>
                  <div className="ledger-grid">
                    <div className="bank-statement">
                      <div className="ledger-label">SAO KÊ BANK <Icon name="file" size={13}/></div>
                      <strong>{item.method === "PETTY_CASH" ? "-" : "-"}{money(item.amount).toUpperCase()}</strong>
                      <p>{item.bankRawContent}</p>
                      <small>Thời gian: {item.bankTime}</small>
                    </div>
                    <div className="document-status-card">
                      <div className="ledger-label">CHỨNG TỪ & GIẢI TRÌNH <span className={`tag-box ${item.fundType === "LINH HOẠT" ? "purple" : "blue"}`}>{item.fundType === "CHƯA_TAG" ? "TAG CỐ ĐỊNH" : `TAG ${item.fundType}`}</span></div>
                      <p>{item.explanationText || "Chưa có nội dung giải trình khoản chi"}</p>
                      <div className="doc-chip-row">
                        <button className={hasReceipt ? "doc-chip done" : "doc-chip"} onClick={() => openDocumentModal(item)}>✓ Hóa đơn</button>
                        <button className={hasProof ? "doc-chip done" : "doc-chip"} onClick={() => openDocumentModal(item)}>✓ Ảnh vật lý</button>
                      </div>
                      {viewRole === "BTC" ? <button className="doc-edit-button" onClick={() => openDocumentModal(item)}>📁 Tải Hóa Đơn Chứng Từ & Ảnh Vật Lý</button> : <button className="doc-edit-button donor-action" onClick={() => flagExpense(item.id)}>⚠️ Cắm cờ báo cáo</button>}
                    </div>
                  </div>
                </article>;
              })}
            </div>
          </section>}

          {ops.activeTab === "P2_PETTY_CASH" && <section className="ops-panel">
            <div className="ops-panel-title"><span><Icon name="wallet" size={19}/> Sổ Quỹ Tiền Mặt (Tín Hiệu API Ngân Hàng)</span><b>OPENBANKING</b></div>
            <div className="cash-stats"><div><small>ATM Phát Hiện</small><strong>{money(ops.detectedAtmCashPool || 0)}</strong></div><div><small>Đã Khai Báo Chi</small><strong>{money(ops.declaredCashSpent || 0)}</strong></div><div><small>Chờ Khai Báo</small><strong>{money(remainingAtmCash)}</strong></div></div>
            <div className="cash-actions"><button onClick={simulateAtm}>🏦 Giả Lập API Rút ATM</button><button className="green-action-button" onClick={() => setCashModalOpen(true)}>＋ Khai Báo Chi Tiền Mặt</button></div>
            <div className="cash-recent-list"><h3>Khoản chi tiền mặt gần đây</h3>{expenses.filter(e=>e.method === "PETTY_CASH").slice(0,5).map(e=><div className="cash-recent-row" key={e.id}><span>{e.explanationText}</span><b>{money(e.amount)}</b></div>)}</div>
          </section>}

          {ops.phaseState === "PHASE_3" && ops.activeTab === "P3_RECONCILE" && <section className="ops-panel purple-panel"><div className="ops-panel-title"><span><Icon name="lock" size={19}/> Khóa Sổ Dữ Liệu Bất Biến</span><b>LOCK API</b></div><div className="immutable-note">⚠️ Khi đã bấm Khóa Sổ, dữ liệu tài chính và hình ảnh chứng từ sẽ bị niêm phong bất biến (Immutable).</div>{ops.isLocked ? <div className="locked-banner"><Icon name="lock" size={18}/> CHIẾN DỊCH ĐÃ ĐƯỢC KHÓA SỔ BẤT BIẾN</div> : <button className="purple-main-button" onClick={()=>persistOps({isLocked:true},"Đã khóa sổ dữ liệu bất biến.")}>🔒 XÁC NHẬN KHÓA SỔ DỮ LIỆU BẤT BIẾN</button>}</section>}

          {ops.phaseState === "PHASE_3" && ops.activeTab === "P3_ANOMALY" && <section className="ops-panel"><div className="ops-panel-title amber-title"><span><Icon name="flag" size={19}/> Trung Tâm Giải Trình Cờ Cảnh Báo</span></div>{expenses.filter(e=>e.flagsCount>0 || e.flagStatus!=="NONE").length===0 ? <div className="empty">Không có khoản chi đang bị cắm cờ.</div> : expenses.filter(e=>e.flagsCount>0 || e.flagStatus!=="NONE").map(item=><div className="flag-card" key={item.id}><div className="flag-card-head"><b>{item.bankTxId} · {money(item.amount)}</b><span>{item.flagStatus === "RESOLVED" ? "🟢 ĐÃ GỠ CỜ" : item.flagStatus === "EXPLAINED_PENDING_VOTE" ? "🔵 CHỜ VOTE" : "🔴 ĐANG CẮM CỜ"}</span></div><div className="flag-grid"><div><small>LÝ DO CẮM CỜ</small><p>{item.flagDetails || "Nghi vấn đơn giá cao"}</p><b>Số cờ: {item.flagsCount}</b></div><div><small>KẾT QUẢ BỎ PHIẾU</small><p className="success-text">Thuận: {item.approveVotes || 0}/3</p><p className="danger-text">Chống: {item.rejectVotes || 0}</p></div></div>{item.flagStatus === "FLAGGED" && <>{selectedExpenseId === item.id ? <><textarea placeholder="Nhập nội dung giải trình bổ sung..." value={anomalyExplanation} onChange={e=>setAnomalyExplanation(e.target.value)}/><button className="blue-main-button" onClick={()=>submitExplanation(item.id)}>GỬI GIẢI TRÌNH (CHỜ VOTE DONOR)</button></> : <button className="flag-action-button" onClick={()=>setSelectedExpenseId(item.id)}>Mở giải trình</button>}</>}{item.flagStatus === "EXPLAINED_PENDING_VOTE" && <div className="vote-actions"><button onClick={()=>voteExplanation(item.id,false)}>👎 Bác Bỏ</button><button onClick={()=>voteExplanation(item.id,true)}>👍 Đồng Ý Gỡ Cờ</button></div>}</div>)}</section>}

          {ops.phaseState === "PHASE_3" && ops.activeTab === "P3_SURPLUS" && <section className="ops-panel"><div className="ops-panel-title"><span><Icon name="receipt" size={19}/> Xử Lý Dư Quỹ & Tổng Kết Dự Án</span><b>PHASE 3</b></div><div className={`surplus-meter ${surplusBalance > 0 ? "warning" : "ok"}`}><small>SỐ DƯ QUỸ CÒN LẠI CẦN GIẢI NGÂN HẾT</small><strong>{money(surplusBalance)}</strong></div>{surplusBalance > 0 ? <div className="surplus-warning"><b>⚠️ Yêu Cầu Giải Ngân Hết Quỹ Dư</b><p>Dự án vẫn còn dư <strong>{money(surplusBalance)}</strong>. BTC phải mua thêm hàng cứu trợ cho tới khi dư quỹ = 0đ mới được phép Tổng Kết.</p><input placeholder="Tên hàng hóa / quà tặng bổ sung" value={surplusForm.title} onChange={e=>setSurplusForm({...surplusForm,title:e.target.value})}/><input inputMode="numeric" placeholder={`Tối đa ${surplusBalance}`} value={surplusForm.amount} onChange={e=>setSurplusForm({...surplusForm,amount:e.target.value.replace(/\D/g,"")})}/><button onClick={spendSurplus}>Khai Báo Chi</button></div> : <div className="surplus-ok">🟢 ĐÃ GIẢI NGÂN TRỌN VẸN 100% QUYÊN GÓP<br/><small>Số dư quỹ còn lại = 0 VNĐ. Đủ điều kiện Tổng kết!</small></div>}<button className="finalize-button" onClick={finalizeProject}><Icon name="fileText" size={18}/> HOÀN TẤT TỔNG KẾT & XUẤT BÁO CÁO + THƯ CẢM ƠN</button></section>}
        </>}
      </main>

      {docModalExpense && <div className="field-modal-backdrop"><div className="field-doc-modal">
        <div className="field-modal-head"><h3>▣ Tải Hóa Đơn Chứng Từ & Ảnh Vật Lý</h3><button onClick={()=>setDocModalExpense(null)}>✕</button></div>
        <label>Nội Dung Giải Trình Khoản Chi:<textarea value={docForm.explanation} onChange={e=>setDocForm({...docForm,explanation:e.target.value})} /></label>
        <label>Gán Tag Loại Quỹ:<select value={docForm.fundType} onChange={e=>setDocForm({...docForm,fundType:e.target.value})}><option>CỐ ĐỊNH</option><option>LINH HOẠT</option></select></label>
        <div className="upload-doc-section"><b>1. HÓA ĐƠN CHỨNG TỪ (RECEIPT IMAGE):</b><input type="file" accept="image/*,.pdf" onChange={e=>readFilePreview(e.target.files?.[0],(data)=>setDocForm(f=>({...f,receiptImg:data})))} />{docForm.receiptImg && <img src={docForm.receiptImg} className="doc-preview" alt="Hóa đơn"/>}</div>
        <div className="upload-doc-section"><b>2. HÌNH ẢNH VẬT LÝ THỰC ĐỊA (PHYSICAL PROOF):</b><input type="file" accept="image/*" multiple onChange={e=>readFilePreview(e.target.files?.[0],(data)=>setDocForm(f=>({...f,proofImg:data})))} />{docForm.proofImg && <img src={docForm.proofImg} className="doc-preview" alt="Ảnh vật lý"/>}</div>
        <label className="missing-doc-check"><input type="checkbox" checked={docForm.missingReceipt} onChange={e=>setDocForm({...docForm,missingReceipt:e.target.checked})}/> ⚠ Báo cáo Mất Hóa Đơn Đỏ / Mua Tiểu Thương Lẻ</label>
        <div className="modal-actions"><button onClick={()=>setDocModalExpense(null)}>Hủy</button><button className="green-action-button" onClick={saveDocuments}>Lưu Chứng Từ</button></div>
      </div></div>}

      {cashModalOpen && <div className="field-modal-backdrop"><div className="cash-modal">
        <div className="field-modal-head"><h3>▣ Khai Báo Chi Tiền Mặt</h3><button onClick={()=>setCashModalOpen(false)}>✕</button></div>
        <div className="cash-limit"><span>Hạn mức tiền mặt ATM còn lại</span><strong>{money(remainingAtmCash)}</strong></div>
        <label>Mục đích chi thực địa:<input autoFocus placeholder="VD: Thuê xuồng máy chở nhu yếu phẩm..." value={newExpense.title} onChange={e=>setNewExpense({...newExpense,title:e.target.value})}/></label>
        <label>Số tiền (VNĐ):<input inputMode="numeric" placeholder="VD: 2000000" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense,amount:e.target.value.replace(/\D/g,"")})}/></label>
        <label>Gán loại quỹ:<select value={newExpense.fundType} onChange={e=>setNewExpense({...newExpense,fundType:e.target.value})}><option>CỐ ĐỊNH</option><option>LINH HOẠT</option></select></label>
        <div className="modal-actions"><button onClick={()=>setCashModalOpen(false)}>Hủy</button><button className="green-action-button" onClick={addCashExpense}>Ghi Nhận Chi</button></div>
      </div></div>}

      {reportOpen && <div className="field-report-modal"><div className="field-report-modal-card"><button className="modal-close" onClick={()=>setReportOpen(false)}>✕</button><div className="report-badge">THÔNG BÁO KẾT THÚC CHIẾN DỊCH</div><h2>THƯ CẢM ƠN QUÝ DONOR</h2><p>Chiến dịch <b>{campaign.title}</b> đã được tổng kết. Toàn bộ dữ liệu giải ngân được khóa sổ trong mô phỏng TrustFlow.</p><div className="report-summary"><span>Tổng ngân sách</span><b>{money(budgetTotal)}</b><span>Tổng chi thực tế</span><b>{money(totalSpent)}</b><span>Số dư</span><b>0đ</b></div><button onClick={()=>notify("Đã mô phỏng xuất Báo_Cáo_Tài_Chính_TrustFlow.pdf")}>TẢI FILE PDF ĐÓNG DẤU QUYẾT TOÁN</button></div></div>}
    </div>;
  }

  function Profile({user,transactions,joined,campaigns,created,setScreen,setSelected,setUser,logout,notify}) {
    const [editingName,setEditingName]=useState(false);
    const [nameDraft,setNameDraft]=useState(user?.name || "");
    const joinedCampaigns=campaigns.filter(c=>joined.includes(c.id));

    const changeAvatar=(e)=>{
      const file=e.target.files?.[0];
      if(!file) return;
      setUser(prev=>({...prev,avatar:URL.createObjectURL(file)}));
      notify("Đã cập nhật ảnh đại diện.");
    };
    const saveName=()=>{
      const clean=nameDraft.trim();
      if(!clean) return notify("Tên không được để trống.");
      setUser(prev=>({...prev,name:clean}));
      setEditingName(false);
      notify("Đã cập nhật tên hiển thị.");
    };

    return <div className="screen profile-screen">
      <header className="profile-topbar">
        <button className="profile-home-btn" onClick={()=>setScreen("dashboard")}><Icon name="home" size={19}/><span>Trang chủ</span></button>
        <strong>Cá nhân</strong><span/>
      </header>
      <div className="profile-wrap">
        <section className="profile-identity">
          <div className="avatar-editor">
            <img src={user?.avatar} alt="Ảnh đại diện"/>
            <label className="avatar-camera" title="Đổi ảnh đại diện"><Icon name="camera" size={17}/><input type="file" accept="image/png,image/jpeg,image/webp" onChange={changeAvatar}/></label>
          </div>
          <div className="profile-name-row">
            {editingName
              ? <div className="name-edit-row"><input value={nameDraft} autoFocus onChange={e=>setNameDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveName()}/><button onClick={saveName}><Icon name="check" size={17}/></button></div>
              : <><h1>{user?.name}</h1><button className="edit-name-btn" onClick={()=>{setNameDraft(user?.name||"");setEditingName(true)}}><Icon name="edit" size={17}/></button></>}
          </div>
          <div className="profile-id">ID: <b>{user?.id}</b></div>
          <div className="active-donor"><Icon name="check" size={17}/> DONOR TÍCH CỰC</div>
        </section>

        <section className="profile-stat">
          <div><small>TỔNG QUYÊN GÓP</small><b>{money(user?.totalDonated)}</b></div>
          <div><small>QUỸ THAM GIA</small><b className="green-number">{joinedCampaigns.length}</b></div>
        </section>

        <section className="profile-section">
          <button className="profile-action-card" onClick={()=>setScreen("profileJoined")}>
            <span className="action-icon blue-action"><Icon name="heart" size={24}/></span>
            <span><b>Danh sách quỹ đã tham gia</b><small>{joinedCampaigns.length} quỹ · Xem lại các chiến dịch bạn đã ủng hộ</small></span>
            <Icon name="back" size={20}/>
          </button>
        </section>

        <section className="profile-section created-section">
          <button className="profile-action-card" onClick={()=>setScreen("profileCreated")}>
            <span className="action-icon green-action"><Icon name="plus" size={26}/></span>
            <span><b>Danh sách quỹ đã tạo</b><small>{created.length} quỹ · Quản lý và điều hành chiến dịch của bạn</small></span>
            <Icon name="back" size={20}/>
          </button>
        </section>

        <section className="profile-section history-section">
          <div className="profile-section-title"><div><span>TRANSACTION</span><h2>Lịch sử quyên góp</h2></div></div>
          <div className="transaction-list">{transactions.map(tx=><div key={tx.id}><Icon name="check"/><div><b>{tx.campaign}</b><small>{tx.date}</small></div><strong>+{money(tx.amount)}</strong></div>)}</div>
        </section>
        <button className="logout" onClick={logout}><Icon name="logout"/>Đăng xuất</button>
      </div>
    </div>;
  }

  function AppShell({children,setScreen,screen:active}) {
    return <main className="app-page"><header className="app-header"><img src={logo} alt="TrustFlow AI"/><div className="mini-logo">TRUST<span>FLOW</span><b>AI</b></div></header>{children}<nav className="bottom-nav"><button className={active==="dashboard"?"active":""} onClick={()=>setScreen("dashboard")}><Icon name="home"/><span>Trang chủ</span></button><button onClick={()=>setScreen("createIntro")}><Icon name="heart"/><span>Tạo quỹ</span></button><button onClick={()=>setScreen("profileCreated")}><Icon name="file"/><span>Quản lý</span></button><button onClick={()=>setScreen("profile")}><Icon name="user"/><span>Cá nhân</span></button></nav></main>;
  }
}
