interface SnappCallbakcs {
    onSuccess?: (result: unknown) => void;
    onPending?: (result: unknown) => void;
    onError?: (error: unknown) => void;
    onClose?: () => void;
}

interface Window {
    snap:{
        pay: (token: string, callbacks: SnappCallbakcs) => void;
    };
}

