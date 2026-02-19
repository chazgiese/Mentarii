import { useEffect, useCallback } from 'react';
import type { UIMessage } from '../types';

type MessageHandler = (message: UIMessage) => void;

export function usePluginMessages(handler: MessageHandler) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      handler(msg);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handler]);

  const sendMessage = useCallback((type: string, payload: Record<string, any> = {}) => {
    parent.postMessage(
      {
        pluginMessage: {
          type,
          ...payload,
        },
      },
      '*'
    );
  }, []);

  return { sendMessage };
}
