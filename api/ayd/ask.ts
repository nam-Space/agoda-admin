export const config = {
    runtime: "edge", // ⚠ BẮT BUỘC cho streaming
};

export default async function handler(req: Request) {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const body = await req.json();

    const response = await fetch("https://www.askyourdatabase.com/api/ask", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.AYD_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    return new Response(response.body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
