'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Database, Download, HelpCircle, ExternalLink, Menu, X } from 'lucide-react';

interface HeaderProps {
  activePage: 'home' | 'browse' | 'download' | 'help' | 'protein' | 'domain' | 'search';
}

/**
 * Header component for the ECOD application
 * Contains navigation links and responsive mobile menu
 */
export default function Header({ activePage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold hover:text-blue-100">ECOD</Link>
            <p className="hidden md:block ml-2 text-sm">Evolutionary Classification of Protein Domains</p>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/"
              className={`flex items-center ${activePage === 'home' ? 'text-blue-200 border-b-2 border-blue-200' : 'hover:text-blue-200'}`}
            >
              <Home className="mr-1 h-4 w-4" />
              Home
            </Link>
            <Link
              href="/tree"
              className={`flex items-center ${activePage === 'browse' ? 'text-blue-200 border-b-2 border-blue-200' : 'hover:text-blue-200'}`}
            >
              <Database className="mr-1 h-4 w-4" />
              Browse
            </Link>
            <Link
              href="/distribution"
              className={`flex items-center ${activePage === 'download' ? 'text-blue-200 border-b-2 border-blue-200' : 'hover:text-blue-200'}`}
            >
              <Download className="mr-1 h-4 w-4" />
              Download
            </Link>
            <Link
              href="/documentation"
              className={`flex items-center ${activePage === 'help' ? 'text-blue-200 border-b-2 border-blue-200' : 'hover:text-blue-200'}`}
            >
              <HelpCircle className="mr-1 h-4 w-4" />
              Help
            </Link>
            <a
              href="http://prodata.swmed.edu/"
              className="flex items-center hover:text-blue-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1 h-4 w-4" />
              Lab Homepage
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 hover:bg-blue-600 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-3">
            <Link
              href="/"
              className={`flex items-center ${activePage === 'home' ? 'text-blue-200 border-b border-blue-200' : 'hover:text-blue-200'} py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
            <Link
              href="/tree"
              className={`flex items-center ${activePage === 'browse' ? 'text-blue-200 border-b border-blue-200' : 'hover:text-blue-200'} py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Database className="mr-2 h-5 w-5" />
              Browse
            </Link>
            <Link
              href="/distribution"
              className={`flex items-center ${activePage === 'download' ? 'text-blue-200 border-b border-blue-200' : 'hover:text-blue-200'} py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Download className="mr-2 h-5 w-5" />
              Download
            </Link>
            <Link
              href="/documentation"
              className={`flex items-center ${activePage === 'help' ? 'text-blue-200 border-b border-blue-200' : 'hover:text-blue-200'} py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="mr-2 h-5 w-5" />
              Help
            </Link>
            <a
              href="http://prodata.swmed.edu/"
              className="flex items-center hover:text-blue-200 py-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Lab Homepage
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
