/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { IoIosMail } from "react-icons/io";
import { BiSolidBookBookmark } from "react-icons/bi";
import { Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callFetchMessage } from "@/config/api";
import { ROLE } from "@/constants/role";
import { getOtherUser } from "@/utils/conversation";
import { getUserAvatar } from "@/utils/imageUrl";
import { fetchConversation } from "@/redux/slice/conversationSlide";

const { TextArea } = Input;

const ChatRoom = ({ conversation, otherUser }: any) => {
    const dispatch = useAppDispatch();
    const chatRef = useRef<any>(null);
    const user = useAppSelector((state) => state.account.user);
    const [messages, setMessages] = useState<any>([]);
    const [input, setInput] = useState("");
    const socketRef = useRef<any>(null);

    const handleGetMessages = async () => {
        const res: any = await callFetchMessage(conversation.id);
        if (res.isSuccess) {
            setMessages(res.data);
        }
    };

    const scrollToBottom = () => {
        if (chatRef.current) {
            requestAnimationFrame(() => {
                chatRef.current.scrollTo({
                    top: chatRef.current.scrollHeight,
                    behavior: "smooth",
                });
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!conversation?.id) return;
        handleGetMessages();

        // (2) tạo kết nối WebSocket tới đúng phòng (conversationId là UUID string)
        const ws = new WebSocket(
            `ws://localhost:8000/ws/chat/${conversation.id}/`
        );
        socketRef.current = ws;

        ws.onopen = () => {
            console.log(`✅ Connected to conversation ${conversation.id}`);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Message received:", data);
            setMessages((prev: any) => [...prev, data]);
            dispatch(fetchConversation({ query: `current=1&pageSize=100` }));
        };

        ws.onclose = () => {
            console.log(`❌ Disconnected from conversation ${conversation.id}`);
        };

        ws.onerror = (error) => {
            console.error("⚠️ WebSocket error:", error);
        };

        return () => {
            ws.close();
        };
    }, [conversation]);

    const sendMessage = () => {
        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            const payload = {
                sender_id: user.id,
                receiver_id: otherUser.id, // user id (int)
                message: input,
                // optional: conversation_id: conversationId
            };
            socketRef.current.send(JSON.stringify(payload));
            setInput("");
            // không cần push ngay — server sẽ broadcast lại message cho room (nếu socket đang ở room đúng)
            // nhưng bạn có thể optimistic-update nếu muốn
        } else {
            console.warn("⚠️ Socket chưa sẵn sàng!");
        }
    };

    return (
        <div>
            <div
                ref={chatRef}
                className="border-[1px] bg-white border-[#ccc] h-[500px] overflow-y-auto relative"
            >
                <div className="sticky top-0">
                    <div className="grid grid-cols-3 p-[10px] bg-white border-[#ccc] border-b-[1px]">
                        <div className="col-start-1 col-span-2">
                            <div className="flex gap-[10px]">
                                {getOtherUser(conversation, user)?.role ===
                                    ROLE.OWNER ? (
                                    <>
                                        <img
                                            src={`${import.meta.env.VITE_BE_URL
                                                }${getOtherUser(conversation, user)
                                                    ?.hotel?.images?.[0]?.image
                                                }`}
                                            className="w-[50px] h-[50px] object-cover rounded-[50%]"
                                        />
                                        <div>
                                            <p className="font-bold">
                                                {
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.hotel?.name
                                                }
                                            </p>
                                            <p className="text-[#5e6b82] text-[12px]">
                                                {
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.hotel?.city?.name
                                                }
                                            </p>
                                            <p className="font-semibold text-[13px]">
                                                {dayjs(
                                                    conversation.created_at
                                                ).format("DD-MM-YYYY HH:mm:ss")}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={`${getUserAvatar(
                                                getOtherUser(conversation, user)
                                                    ?.avatar
                                            )}`}
                                            className="w-[50px] h-[50px] object-cover rounded-[50%]"
                                        />
                                        <div>
                                            <p className="font-bold">
                                                {`${getOtherUser(
                                                    conversation,
                                                    user
                                                )?.first_name
                                                    } ${getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.last_name
                                                    }`}
                                            </p>
                                            <p className="font-semibold text-[13px]">
                                                {dayjs(
                                                    conversation.created_at
                                                ).format("DD-MM-YYYY HH:mm:ss")}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-start-3 col-span-1">
                            {getOtherUser(conversation, user)?.role ===
                                ROLE.OWNER && (
                                    <div>
                                        <div className="text-[12px] text-[#5392f9] flex gap-[3px] items-center">
                                            <IoIosMail className="text-[13px]" />
                                            Gửi thư điện tử cho Chỗ nghỉ
                                        </div>
                                        <p className="text-[12px] text-[#5392f9] flex gap-[3px] items-center">
                                            <BiSolidBookBookmark className="text-[13px]" />
                                            Xem Chi tiết Đặt phòng
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
                <div className="pt-[10px]">
                    {messages.map((msg: any, idx: number) => (
                        <div key={idx}>
                            <p className="text-[#5e6b82] text-[12px] text-center">
                                {dayjs(msg.created_at).format(
                                    "DD-MM-YYYY HH:mm:ss"
                                )}
                            </p>
                            <div
                                className={`${msg.sender.id === user.id
                                    ? "text-right ml-auto"
                                    : "text-left mr-auto"
                                    }
                                w-fit p-[12px] flex items-center gap-[6px]`}
                            >
                                {msg.sender.id !== user.id &&
                                    (getOtherUser(conversation, user)?.role ===
                                        ROLE.OWNER ? (
                                        <img
                                            src={`${import.meta.env.VITE_BE_URL
                                                }${getOtherUser(conversation, user)
                                                    ?.hotel?.images?.[0]?.image
                                                }`}
                                            className="w-[40px] h-[40px] object-cover rounded-[50%]"
                                        />
                                    ) : (
                                        <img
                                            src={`${getUserAvatar(
                                                getOtherUser(conversation, user)
                                                    ?.avatar
                                            )}`}
                                            className="w-[40px] h-[40px] object-cover rounded-[50%]"
                                        />
                                    ))}
                                <p
                                    className={`p-[10px] rounded-[6px] ${msg.sender.id === user.id
                                        ? "bg-[#dde9fd]"
                                        : "bg-[#e9ebee]"
                                        }`}
                                >
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white border-[#ccc] border-l-[1px] border-r-[1px] border-b-[1px] p-4">
                <div className="flex gap-2 items-end">
                    <TextArea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Viết gì đó"
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        className="flex-1"
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={sendMessage}
                        disabled={!input.trim()}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
