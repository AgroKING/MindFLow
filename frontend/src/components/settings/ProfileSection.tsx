import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Camera, Save } from 'lucide-react';

export const ProfileSection: React.FC = () => {
    const [name, setName] = useState('Alex Johnson');
    const [email, setEmail] = useState('alex@example.com');
    const [bio, setBio] = useState('Mental wellness enthusiast. Daily journaler.');

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Profile</h2>

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
                <div>
                    <p className="font-medium">Profile Photo</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                    <Button variant="secondary">Change Password</Button>
                </div>
            </div>
        </Card>
    );
};
