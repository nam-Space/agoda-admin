/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { question, chatid, botid, debug = true } = req.body || {};

    console.log("ASK BOTID:", process.env.AYD_CHATBOT_ID);
    console.log("ASK KEY:", process.env.AYD_API_KEY?.slice(0, 8));
    console.log("CHATID:", chatid);
    console.log("question:", question);
    console.log("chatid:", chatid);
    console.log("botid:", botid);

    if (!question || !chatid) {
        return res.status(400).json({
            error: "question and chatid are required",
        });
    }

    const upstream = await fetch("https://www.askyourdatabase.com/api/ask", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.AYD_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            question,
            chatid,
            botid,
            debug,
        }),
    });

    if (!upstream.body) {
        return res.status(500).json({ error: "No upstream body" });
    }

    // 🔥 CỰC KỲ QUAN TRỌNG
    res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
    });

    // Flush headers ngay
    // @ts-ignore
    res.flushHeaders?.();

    const reader = upstream.body.getReader();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 🚨 KHÔNG encode lại
            res.write(Buffer.from(value));
        }
    } catch (err) {
        console.error("Stream error:", err);
    } finally {
        reader.releaseLock();
        res.end();
    }
}
