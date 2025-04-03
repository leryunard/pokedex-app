import {ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import clsx from "clsx";

interface ModalProps {
    show: boolean;
    title?: string;
    width?: string;
    onClose?: () => void;
    children: ReactNode;
    footer?: ReactNode;
}

export default function Modal({
                                  show,
                                  title = "",
                                  width = "max-w-2xl",
                                  children,
                                  footer,
                              }: ModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
        } else {
            setTimeout(() => setVisible(false), 300); // espera que termine animación
        }
    }, [show]);

    if (!show && !visible) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
            <div
                className={clsx(
                    "bg-white rounded-lg shadow-lg w-full transform transition-all duration-300 scale-95",
                    show && "scale-100",
                    width
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-center p-4 border-b">
                    <h1 className="text-[1.4em] md:text-[2.7em] font-bold text-primary-300 text-center md:leading-[60px]">
                        {title}
                    </h1>
                </div>

                {/* Body */}
                <div className="p-4">{children}</div>

                {/* Footer */}
                {footer && (
                    <div
                        className="flex justify-center items-center space-x-0 lg:space-x-5 flex-col lg:flex-row p-4 border-t">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
