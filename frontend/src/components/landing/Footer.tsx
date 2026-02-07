import React from 'react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                            MindFlow
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            Empowering your mental wellness journey through technology and design.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Features</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Pricing</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Integrations</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">About</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Blog</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Careers</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-400">
                        &copy; 2026 MindFlow. All rights reserved.
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
