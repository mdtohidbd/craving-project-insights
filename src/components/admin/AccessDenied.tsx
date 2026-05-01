import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
    reason?: 'global' | 'permission';
    moduleName?: string;
}

const AccessDenied = ({ reason = 'permission', moduleName }: AccessDeniedProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 shadow-inner">
                <ShieldOff className="w-10 h-10 text-rose-400" />
            </div>

            <h2 className="text-2xl font-black text-neutral-900 mb-2">
                {reason === 'global' ? 'Module Disabled' : 'Access Restricted'}
            </h2>

            <p className="text-neutral-500 text-sm max-w-sm leading-relaxed mb-8">
                {reason === 'global' ? (
                    <>
                        The <span className="font-semibold text-neutral-700">{moduleName || 'requested'}</span> module
                        has been globally disabled by a superadmin. Contact your administrator to re-enable it.
                    </>
                ) : (
                    <>
                        You don't have permission to access the{' '}
                        <span className="font-semibold text-neutral-700">{moduleName || 'requested'}</span> module.
                        Ask a superadmin to grant you access.
                    </>
                )}
            </p>

            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
            >
                <ArrowLeft className="w-4 h-4" />
                Go Back
            </button>
        </div>
    );
};

export default AccessDenied;
