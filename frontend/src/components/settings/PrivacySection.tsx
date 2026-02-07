import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ToggleSwitch } from './ToggleSwitch';
import { Modal } from '../common/Modal';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

export const PrivacySection: React.FC = () => {
    const [dataSharing, setDataSharing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <>
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Privacy & Security</h2>

                <div className="divide-y divide-gray-100">
                    <ToggleSwitch
                        checked={dataSharing}
                        onChange={setDataSharing}
                        label="Anonymous Data Sharing"
                        description="Help improve MindFlow by sharing anonymized usage data"
                    />
                </div>

                <div className="mt-6 space-y-3">
                    <Button variant="secondary" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                    </Button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete My Account
                    </button>
                </div>
            </Card>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
                footer={
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700">Delete Account</Button>
                    </div>
                }
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-gray-700 mb-2">
                            Are you sure you want to delete your account? This action is <strong>permanent</strong> and cannot be undone.
                        </p>
                        <p className="text-sm text-gray-500">
                            All your journal entries, mood logs, and progress data will be permanently deleted.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
};
