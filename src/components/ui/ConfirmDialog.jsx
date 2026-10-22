import React, { useEffect, useId, useRef } from "react";
import { Button } from "./Primitives";
import Icon from "./Icon";
export default function ConfirmDialog({ open, title, children, onCancel, onConfirm }) {
    const ref = useRef(null);
    const titleId = useId();
    useEffect(() => {
        if (!open) return undefined;
        const dialog = ref.current;
        const trigger = document.activeElement;
        dialog.showModal();
        return () => {
            dialog.close();
            if (trigger?.isConnected) trigger.focus();
        };
    }, [open]);
    return (
        <dialog
            ref={ref}
            className="confirm-dialog"
            aria-labelledby={titleId}
            onKeyDown={(event) => {
                if (event.key !== "Tab") return;
                const buttons = ref.current.querySelectorAll("button:not(:disabled)");
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }}
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
            onClick={(event) => {
                if (event.target === ref.current) onCancel();
            }}
        >
            <div className="dialog-content">
                <span className="category-icon category-icon--danger">
                    <Icon name="trash" />
                </span>
                <h2 id={titleId}>{title}</h2>
                <p>{children}</p>
                <div className="dialog-actions">
                    <Button variant="secondary" onClick={onCancel} autoFocus>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm}>
                        Delete expense
                    </Button>
                </div>
            </div>
        </dialog>
    );
}
