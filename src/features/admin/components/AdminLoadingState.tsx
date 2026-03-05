/**
 * @file shared Admin view loader
 * @module features/admin/components/AdminLoadingState
 * 
 * provides a consistent, heavy-duty loading visual for administrative dashboard segments.
 * features customizable messaging for context-specific background operations.
 */

import { RiLoader4Line } from "@remixicon/react";

/** properties for the AdminLoadingState component. */
interface AdminLoadingStateProps {
    /** optional status message to display alongside the spinner. */
    message?: string;
}

/** 
 * standardized viewport loader for the admin suite. 
 * maintains visual continuity across management interfaces.
 */
export default function AdminLoadingState({ message = "Loading..." }: AdminLoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
            <RiLoader4Line size={28} className="animate-spin text-stone-400" />
            <span className="text-sm text-stone-400 tracking-wide">{message}</span>
        </div>
    );
}
