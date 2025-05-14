'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Footer component for the ECOD application
 */
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-2">ECOD</h2>
            <p className="text-gray-400">Evolutionary Classification of Protein Domains</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Resources</h3>
              <ul className="text-gray-400 space-y-2">
                <li><Link href="/tree" className="hover:text-white">Browse</Link></li>
                <li><Link href="/distribution" className="hover:text-white">Download</Link></li>
                <li><Link href="/search" className="hover:text-white">Search</Link></li>
                <li><Link href="/documentation" className="hover:text-white">Help</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Related</h3>
              <ul className="text-gray-400 space-y-2">
                <li><a href="http://prodata.swmed.edu/" className="hover:text-white">Grishin Lab</a></li>
                <li><a href="https://www.hhmi.org/" className="hover:text-white">HHMI</a></li>
                <li><a href="https://www.utsouthwestern.edu/" className="hover:text-white">UTSW</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact</h3>
              <ul className="text-gray-400 space-y-2">
                <li><a href="mailto:contact@ecod.org" className="hover:text-white">Email Us</a></li>
                <li><a href="https://github.com/UT-HHMI-Grishin-Lab/ECOD/issues" className="hover:text-white">Report Issues</a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2014-2025 Grishin lab/HHMI/UTSW</p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Last database update: develop292 - 08302024
          </p>
        </div>
      </div>
    </footer>
  );
}
