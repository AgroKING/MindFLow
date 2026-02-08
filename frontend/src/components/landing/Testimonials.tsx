import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '../common/Card';

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Product Designer",
        content: "MindFlow has completely transformed my daily routine. The AI insights are incredibly accurate.",
        stars: 5
    },
    {
        name: "David Chen",
        role: "Software Engineer",
        content: "The most beautiful wellness app I've ever used. It feels like it was designed by Apple.",
        stars: 5
    },
    {
        name: "Elena Rodriguez",
        role: "Yoga Instructor",
        content: "I recommend this to all my students. The meditation guides are pure bliss.",
        stars: 5
    },
    {
        name: "Marcus Johnson",
        role: "Creative Director",
        content: "Finally, an app that understands that mental health is a journey, not a destination.",
        stars: 5
    }
];

export const Testimonials: React.FC = () => {
    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Loved by thousands</h2>
                <p className="text-lg text-gray-600">Join a community of mindful achievers.</p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="flex animate-marquee whitespace-nowrap gap-6 py-4">
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <Card key={index} variant="glass" className="w-[350px] p-6 flex-shrink-0 mx-2 hover:bg-white/80 transition-colors cursor-default">
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.stars)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 whitespace-normal leading-relaxed italic">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400" />
                                <div>
                                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap gap-6 py-4">
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <Card key={index} variant="glass" className="w-[350px] p-6 flex-shrink-0 mx-2 hover:bg-white/80 transition-colors cursor-default">
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.stars)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 whitespace-normal leading-relaxed italic">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400" />
                                <div>
                                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
