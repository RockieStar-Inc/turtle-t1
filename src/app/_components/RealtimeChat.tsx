'use client';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { RealtimeClient } from '@openai/realtime-api-beta';
import { useCallback, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

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
    console.log("🚀 ~ client.on ~ items:", items)
    toast.info("Conversation updated");
  });

  // Connect to Realtime API
  await client.connect();
  return client;
}

export function RealtimeChat() {
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(readSavedApiKey() ?? "");
  const [client, setClient] = useState<RealtimeClient | undefined>();
  const [message, setMessage] = useState<string>("");

  const setupClient = useCallback(async () => {
    try {
      const newClient = await setupRealtimeClient(openaiApiKey);
      setClient(newClient);
      toast.success("Connected successfully");
    } catch (error) {
      toast.error("Failed to connect: " + (error as Error).message);
    }
  }, [openaiApiKey]);

  const sendMessage = useCallback(() => {
    if (client && message) {
      client.sendUserMessageContent([{
        type: 'input_text',
        text: message
      }]);
      setMessage("");
      toast.success("Message sent");
    } else {
      toast.error('Client not initialized or message is empty');
    }
  }, [client, message]);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>RealtimeChat (OpenAI SDK)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="OpenAI API Key"
            value={openaiApiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setOpenaiApiKey(e.target.value);
              saveApiKey(e.target.value);
              toast.info("API Key updated");
            }}
          />
          <Button onClick={setupClient} className="w-full">
            Connect
          </Button>
        </div>
        <Input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={sendMessage} className="w-full">
          Send
        </Button>
      </CardFooter>
    </Card>
  );
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

