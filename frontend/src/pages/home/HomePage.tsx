// src/pages/home/HomePage.tsx
import { Steps } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarOutlined, CheckCircleOutlined, HomeOutlined,
  PhoneOutlined, MailOutlined, UserOutlined, ArrowRightOutlined,
} from "@ant-design/icons";
import heroBg from "../../assets/home.jpg";         

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBookNow = () => {
    navigate(isAuthenticated ? "/services" : "/login");
  };

  return (
    <div className="min-h-screen">

      
      <section
        className="relative w-full flex flex-col justify-end"
        style={{ height: "100vh", minHeight: 600 }}
      >
        {/* Background foto */}
        <img
          src={heroBg}
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover"
          
        />

        
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%)" }}
          
        />

        {/* Konten hero */}
        <div className="relative z-10 px-8 pb-20 max-w-3xl">
          <p className="text-white/70 uppercase tracking-widest text-sm mb-3 font-medium">
            Professional Cleaning Service
          </p>
          <h1 className="text-white font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            
          >
            Rumah Bersih,<br />Hidup Lebih Nyaman.
          </h1>
          <button
            onClick={handleBookNow}
            className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-all shadow-lg text-base"
          >
            Book Sekarang <ArrowRightOutlined />
          </button>
        </div>

        {/* ── Search Bar horizontal — menempel di bawah hero ── */}
        <div className="relative z-10 w-full bg-white shadow-2xl px-6 py-5">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-3">

            {/* Field 1: Layanan */}
            <div className="flex-1 border-r border-gray-200 px-4">
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">LAYANAN</p>
              <input
                className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
                placeholder="Cari layanan cleaning..."
              />
            </div>

            {/* Field 2: Tanggal */}
            <div className="flex-1 border-r border-gray-200 px-4">
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">TANGGAL</p>
              <input
                type="date"
                className="w-full outline-none text-gray-700 text-sm bg-transparent"
              />
            </div>

            {/* Field 3: Lokasi */}
            <div className="flex-1 px-4">
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">LOKASI</p>
              <input
                className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
                placeholder="Masukkan kota / area..."
              />
            </div>

            {/* Tombol Search */}
            <button
              onClick={handleBookNow}
              className="bg-blue-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-800 transition-all whitespace-nowrap"
            >
              Cari Layanan
            </button>

          </div>
        </div>

      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-700 text-sm font-semibold uppercase tracking-widest mb-2">What We Offer</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Layanan Unggulan Kami</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <HomeOutlined className="text-2xl" />, title: "Home Cleaning", desc: "Pembersihan menyeluruh untuk hunian Anda, dari ruang tamu hingga kamar tidur." },
              { icon: <CheckCircleOutlined className="text-2xl" />, title: "Office Cleaning", desc: "Lingkungan kantor bersih dan produktif dengan jadwal fleksibel." },
              { icon: <CalendarOutlined className="text-2xl" />, title: "Deep Cleaning", desc: "Pembersihan intensif untuk area yang membutuhkan perhatian ekstra." },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate("/services")}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 mb-4 group-hover:bg-blue-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition-colors"
            >
              Lihat semua layanan <ArrowRightOutlined />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-700 text-sm font-semibold uppercase tracking-widest mb-2 text-center">Mudah & Cepat</p>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <Steps
            direction="vertical"
            current={-1}
            items={[
              { title: <span className="font-bold text-gray-900">Daftar & Login</span>,       description: "Buat akun gratis dan login ke platform kami.",                                        icon: <UserOutlined className="text-blue-600" /> },
              { title: <span className="font-bold text-gray-900">Pilih Layanan</span>,        description: "Pilih paket cleaning yang sesuai dengan kebutuhan Anda.",                            icon: <HomeOutlined className="text-blue-600" /> },
              { title: <span className="font-bold text-gray-900">Buat Booking</span>,         description: "Tentukan tanggal, waktu, dan alamat yang Anda inginkan.",                            icon: <CalendarOutlined className="text-blue-600" /> },
              { title: <span className="font-bold text-gray-900">Cleaner Datang</span>,       description: "Cleaner profesional kami akan datang tepat waktu dan bekerja dengan standar tinggi.", icon: <CheckCircleOutlined className="text-blue-600" /> },
            ]}
          />
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">CleanPro</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Solusi kebersihan profesional untuk rumah dan kantor Anda. Bersih, nyaman, dan terpercaya.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-200">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {[["Home", "/"], ["Services", "/services"], ["Login", "/login"]].map(([label, path]) => (
                <li key={label} className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate(path)}>{label}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-200">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><PhoneOutlined /><span>+62 812 3456 7890</span></li>
              <li className="flex items-center gap-2"><MailOutlined /><span>hello@cleanpro.com</span></li>
              <li className="flex items-center gap-2"><HomeOutlined /><span>Jakarta, Indonesia</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          © 2026 CleanPro. All rights reserved.
        </div>
      </footer>

    </div>
  );
}