/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { IoIosMail } from "react-icons/io";
import { BiSolidBookBookmark } from "react-icons/bi";
import { Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { ROLE } from "@/constants/role";
import { getOtherUser } from "@/utils/conversation";
import { getUserAvatar } from "@/utils/imageUrl";
import { useAppSelector } from "@/redux/hooks";
import { useSocket } from "@/context/SocketProvider";

const { TextArea } = Input;

const ChatRoom = ({ conversation, otherUser }: any) => {
    const chatRef = useRef<any>(null);
    const user = useAppSelector((state) => state.account.user);
    const { onlineUsers, messages, sendMessage } = useSocket();
    const [input, setInput] = useState("");

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

    const handleSendMessage = () => {
        const payload = {
            sender_id: user.id,
            receiver_id: otherUser.id,
            message: input,
        };
        sendMessage(payload);
        setInput("");
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
                                    ROLE.STAFF ? (
                                    <>
                                        <div className="relative h-fit">
                                            <img
                                                src={getUserAvatar(
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.avatar
                                                )}
                                                alt={
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.username
                                                }
                                                className="min-w-[50px] h-[50px] object-cover rounded-[50%]"
                                            />
                                            {onlineUsers.find(
                                                (onlineUser: any) =>
                                                    onlineUser.id ===
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.id
                                            ) && (
                                                    <div className="absolute right-[5px] bottom-[2px] bg-[#52c41a] w-[10px] h-[10px] rounded-[50%]"></div>
                                                )}
                                        </div>
                                        <div>
                                            <div>
                                                <span className="font-bold">
                                                    {
                                                        getOtherUser(
                                                            conversation,
                                                            user
                                                        )?.first_name
                                                    }{" "}
                                                    {
                                                        getOtherUser(
                                                            conversation,
                                                            user
                                                        )?.last_name
                                                    }
                                                </span>
                                                {" - Nhân viên của "}
                                                <span className="font-bold">
                                                    {
                                                        getOtherUser(
                                                            conversation,
                                                            user
                                                        )?.hotel?.name
                                                    }
                                                </span>
                                            </div>
                                            <p className="font-semibold text-[13px]">
                                                {dayjs(
                                                    conversation.created_at
                                                ).format("DD-MM-YYYY HH:mm:ss")}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative h-fit">
                                            <img
                                                src={`${getUserAvatar(
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.avatar
                                                )}`}
                                                alt={
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.username
                                                }
                                                className="w-[50px] h-[50px] object-cover rounded-[50%]"
                                            />
                                            {onlineUsers.find(
                                                (onlineUser: any) =>
                                                    onlineUser.id ===
                                                    getOtherUser(
                                                        conversation,
                                                        user
                                                    )?.id
                                            ) && (
                                                    <div className="absolute right-[5px] bottom-[2px] bg-[#52c41a] w-[10px] h-[10px] rounded-[50%]"></div>
                                                )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-[5px]">
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
                                                {getOtherUser(conversation, user)?.role ===
                                                    ROLE.OWNER && <p>
                                                        {" "}
                                                        -{" "}
                                                        <span className="text-[#5392f9] font-bold">
                                                            Chủ khách sạn
                                                        </span>
                                                    </p>}

                                            </div>
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
                            {(getOtherUser(conversation, user)?.role ===
                                ROLE.STAFF) && (
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
                                className={`${msg?.sender?.id === user.id
                                    ? "ml-auto"
                                    : "text-left mr-auto"
                                    }
                                w-fit p-[12px] flex items-center gap-[6px] max-w-[70%]`}
                            >
                                {msg?.sender?.id !== user.id &&
                                    <img
                                        src={`${getUserAvatar(
                                            getOtherUser(conversation, user)
                                                ?.avatar
                                        )}`}
                                        alt={
                                            getOtherUser(conversation, user)
                                                ?.username
                                        }
                                        className="w-[40px] max-w-[40px] min-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                }
                                <div className="w-full">
                                    <p
                                        className={`p-[10px] rounded-[6px] ${msg?.sender?.id === user.id
                                            ? "bg-[#dde9fd]"
                                            : "bg-[#e9ebee]"
                                            }`}
                                        style={{ wordBreak: "break-word" }}
                                    >
                                        {msg.text}
                                    </p>
                                    {msg.seen &&
                                        msg?.sender?.id === user.id && (
                                            <div className="text-[#5e6b82] text-[12px] text-right">
                                                Đã xem
                                            </div>
                                        )}
                                </div>
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
                                handleSendMessage();
                            }
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;