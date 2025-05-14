'use client';

import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { AppContextProvider } from '@/contexts/AppContextProvider';
import { ContextDebugger } from '@/utils/ContextDebugger';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  activePage: 'home' | 'tree' | 'distribution' | 'documentation' | 'protein' | 'domain' | 'search';
  breadcrumbs?: BreadcrumbItem[];
  showContextDebugger?: boolean;
}

/**
 * PageLayout - Main layout component that provides structure and context to all pages
 *
 * This component wraps all page content with the AppContextProvider to ensure
 * all child components have access to application contexts (Search, Tree, UserPreferences)
 */
export default function PageLayout({
  title,
  subtitle,
  children,
  activePage,
  breadcrumbs,
  showContextDebugger = process.env.NODE_ENV === 'development'
}: PageLayoutProps) {
  return (
    <AppContextProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header activePage={activePage} />

        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

        {/* Page title */}
        <section className="bg-white border-b py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
        </section>

        <main className="flex-grow">
          {children}
        </main>

        <Footer />

        {/* Only show the context debugger in development mode */}
        {showContextDebugger && <ContextDebugger />}
      </div>
    </AppContextProvider>
  );
}
