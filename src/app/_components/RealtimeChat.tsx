/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { useCallback, useRef, useState } from 'react';

async function setupRealtimeClient(apiKey: string): Promise<RealtimeClient> {
  const client = new RealtimeClient({ apiKey, dangerouslyAllowAPIKeyInBrowser: true });

  // Can set parameters ahead of connecting, either separately or all at once
  client.updateSession({ instructions: 'You are a great, upbeat friend.' });
  client.updateSession({ voice: 'alloy' });
  client.updateSession({
    turn_detection: { type: 'server_vad' }, // or 'server_vad'
    input_audio_transcription: { model: 'whisper-1' },
  });

  // Set up event handling
  client.on('conversation.updated', (event) => {
    const { item, delta } = event;
    const items = client.conversation.getItems();
    /**
     * item is the current item being updated
     * delta can be null or populated
     * you can fetch a full list of items at any time
     */
  });

  // Connect to Realtime API
  await client.connect();
  return client;
}

export function RealtimeChat() {
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(readSavedApiKey() ?? "");
  const [client, setClient] = useRef<RealtimeClient>();

  const setupClient = useCallback(async () => {
    const client = await setupRealtimeClient(openaiApiKey);
    setClient(client);
  }, [openaiApiKey, setClient]);
  
  return <div className="w-full h-full">
    
      <h1>
      RealtimeChat
      </h1>
      <input type="text" value={openaiApiKey}  onChange={(e) => {
        setOpenaiApiKey(e.target.value);
        saveApiKey(e.target.value);
      }} />
      <button onClick={setupClient}>Connect</button>

    </div>;
}

function readSavedApiKey() {
  return localStorage.getItem('t1_openai_api_key');
}

function saveApiKey(apiKey: string) {
  localStorage.setItem('t1_openai_api_key', apiKey);
}

function deleteApiKey() {
  localStorage.removeItem('t1_openai_api_key');
}

