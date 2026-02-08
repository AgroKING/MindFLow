import React from 'react';
import { Hero } from '../components/landing/Hero';
import { DailyQuote } from '../components/landing/DailyQuote';
import { Features } from '../components/landing/Features';
import { Testimonials } from '../components/landing/Testimonials';
import { Footer } from '../components/landing/Footer';

export const Home: React.FC = () => {
    return (
        <div className="bg-white">
            <Hero />
            <DailyQuote />
            <Features />
            <Testimonials />
            <Footer />
        </div>
    );
};
