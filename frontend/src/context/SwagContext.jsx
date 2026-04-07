import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const SwagContext = createContext();

export const useSwag = () => useContext(SwagContext);

export const SwagProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback(({ title = 'System Notification', message = '', type = 'info', duration = 5000 }) => {
        setAlert({ title, message, type });
        if (duration !== Infinity) {
            setTimeout(() => setAlert(null), duration);
        }
    }, []);

    const hideAlert = () => setAlert(null);

    return (
        <SwagContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 99999,
                            width: '380px',
                        }}
                    >
                        <div style={{
                            background: alert.type === 'error' ? 'rgba(225, 25, 25, 0.98)' : 'rgba(10, 10, 12, 0.98)',
                            backdropFilter: 'blur(12px)',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'flex-start',
                            color: '#fff',
                        }}>
                            <div style={{ marginTop: '2px' }}>
                                {alert.type === 'success' && <CheckCircle className="text-emerald-400" size={24} />}
                                {alert.type === 'error' && <ShieldAlert className="text-white" size={24} />}
                                {alert.type === 'warning' && <AlertCircle className="text-amber-400" size={24} />}
                                {alert.type === 'info' && <Info className="text-sky-400" size={24} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>
                                    {alert.title}
                                </h4>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8, color: '#fff', lineHeight: 1.4 }}>
                                    {alert.message}
                                </p>
                            </div>
                            <button
                                onClick={hideAlert}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    marginTop: '-2px'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SwagContext.Provider>
    );
};
