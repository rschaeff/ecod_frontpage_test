'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Database, Download, HelpCircle, ExternalLink, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  activePage?: 'home' | 'browse' | 'download' | 'help' | 'protein' | 'domain' | 'search';
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  title?: string;
  subtitle?: string;
}

export default function AppLayout({
  children,
  activePage = 'home',
  breadcrumbs,
  title,
  subtitle
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Use the separate Header component */}
      <Header activePage={activePage} />
      
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
      
      {/* Page title section if title is provided */}
      {title && (
        <section className="bg-white border-b py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
        </section>
      )}

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Use the separate Footer component */}
      <Footer />
    </div>
  );
}
