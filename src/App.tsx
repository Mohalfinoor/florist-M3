import { motion, AnimatePresence } from "motion/react";
import { 
  Instagram, 
  MessageCircle, 
  MapPin, 
  Star,
  Phone,
  ChevronLeft,
  X,
  Target
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from 'leaflet';

// Fix Leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  const markerRef = useRef<L.Marker>(null);
  
  useMapEvents({
    click(e) {
      if (position === null) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  const eventHandlers = useRef({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latlng = marker.getLatLng();
        setPosition([latlng.lat, latlng.lng]);
      }
    },
  });

  return position === null ? null : (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers.current}
      position={position} 
      ref={markerRef}
    />
  );
}

type Product = {
  size: string;
  price: string;
  image: string;
};

const CatalogItem = ({ size, price, image, onClick }: { size: string, price: string, image: string, onClick: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    onClick={onClick}
    className="flex flex-col items-center group cursor-pointer [perspective:1000px]"
  >
    {/* Image Container - 3D Square Frame */}
    <motion.div 
      whileHover={{ 
        rotateY: 10, 
        rotateX: -5,
        z: 20,
        scale: 1.1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full aspect-square bg-white rounded-2xl mb-4 overflow-hidden shadow-lg border border-gray-100 transition-shadow duration-300 group-hover:shadow-2xl relative [transform-style:preserve-3d]"
    >
      <img 
        src={`/images/produk/${image}`} 
        alt={`Produk ${size}`}
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
      
      {/* Decorative inner frame with depth */}
      <div className="absolute inset-2 border-2 border-white/20 rounded-xl pointer-events-none z-10 [transform:translateZ(10px)]" />
      
      {/* Dynamic Glossy move */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 z-20 pointer-events-none"
        initial={{ x: '-100%', y: '-100%' }}
        whileHover={{ x: '100%', y: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.div>
    
    {/* Product Info - Refined with staggered appearance */}
    <div className="text-center w-full space-y-1">
      <h3 className="font-black text-[11px] text-gray-800 uppercase tracking-widest">
        {size}
      </h3>
      <div className="px-4 py-1 bg-red-600 rounded-full inline-block shadow-md">
        <p className="text-white font-black text-[12px] whitespace-nowrap tracking-tight">
          {price}
        </p>
      </div>
    </div>
  </motion.div>
);

const OrderPage = ({ product, onBack }: { product: Product, onBack: () => void }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("DUKA CITA");
  const [orderDetail, setOrderDetail] = useState({
    targetName: "",
    senderName: "",
    greeting: "",
    whatsapp: "",
    deliveryTime: "",
    address: ""
  });
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([-5.1476, 119.4327]); // Default Makassar
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["DUKA CITA", "UCAPAN SELAMAT", "PERNIKAHAN", "HARI SPESIAL"];

  const getLabelByCat = () => {
    switch (selectedCategory) {
      case "DUKA CITA": return "Nama Almarhum/Almarhumah";
      case "PERNIKAHAN": return "Nama Pengantin";
      default: return "Nama Penerima";
    }
  };

  const handleFinish = () => {
    const message = `Halo Tiga M Florist, saya ingin memesan karangan bunga.\n\nDetail:\n- Ukuran: ${product.size}\n- Kategori: ${selectedCategory}\n- ${getLabelByCat()}: ${orderDetail.targetName}\n- Pengirim: ${orderDetail.senderName}\n- Ucapan: ${orderDetail.greeting}\n- Alamat: ${orderDetail.address}\n- Waktu: ${orderDetail.deliveryTime}\n- HP: ${orderDetail.whatsapp}\n- Desain Custom: ${designFile ? 'Ada' : 'Tidak'}`;
    window.open(`https://wa.me/6281257374628?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto"
    >
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <h2 className="text-[14px] font-black tracking-[0.2em] text-gray-900 uppercase flex-1 text-center mr-10 italic">
            UKURAN {product.size}
          </h2>
        </div>

        {/* Category Tabs & Content Box */}
        <div className="bg-white border-2 border-gray-100 rounded-[1.2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 py-3 px-1 text-[8px] font-black tracking-wider transition-all border-r border-gray-100 last:border-r-0 ${
                  selectedCategory === cat 
                    ? 'bg-white text-gray-900 shadow-[inset_0_-2px_0_#000]' 
                    : 'text-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-800 text-[16px]">Isi Karangan Bunga</h3>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all shadow-md ${
                  designFile ? 'bg-green-500 text-white' : 'bg-[#5b78c1] text-white'
                }`}
              >
                {designFile ? 'TERUPLOAD' : 'DESAIN MU'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 block">{getLabelByCat()}:</label>
                <input 
                  type="text" 
                  value={orderDetail.targetName}
                  onChange={(e) => setOrderDetail({...orderDetail, targetName: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 shadow-sm focus:border-blue-300 outline-none transition-all text-sm font-bold bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 block">Nama Pengirim:</label>
                <input 
                  type="text" 
                  value={orderDetail.senderName}
                  onChange={(e) => setOrderDetail({...orderDetail, senderName: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 shadow-sm focus:border-blue-300 outline-none transition-all text-sm font-bold bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 block">Teks Ucapan:</label>
                <input 
                  type="text" 
                  placeholder="(Opsional)"
                  value={orderDetail.greeting}
                  onChange={(e) => setOrderDetail({...orderDetail, greeting: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 shadow-sm focus:border-blue-300 outline-none transition-all text-sm font-bold bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Pengirim Form */}
        <div className="bg-white border-2 border-gray-100 rounded-[1.2rem] p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h3 className="font-black text-gray-800 text-[16px]">Informasi Pengirim</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 block">Nomor WhatsApp Pengirim:</label>
              <input 
                type="tel" 
                value={orderDetail.whatsapp}
                onChange={(e) => setOrderDetail({...orderDetail, whatsapp: e.target.value})}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 shadow-sm focus:border-blue-300 outline-none transition-all text-sm font-bold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 block">Waktu Pengiriman:</label>
              <input 
                type="text" 
                value={orderDetail.deliveryTime}
                onChange={(e) => setOrderDetail({...orderDetail, deliveryTime: e.target.value})}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 shadow-sm focus:border-blue-300 outline-none transition-all text-sm font-bold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 block">Alamat Pengiriman:</label>
              <div className="flex gap-2">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMap(true)}
                  type="button"
                  title="Pilih Lokasi di Peta"
                  className="w-12 h-12 rounded-xl bg-white border-2 border-gray-100 flex items-center justify-center shrink-0 shadow-sm active:bg-gray-50 transition-colors"
                >
                  <MapPin size={20} className="text-red-500" />
                </motion.button>
                <input 
                  type="text" 
                  value={orderDetail.address}
                  onChange={(e) => setOrderDetail({...orderDetail, address: e.target.value})}
                  className="flex-1 h-12 px-4 rounded-xl border-2 border-gray-100 shadow-sm focus:border-blue-300 outline-none transition-all text-sm font-bold bg-white"
                  placeholder="Ketik alamat atau klik pin"
                />
              </div>
              
              {/* Map Interaction Dialog */}
              <AnimatePresence>
                {showMap && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                    >
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-black text-gray-800 text-sm italic">PILIH TITIK PENGIRIMAN</h3>
                        <button 
                          onClick={() => setShowMap(false)}
                          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="w-full h-80 bg-gray-100 relative">
                        <MapContainer 
                          center={mapPosition} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <LocationMarker position={markerPosition} setPosition={setMarkerPosition} />
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              if ("geolocation" in navigator) {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                  setMapPosition([pos.coords.latitude, pos.coords.longitude]);
                                  setMarkerPosition([pos.coords.latitude, pos.coords.longitude]);
                                });
                              }
                            }}
                            className="absolute bottom-5 right-5 z-[500] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-500 hover:bg-gray-50 transition-colors border border-gray-100"
                          >
                            <Target size={20} />
                          </button>
                        </MapContainer>
                      </div>

                      <div className="p-5 space-y-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                          Klik pada peta untuk menaruh titik lokasi
                        </p>
                        <button 
                          disabled={!markerPosition}
                          onClick={() => {
                            if (markerPosition) {
                              setOrderDetail({
                                ...orderDetail,
                                address: `${markerPosition[0].toFixed(5)}, ${markerPosition[1].toFixed(5)}`
                              });
                              setShowMap(false);
                            }
                          }}
                          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
                            markerPosition 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          Konfirmasi Lokasi
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animated Static Preview for input */}
              <AnimatePresence>
                {orderDetail.address && !showMap && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 160, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="w-full rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50 mt-2"
                  >
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }}
                      loading="lazy"
                      srcDoc={`
                        <style>body{margin:0;overflow:hidden}</style>
                        <iframe width="100%" height="160" frameborder="0" src="https://maps.google.com/maps?q=${encodeURIComponent(orderDetail.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>
                      `}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleFinish}
            className="w-full h-14 bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] rounded-2xl shadow-[0_8px_30px_-5px_rgba(59,130,246,0.6)] flex items-center justify-center border-b-4 border-blue-600 active:border-b-0 transition-all"
          >
            <span className="text-white font-black uppercase tracking-[0.2em] text-[15px]">Selesai</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'order'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const catalogItems: Product[] = [
    { size: "2 x 4 Meter", price: "2.000.000", image: "2 x 4.png" },
    { size: "2 x 3 Meter", price: "1.000.000", image: "2 x 3.png" },
    { size: "2 x 2.5 Meter", price: "750.000", image: "2 x 2,5.png" },
    { size: "2 x 2 Meter", price: "500.000", image: "2 x 2.png" },
    { size: "2 x 1.5 Meter", price: "350.000", image: "2 x 1,5.png" },
  ];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('order');
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AnimatePresence>
        {currentPage === 'order' && selectedProduct && (
          <OrderPage 
            product={selectedProduct} 
            onBack={() => setCurrentPage('home')} 
          />
        )}
      </AnimatePresence>
      <div className="max-w-md mx-auto px-6 py-10 space-y-10">
        
        {/* Header */}
        <header className="text-center">
          <h1 className="text-lg font-black tracking-[0.3em] text-gray-900 uppercase">
            TIGA M FLORIST
          </h1>
          <div className="h-0.5 w-12 bg-red-500 mx-auto mt-2" />
        </header>

        {/* Welcome Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Selamat Datang!</h2>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-[1.8/1] bg-gradient-to-br from-red-600 to-red-700 rounded-[2rem] shadow-xl shadow-red-100 flex items-center justify-center p-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 border border-white/30">
               <span className="text-[9px] font-black uppercase tracking-widest">Layanan 24/7</span>
            </div>
            <div className="text-center z-10 space-y-1">
              <p className="font-black text-3xl leading-none uppercase tracking-tighter italic">Gratis Ongkir!</p>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Khusus Area Kota Makassar</p>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          </motion.div>
        </section>

        {/* Catalog Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-gray-100 pb-2">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Katalog</h2>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Daftar Harga</span>
          </div>

          <div className="grid grid-cols-6 gap-x-4 gap-y-8">
            {/* First row: 3 items */}
            {catalogItems.slice(0, 3).map((item, i) => (
              <div key={i} className="col-span-2">
                <CatalogItem 
                  image={item.image} 
                  size={item.size} 
                  price={`Rp ${item.price}`} 
                  onClick={() => handleProductClick(item)}
                />
              </div>
            ))}

            {/* Second row: 2 items, centered */}
            <div className="col-start-2 col-span-2">
              <CatalogItem 
                image={catalogItems[3].image} 
                size={catalogItems[3].size} 
                price={`Rp ${catalogItems[3].price}`} 
                onClick={() => handleProductClick(catalogItems[3])}
              />
            </div>
            <div className="col-span-2">
              <CatalogItem 
                image={catalogItems[4].image} 
                size={catalogItems[4].size} 
                price={`Rp ${catalogItems[4].price}`} 
                onClick={() => handleProductClick(catalogItems[4])}
              />
            </div>
          </div>
        </section>

        {/* Contact/Social Channels Hub */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Hubungi Kami</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-green-600 uppercase">Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <motion.a 
              href="https://www.instagram.com/tigam.floristmakassar/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-[0_8px_20px_-4px_rgba(238,42,123,0.5)] relative overflow-hidden group"
            >
              <Instagram size={24} strokeWidth={2.5} className="z-10" />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>

            {/* WhatsApp Main Button */}
            <motion.a 
              href="https://wa.me/6281257374628"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-[1.5rem] bg-gradient-to-r from-[#25D366] to-[#128C7E] flex items-center justify-center gap-3 text-white font-black shadow-[0_8px_25px_-5px_rgba(37,211,102,0.5)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="z-10 drop-shadow-md">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.122.554 4.197 1.604 6.02L0 24l6.133-1.61a11.776 11.776 0 005.912 1.586h.005c6.632 0 12.028-5.396 12.033-12.034a11.81 11.81 0 00-3.417-8.475z"/>
              </svg>
              <span className="uppercase tracking-[0.1em] text-xs z-10">Chat Sekarang</span>
            </motion.a>

            {/* TikTok */}
            <motion.button 
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-[1.5rem] bg-black flex items-center justify-center text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] relative overflow-hidden group border border-white/5"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#fe2c55]/20 via-transparent to-[#25f4ee]/20" />
            </motion.button>
          </div>
        </section>

        {/* Location Section - Integrated Address & Map */}
        <section className="space-y-3">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="w-full bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col"
          >
            {/* Map Header */}
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <MapPin size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Workshop Kami</h4>
                <p className="text-xs text-gray-700 font-bold leading-relaxed">
                  JL. Manuruki, No. 4-A, Mangasa, Tamalate, <span className="text-red-500">Mannuruki</span>
                </p>
              </div>
            </div>

            {/* Integrated Map */}
            <div className="w-full h-48 border-t border-gray-50 bg-gray-50 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22876.734728050775!2d119.43837652531259!3d-5.1726411033895605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee287ea39a835%3A0xedbbaa510d49f80e!2sTk.%20Kembang%20Tiga!5e1!3m2!1sid!2sid!4v1777487933507!5m2!1sid!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
                className="grayscale-[0.2] contrast-[1.1]"
              />
              {/* Optional: subtle overlay to make it feel more "app-like" */}
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
            </div>
            
            <div className="p-3 text-center bg-gray-50/50">
               <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Makassar, Sulawesi Selatan</span>
            </div>
          </motion.div>
        </section>

        {/* Portfolio Section */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Portofolio Kami</h2>
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Geser untuk melihat</p>
          </div>
          
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 -mx-6 px-6">
            {[
              {
                title: "Penghormatan Terakhir dari Presiden",
                desc: "\"Sebuah kehormatan bagi kami dipercaya oleh Presiden Joko Widodo & Keluarga untuk menyampaikan simpati mendalam bagi keluarga almarhum H. Djalaluddin Parawansa. Kami memastikan setiap detail desain mencerminkan rasa hormat yang tulus dan ketulusan hati pengirimnya.\"",
                role: "Presiden RI ke-7",
                abbr: "JOKOWI",
                color: "bg-red-600",
                image: "Joko Widodo & Keluarga.jpg"
              },
              {
                title: "Restu dari Wakil Presiden",
                desc: "\"Kehangatan ucapan Happy Wedding untuk Ayu & Zulfikar hadir langsung dari Bapak Drs. H.M. Jusuf Kalla. Rangkaian bunga papan yang megah dengan perpaduan warna yang ceria menjadi saksi doa restu dari salah satu tokoh besar kebanggaan Sulawesi Selatan.\"",
                role: "Wakil Presiden RI ke-10 & 12",
                abbr: "JK",
                color: "bg-green-600",
                image: "Drs. H.M. Jusuf Kalla.jpg"
              },
              {
                title: "Doa Bahagia dari Sang Teknokrat",
                desc: "\"Momen bahagia Ayu & Zulfikar semakin istimewa dengan kehadiran ucapan selamat dari Presiden RI Ke-3, Bapak B.J. Habibie. Desain yang penuh warna dan detail ornamen merpati menjadi simbol kebahagiaan yang tak terhingga dalam sebuah ikatan suci.\"",
                role: "Presiden RI ke-3",
                abbr: "HABIBIE",
                color: "bg-blue-600",
                image: "B.J. Habibie.jpg"
              }
            ].map((item, i) => (
              <div key={i} className="min-w-[85%] snap-center">
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-md transition-shadow relative">
                  <div className={`w-full aspect-[16/9] ${item.color} flex items-center justify-center relative overflow-hidden`}>
                    <img 
                      src={`/images/portofolio/${item.image}`}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                    />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)] z-0" />
                    <Star size={80} className="absolute -right-5 -bottom-5 text-white/10 rotate-12" fill="currentColor" />
                    <div className="text-center z-20">
                       <span className="block text-white font-black text-2xl uppercase tracking-[0.2em] opacity-30 mb-1">{item.abbr}</span>
                       <span className="text-white font-bold text-[9px] uppercase tracking-widest border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm">PROYEK VVIP</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="inline-block px-2 py-0.5 bg-red-50 text-red-600 rounded text-[8px] font-black uppercase tracking-widest leading-none">
                      {item.role}
                    </div>
                    <h4 className="text-[14px] font-black text-gray-900 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 italic leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Review Section - Google Maps Style */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Ulasan</h2>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black text-gray-800">4.1</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={8} className={`${i < 4 ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
              <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">(13 ulasan)</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { 
                name: "Teuku S", 
                time: "7 tahun lalu", 
                text: "Best florist Makassar. They are favorited by the local government.",
                stars: 5,
                avatar: "TS"
              },
              { 
                name: "Muhammad Rizal", 
                time: "8 tahun lalu", 
                text: "Banyak langganannya",
                stars: 5,
                avatar: "MR"
              },
              { 
                name: "Ardianto Mulfa (paddy)", 
                time: "Setahun lalu", 
                text: "stabil",
                stars: 4,
                avatar: "AM"
              },
              { 
                name: "Yuiop Fte", 
                time: "8 tahun lalu", 
                text: "Kreatif..👍👍👍 …",
                stars: 5,
                avatar: "YF"
              }
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                      <span className="text-[10px] font-black text-red-400">{review.avatar}</span>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{review.name}</h4>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{review.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(review.stars)].map((_, i) => (
                        <Star key={i} size={10} className="fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                    {/* Google Icon Placeholder */}
                    <div className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                      <svg viewBox="0 0 24 24" width="8" height="8" fill="#4285F4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium italic border-l-2 border-red-100 pl-3">
                  "{review.text}"
                </p>
              </motion.div>
            ))}
            
            <div className="text-center pt-2">
              <a 
                href="https://www.google.com/maps/place/Tk.+Kembang+Tiga/@-5.1727117,119.4377383,5572m/data=!3m1!1e3!4m8!3m7!1s0x2dbee287ea39a835:0xedbbaa510d49f80e!8m2!3d-5.1779496!4d119.4282919!9m1!1b1!16s%2Fg%2F1pzt3v1t4?entry=ttu&g_ep=EgoyMDI2MDQyNi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] hover:underline decoration-2 underline-offset-4 inline-block"
              >
                Lihat semua ulasan di Google
              </a>
            </div>
          </div>
        </section>

        <footer className="text-center py-6">
          <p className="text-[10px] text-gray-300">© 2024 Tiga M Florist</p>
        </footer>
      </div>
    </div>
  );
}
