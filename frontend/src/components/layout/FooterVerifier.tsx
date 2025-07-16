export default function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="w-full border-t bg-background">
        <div className="container flex items-center justify-center py-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Manajemen Lamaran RSUD. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    );
  }