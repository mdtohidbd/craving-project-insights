import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModules } from '../../context/ModuleContext';
import AccessDenied from './AccessDenied';

interface ModuleGuardProps {
    moduleId: string;
    children: React.ReactNode;
}

/**
 * ModuleGuard wraps a page component and enforces two checks in order:
 *  1. Is the module globally enabled? (Restaurant-wide setting by superadmin)
 *  2. Does this specific user have access to this module?
 *
 * Superadmins bypass the per-user check but still see globally disabled modules
 * as disabled — so they can notice and re-enable them from Module Control.
 */
const ModuleGuard = ({ moduleId, children }: ModuleGuardProps) => {
    const { user, isSuperAdmin } = useAuth();
    const { isModuleActive, modules } = useModules();

    const mod = modules.find((m) => m.id === moduleId);
    const moduleName = mod?.label ?? moduleId;

    // 1. Global check — applies to everyone including superadmin
    if (!isModuleActive(moduleId)) {
        return <AccessDenied reason="global" moduleName={moduleName} />;
    }

    // 2. Per-user check — superadmin bypasses
    if (!isSuperAdmin && !(user?.allowedModules ?? []).includes(moduleId)) {
        return <AccessDenied reason="permission" moduleName={moduleName} />;
    }

    return <>{children}</>;
};

export default ModuleGuard;
