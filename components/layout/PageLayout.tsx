// Create components/layout/PageLayout.tsx
interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  activePage: 'home' | 'tree' | 'distribution' | 'documentation';
  breadcrumbs?: BreadcrumbItem[];
}

export default function PageLayout({
  title,
  subtitle,
  children,
  activePage,
  breadcrumbs
}: PageLayoutProps) {
  return (
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
    </div>
  );
}
