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
    const response = await fetch(
        `${import.meta.env.VITE_BE_URL}/api/chatbots/ask/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question,
                chatid,
                debug: true,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        callbacks.onError?.(error);
        return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
        callbacks.onError?.("No response body");
        return;
    }

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.isText) {
                            callbacks.onText?.(data.content);
                        } else if (data.isSQL) {
                            callbacks.onSQL?.(data);
                        } else if (data.isImage) {
                            callbacks.onImage?.(data);
                        } else if (data.isExecutionStatus) {
                            callbacks.onExecutionStatus?.(data);
                        }
                    } catch (e) {
                        console.error("Failed to parse SSE data:", e);
                    }
                }
            }
        }

        callbacks.onEnd?.();
    } catch (error) {
        callbacks.onError?.(`Stream error: ${error}`);
    } finally {
        reader.releaseLock();
    }
}
