/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAppSelector } from "../redux/hooks";
import { getOtherUser } from "@/utils/conversation";

const SocketContext = createContext<any>(null);

export const SocketProvider = ({ children }: any) => {
    const user = useAppSelector((state) => state.account.user);
    const BE_URL = import.meta.env.VITE_BE_URL;
    const WS_URL = (BE_URL as string).replace("http://", "ws://").replace("https://", "wss://");

    const userSocketRef = useRef<WebSocket | null>(null);
    const chatSocketRef = useRef<WebSocket | null>(null);

    // State lưu toàn bộ data chat
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>({});

    const [loadingConversations, setLoadingConversations] = useState<boolean>(true);

    // Kết nối UserConsumer socket (nhận onlineUsers + unseen conversations)
    useEffect(() => {
        const token = localStorage.getItem("access_token_agoda_admin");
        if (!token) return;

        userSocketRef.current = new WebSocket(
            `${WS_URL}/ws/online/?token=${token}`
        );

        userSocketRef.current.onopen = () => {
            console.log("User WebSocket connected");
            setLoadingConversations(true);
        };

        userSocketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("data", data);

            if (data.type === "online_users") {
                setOnlineUsers(data.users);
            } else if (data.type === "unseen_conversations") {
                setConversations(
                    data.data.map((item: any) => {
                        return {
                            ...item.conversation,
                            latest_message: item.latest_message,
                            unseen_count: item.unseen_count,
                        };
                    })
                );
                setLoadingConversations(false);
            } else if (data.type === "new_message_received") {
                setMessages((prev: any) => {
                    const newPrev = [...prev].map((msg) => {
                        if (msg.sender.id === user.id) {
                            return {
                                ...msg,
                                seen: true,
                            };
                        }
                        return msg;
                    });
                    return [...newPrev];
                });

                setConversations((prevConvs) =>
                    prevConvs.map((conv) => {
                        if (conv.id === selectedConversation.id) {
                            const newMessages = [...conv.messages].map(
                                (item) => {
                                    if (item.sender.id === user.id) {
                                        return { ...item, seen: true };
                                    }
                                    return item;
                                }
                            );

                            return {
                                ...conv,
                                messages: newMessages,
                            };
                        }
                        return conv;
                    })
                );
            }
        };

        userSocketRef.current.onerror = (error) => {
            console.error("User WebSocket error:", error);
        };

        userSocketRef.current.onclose = () => {
            console.log("User WebSocket disconnected");
        };

        return () => {
            if (userSocketRef.current) userSocketRef.current.close();
        };
    }, [user]);

    // Khi chọn conversation -> mở socket ChatConsumer riêng cho conversation đó
    useEffect(() => {
        if (!selectedConversation.id) return;

        const token = localStorage.getItem("access_token_agoda_admin");
        if (!token) return;

        if (chatSocketRef.current) {
            chatSocketRef.current.close();
        }

        chatSocketRef.current = new WebSocket(
            `${WS_URL}/ws/chat/${selectedConversation.id}/`
        );

        chatSocketRef.current.onopen = () => {
            console.log(
                "Chat WebSocket connected for conversation",
                selectedConversation.id
            );

            // Gửi request đánh dấu đã seen cho phía mình
            chatSocketRef.current?.send(
                JSON.stringify({
                    action: "seen",
                    conversation_id: selectedConversation.id,
                    sender_id: user?.id,
                    receiver_id: getOtherUser(selectedConversation, user)?.id,
                })
            );

            // if (selectedConversation?.latest_message?.sender?.id !== user.id) {
            //     console.log("phuong@@@");
            //     // Gửi request đánh dấu đã seen cho phía đối phương
            //     chatSocketRef.current.send(
            //         JSON.stringify({
            //             action: "seen",
            //             conversation_id: selectedConversation.id,
            //             sender_id: getOtherUser(selectedConversation, user)?.id,
            //         })
            //     );
            // }

            setMessages(
                conversations.find(
                    (conv) => conv.id === selectedConversation.id
                )?.messages || []
            );
        };

        chatSocketRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "seen_update") {
                setMessages((prev) => {
                    return [...prev].map((msg) => {
                        if (msg.sender.id !== user.id) {
                            return { ...msg, seen: true };
                        }
                        return msg;
                    });
                });

                // Cập nhật last_message cho conversation tương ứng
                setConversations((prevConvs) =>
                    prevConvs.map((conv) => {
                        if (conv.id === selectedConversation.id) {
                            const newMessages = [...conv.messages].map(
                                (item) => {
                                    if (item.sender.id !== user.id) {
                                        return { ...item, seen: true };
                                    }
                                    return item;
                                }
                            );

                            return {
                                ...conv,
                                messages: newMessages,
                                seen: true,
                                unseen_count: 0,
                            };
                        }
                        return conv;
                    })
                );
            } else {
                setMessages((prev) => {
                    const newPrev = [...prev].map((msg) => {
                        if (msg.sender.id !== user.id) {
                            return {
                                ...msg,
                                seen: true,
                            };
                        }
                        return msg;
                    });
                    return [...newPrev, message];
                });

                // Cập nhật last_message cho conversation tương ứng
                setConversations((prevConvs) =>
                    prevConvs.map((conv) => {
                        if (conv.id === selectedConversation.id) {
                            const newMessages = [...conv.messages].map(
                                (msg) => {
                                    if (msg.sender.id !== user.id) {
                                        return {
                                            ...msg,
                                            seen: true,
                                        };
                                    }
                                    return msg;
                                }
                            );

                            return {
                                ...conv,
                                messages: [...newMessages, message],
                                last_message: message.text,
                                latest_message: message,
                                seen: message.seen,
                                unseen_count: [...newMessages, message].filter(
                                    (msg) => msg.seen === false
                                ).length,
                            };
                        }
                        return conv;
                    })
                );
            }
        };

        chatSocketRef.current.onerror = (error) => {
            console.error("Chat WebSocket error:", error);
        };

        chatSocketRef.current.onclose = () => {
            console.log(
                "Chat WebSocket disconnected for conversation",
                selectedConversation.id
            );
        };

        return () => {
            if (chatSocketRef.current) chatSocketRef.current.close();
        };
    }, [selectedConversation.id, user]);

    // Gửi message qua socket chat
    const sendMessage = (payload: any) => {
        if (
            chatSocketRef.current &&
            chatSocketRef.current.readyState === WebSocket.OPEN
        ) {
            chatSocketRef.current.send(JSON.stringify(payload));
        } else {
            console.warn("Chat socket chưa kết nối");
        }
    };

    return (
        <SocketContext.Provider
            value={{
                onlineUsers,
                conversations,
                setConversations,
                messages,
                selectedConversation,
                setSelectedConversation,
                sendMessage,
                loadingConversations,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
