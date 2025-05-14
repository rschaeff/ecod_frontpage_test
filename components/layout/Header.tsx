// Create components/layout/Header.tsx
export default function Header({ activePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">ECOD</h1>
            <p className="hidden md:block ml-2 text-sm">Evolutionary Classification of Protein Domains</p>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/" isActive={activePage === 'home'}>Home</NavLink>
            <NavLink href="/tree" isActive={activePage === 'tree'}>Browse</NavLink>
            <NavLink href="/distribution" isActive={activePage === 'distribution'}>Download</NavLink>
            <NavLink href="/documentation" isActive={activePage === 'documentation'}>Help</NavLink>
            <NavLink href="http://prodata.swmed.edu/" external>Lab Homepage</NavLink>
          </nav>

          {/* Mobile menu button */}
          <MobileMenuButton open={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && <MobileMenu activePage={activePage} />}
      </div>
    </header>
  );
}

// Create components/layout/NavLink.tsx, components/layout/MobileMenuButton.tsx, etc.
