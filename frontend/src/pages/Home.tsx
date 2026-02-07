import React from 'react';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Testimonials } from '../components/landing/Testimonials';
import { Footer } from '../components/landing/Footer';

export const Home: React.FC = () => {
    return (
        <div className="bg-white">
            <Hero />
            <Features />
            <Testimonials />
            <Footer />
        </div>
    );
};
