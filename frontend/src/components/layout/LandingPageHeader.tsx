import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navItems = [
    { name: 'Alur Pendaftaran', href: '#alur-pendaftaran' },
    { name: 'Pengumuman', href: '#pengumuman' },
    { name: 'Tentang Kami', href: '#aboutus' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Helpdesk', href: '#helpdesk' },
];

// Fungsi untuk smooth scroll
const scrollToSection = (id: string) => {
  const element = document.querySelector(id);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function LandingPageHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-white'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between">
      <button onClick={() => scrollToSection('#hero-section')} className="text-xl font-bold text-indigo-600">
        RSUD Hj Anna Lasmanah
      </button>

        {/* Navigasi untuk Desktop */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <button key={item.name} onClick={() => scrollToSection(item.href)} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {item.name}
            </button>
          ))}
        </nav>

        {/* Tombol Login dan Menu Mobile */}
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon"><Menu className="h-4 w-4" /></Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  {navItems.map((item) => (
                    <button key={item.name} onClick={() => scrollToSection(item.href)} className="text-muted-foreground hover:text-foreground">
                      {item.name}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}