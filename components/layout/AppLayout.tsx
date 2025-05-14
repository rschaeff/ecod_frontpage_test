'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Database, Download, HelpCircle, ExternalLink, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  activePage?: 'home' | 'browse' | 'download' | 'help' | 'protein' | 'domain' | 'search';
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
}

/**
 * AppLayout component provides consistent layout across the application
 */
export default function AppLayout({ children, activePage, breadcrumbs }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with navigation */}
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
      
      {/* Breadcrumb section */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-gray-500">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-blue-600">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-medium">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2014-2025 Grishin lab/HHMI/UTSW</p>
            <p className="text-sm mt-2 md:mt-0">Last database update: develop292 - 08302024</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
