import React from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, FlaskConical, Rocket, Volume2, Smartphone } from 'lucide-react';

export const Playground: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold text-foreground">Design System Playground</h1>
                <p className="text-muted-foreground text-lg">
                    Current Theme: <span className="font-semibold capitalize text-primary">{theme}</span>
                </p>
                <p className="text-sm text-muted-foreground/80">
                    Interact with elements to feel the emotional design.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Buttons
                </h2>
                <Card className="p-8 space-y-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary">Primary Action</Button>
                        <Button variant="secondary">Secondary Action</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                        <Button size="icon"><Rocket className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button isLoading>Loading</Button>
                        <Button disabled>Disabled</Button>
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    Inputs
                </h2>
                <Card className="p-8 grid gap-4 max-w-xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Standard Input</label>
                        <Input placeholder="Type something..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Disabled Input</label>
                        <Input disabled placeholder="Can't touch this" />
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    Cards
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold mb-2">Default Card</h3>
                        <p className="text-muted-foreground">Standard card with subtle shadow and border. Adapts to theme variables.</p>
                    </Card>
                    <Card variant="glass">
                        <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
                        <p className="text-muted-foreground">Frosted glass effect. Great for overlays or modern feel.</p>
                    </Card>
                    <Card variant="gradient">
                        <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
                        <p className="text-muted-foreground">Subtle gradient background for emphasis.</p>
                    </Card>
                    <Card variant="neo">
                        <h3 className="text-lg font-semibold mb-2">Neo-Brutalism / Pop</h3>
                        <p className="text-muted-foreground">High contrast, hard shadows. Very distinct.</p>
                    </Card>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-primary" />
                    Sensory Feedback
                </h2>
                <Card className="p-6">
                    <div className="flex gap-4 items-center">
                        <Button onClick={() => { }}>Click for Sound</Button>
                        <p className="text-sm text-muted-foreground">
                            (Enable sound in the theme switcher to hear theme-specific effects)
                        </p>
                    </div>
                </Card>
            </section>
        </div>
    );
};
