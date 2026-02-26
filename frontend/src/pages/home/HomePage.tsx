// src/pages/home/HomePage.tsx
import { Steps, Carousel, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  CalendarOutlined, CheckCircleOutlined, HomeOutlined,
  PhoneOutlined, MailOutlined, UserOutlined, ArrowRightOutlined, StarOutlined,
} from "@ant-design/icons";
import heroBg from "../../assets/home.jpg";   

function FadeInOnScroll({ children, delay = 0}: {children: React.ReactNode, delay?: number}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y:0}}
      exit={{opacity: 0, y: 40}}
      viewport={{once: false, amount: 0.2}}
      transition={{duration: 0.8, delay, ease: "easeOut"}}>
      
      {children}

    </motion.div>
  );
}

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
          <FadeInOnScroll>
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
          </FadeInOnScroll>
        </div>

        {/* ── Search Bar horizontal  ── */}
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
      
      {/* Layanan Unggulan */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">

          <FadeInOnScroll>
            <p className="text-blue-700 text-sm font-semibold uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Layanan Unggulan Kami</h2>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <HomeOutlined className="text-2xl" />, title: "Cleaning Basic", desc: "Pembersihan menyeluruh untuk hunian Anda, dari ruang tamu hingga kamar tidur." },
              { icon: <CheckCircleOutlined className="text-2xl" />, title: "Cleaning Premium", desc: "Pembersihan menyeluruh tempat anda, cuman lebih premium aja." },
              { icon: <CalendarOutlined className="text-2xl" />, title: "Service Kandang Ayam", desc: "Pembersihan secara menyeluruh, kandang ayam anda, demi kesehatan ayam." },
            ].map((item) => (

              <FadeInOnScroll>
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
              </FadeInOnScroll>
            ))}
          </div>
          <FadeInOnScroll>
            <div className="mt-10 text-center">
              <button
                onClick={() => navigate("/services")}
                className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition-colors"
              >
                Lihat semua layanan <ArrowRightOutlined />
              </button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* CAROUSEL */}
      <section className="py-20 bg-white">
        
        <div className="max-w-5xl mx-auto px-6 mb-10">
          <p className="text-blue-700 text-sm font-semibold uppercase tracking-widest mb-2 text-center">Penawaran Spesial</p>
          <h2 className="text-3xl font-bold text-gray-900 text-center">Promo & Highlights</h2>
        </div>

        <Carousel autoplay autoplaySpeed={2500} dots arrows>
          {/* slide 1 */}
          <div>
            <div className="flex flex-col items-center justify-center text-white text-center px-8"
              style={{ height: "clamp(200px, 40vw, 380px)", background: "linear-gradient(to right, #1d4ed8, #3b82f6)" }}
              
            >
              <StarOutlined className="text-5xl mb-4 text-yellow-300" />
              <h3 className="text-2xl font-bold mb-2">Diskon 20% untuk Member Baru!</h3>
              <p className="text-blue-100 max-w-xl">Daftar sekarang dan nikmati harga spesial untuk booking pertama Anda</p>
            </div>
          </div>
          
          {/* slide 2 */}
          <div>
            <div className="flex flex-col items-center justify-center text-white text-center px-8"
              style={{ height: "clamp(200px, 40vw, 380px)", background: "linear-gradient(to right, #1e293b, #1e3a5f)" }}
            >
              <HomeOutlined className="text-5xl mb-4 text-blue-300" />
              <h3 className="text-2xl font-bold mb-2">Layanan Rumah & Kandang</h3>
              <p className="text-blue-100 max-w-xl">Tersedia berbagai paket cleaning untuk hunian dan area kandang Anda</p>
            </div>
          </div>

          {/* slide 3 */}
          <div>
            <div className="flex flex-col items-center justify-center text-white text-center px-8"
              style={{ height: "clamp(200px, 40vw, 380px)", background: "linear-gradient(to right, #0ea5e9, #06b6d4)" }}
            >
              <CheckCircleOutlined className="text-5xl mb-4 text-green-300" />
              <h3 className="text-2xl font-bold mb-2">Cleaner Profesional & Terpercaya</h3>
              <p className="text-blue-100 max-w-xl">Semua cleaner kami terlatih dan telah melalui proses seleksi ketat</p>
            </div>
          </div>

        </Carousel>
      </section>
      
      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <FadeInOnScroll>
          <p className="text-blue-700 text-sm font-semibold uppercase tracking-widest mb-2 text-center">Mudah & Cepat</p>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
        </FadeInOnScroll>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", icon: <UserOutlined className="text-2xl" />,         title: "Daftar & Login",  desc: "Buat akun gratis dan login ke platform kami." },
            { step: "02", icon: <HomeOutlined className="text-2xl" />,         title: "Pilih Layanan",   desc: "Pilih paket cleaning sesuai kebutuhan Anda." },
            { step: "03", icon: <CalendarOutlined className="text-2xl" />,     title: "Buat Booking",    desc: "Tentukan tanggal, waktu, dan alamat Anda." },
            { step: "04", icon: <CheckCircleOutlined className="text-2xl" />,  title: "Cleaner Datang",  desc: "Cleaner profesional datang tepat waktu." },
          ].map((item, index) => (
            <FadeInOnScroll key={item.step} delay={index * 0.15}>

              {/* Card */}
              <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center group hover:-translate-y-1">

                {/* Nomor step */}
                <span className="absolute top-4 right-4 text-xs font-bold text-gray-200 group-hover:text-blue-100 transition-colors"
                  style={{ fontSize: "2.5rem", lineHeight: 1 }}
                >
                  {item.step}
                </span>

                {/* Icon circle */}
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 mb-5 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>

                {/* Teks */}
                <h3 className="font-bold text-gray-900 mb-2 text-base">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>

                {/* Garis bawah accent */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 rounded-full group-hover:w-3/4 transition-all duration-300" />

              </div>

              {/* Arrow connector antar card — tidak muncul di card terakhir */}
              {index < 3 && (
                <div className="hidden md:flex justify-center items-center absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <ArrowRightOutlined className="text-blue-300 text-lg" />
                </div>
              )}

            </FadeInOnScroll>
          ))}
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
              <li className="flex items-center gap-2"><MailOutlined /><span>cleanpro@gmail.com</span></li>
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