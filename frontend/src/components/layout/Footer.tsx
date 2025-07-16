// frontend/src/components/layout/Footer.tsx

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe, Youtube } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Kolom 1: Tentang Kami */}
          <div>
            <h3 className="text-lg font-bold mb-4">RSUD Hj. Anna Lasmanah</h3>
            <p className="text-gray-400 text-sm">
              Berkomitmen memberikan pelayanan kesehatan terbaik, profesional, dan terpercaya bagi seluruh masyarakat Banjarnegara dan sekitarnya.
            </p>
          </div>

          {/* Kolom 2: Link Cepat */}
          <div>
            <h3 className="text-lg font-bold mb-4">Navigasi</h3>
            <ul className="space-y-2">
              <li><Link to="https://rsud.banjarnegarakab.go.id/sejarah/" className="text-gray-400 hover:text-white text-sm">Tentang Kami</Link></li>
              <li><Link to="/formasi" className="text-gray-400 hover:text-white text-sm">Lowongan</Link></li>
              <li><Link to="/contact-us" className="text-gray-400 hover:text-white text-sm">Kontak Kami</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hubungi Kami</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-1 flex-shrink-0" />
                <span>Jl. Jend. Sudirman No.42, Kutabanjarnegara, Kec. Banjarnegara, Kab. Banjarnegara, Jawa Tengah 53474</span>
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-3" />
                <span>(0286) 591464</span>
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-3" />
                <span>rsud@banjarnegarakab.go.id</span>
              </p>
              <p className="flex items-center">
                <Globe className="h-4 w-4 mr-3" />
                <a href="https://rsud.banjarnegarakab.go.id/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  rsud.banjarnegarakab.go.id
                </a>
              </p>

            </div>
          </div>
          
          {/* Kolom 4: Media Sosial */}
          <div>
            <h3 className="text-lg font-bold mb-4">Ikuti Kami</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/rsudhalbna/" className="text-gray-400 hover:text-white"><Facebook /></a>
              <a href="https://www.youtube.com/@rsudhj.annalasmanah7906" className="text-gray-400 hover:text-white"><Youtube /></a>
              <a href="https://www.instagram.com/rsudhal/" className="text-gray-400 hover:text-white"><Instagram /></a>
              <a href="https://www.tiktok.com/@rsudhj.annalasmanah" aria-label="TikTok" className="text-gray-400 hover:text-white font-bold text-xl">TikTok</a>
        </div>
          </div>

        </div>
        
        {/* Garis pemisah dan Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Manajemen Lamaran RSUD. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}