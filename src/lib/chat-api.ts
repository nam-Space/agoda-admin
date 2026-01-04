/* eslint-disable @typescript-eslint/no-explicit-any */

import { callCreateNewChat, callFetchChatbotMessages } from "@/config/api";

interface StreamCallbacks {
    onText?: (text: string) => void;
    onSQL?: (data: any) => void;
    onImage?: (data: any) => void;
    onExecutionStatus?: (data: any) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
}

export async function createNewChat(data: any) {
    const res: any = await callCreateNewChat(data);
    return res.chatid;
}

export async function getChatMessages(
    chatid: string,
    debug: boolean = true,
    timestamp?: string
) {
    const params = new URLSearchParams({
        chatid,
        debug: debug.toString(),
    });

    if (timestamp) {
        params.append("timestamp", timestamp);
    }

    const res = await callFetchChatbotMessages(params.toString());
    return res;
}

export async function sendMessage(
    question: string,
    chatid: string,
    callbacks: StreamCallbacks
) {
    const response: any = await fetch("/ayd/api/ask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_AYD_API_KEY}`,
        },
        body: JSON.stringify({
            question,
            botid: import.meta.env.VITE_AYD_CHATBOT_ID,
            chatid,
            debug: true,
        }),
    });

    if (!response.ok) {
        callbacks.onError?.(await response.text());
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
            if (line.startsWith("data: ")) {
                try {
                    const data = JSON.parse(line.slice(6));
                    if (data.isText) callbacks.onText?.(data.content);
                    else if (data.isExecutionStatus)
                        callbacks.onExecutionStatus?.(data);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    callbacks.onEnd?.();
}
