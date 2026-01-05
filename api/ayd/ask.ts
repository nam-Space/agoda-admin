/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { question, chatid, debug = true } = req.body;

    if (!question || !chatid) {
        return res.status(400).json({
            error: "question and chatid are required",
        });
    }

    const response = await fetch("https://www.askyourdatabase.com/api/ask", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.AYD_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            question,
            chatid,
            botid: process.env.AYD_CHATBOT_ID,
            debug,
        }),
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body?.getReader();
    if (!reader) return res.end();

    const encoder = new TextEncoder();

    while (true) {
        const { done, value }: any = await reader.read();
        if (done) break;
        res.write(encoder.encode(value));
    }

    res.end();
}
