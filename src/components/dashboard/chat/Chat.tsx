/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import _ from "lodash";
import { Select } from "antd";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callFetchUser, callGetOrCreateConversation } from "@/config/api";
import { fetchConversation } from "@/redux/slice/conversationSlide";
import { ROLE } from "@/constants/role";
import { getOtherUser } from "@/utils/conversation";
import { getUserAvatar } from "@/utils/imageUrl";
import ChatRoom from "./ChatRoom";
import { IoChatboxEllipses } from "react-icons/io5";

function Chat() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.account.user);
    const [selectedConversation, setSelectedConversation] = useState<any>({});
    const [selectedOtherUser, setSelectedOtherUser] = useState<any>({});
    const conversations = useAppSelector((state) => state.conversation.data);
    const [users, setUsers] = useState([]);

    const handleGetUsers = async (query: string) => {
        const res: any = await callFetchUser(query);
        if (res.isSuccess) {
            setUsers(res.data);
        }
    };

    useEffect(() => {
        dispatch(fetchConversation({ query: `current=1&pageSize=100` }));
        handleGetUsers(
            `current=1&pageSize=1000&role=${ROLE.CUSTOMER}&is_active=1`
        );
    }, [dispatch]);

    const handleOpenChat = async (conv: any) => {
        try {
            const clientConvId = uuidv4(); // tạo uuid phía client (tùy chọn)

            const res: any = await callGetOrCreateConversation({
                user_id: getOtherUser(conv, user).id,
                conversation_id: clientConvId,
            });

            if (res?.isSuccess) {
                const conv = res.data;
                setSelectedConversation(conv); // ID là UUID string
                setSelectedOtherUser(getOtherUser(conv, user));
            } else {
                console.error("Failed get/create conversation", res.data);
            }
        } catch (err) {
            console.error("Error getting/creating conversation", err);
        }
    };

    const handleSelectUser = async (val: any) => {
        try {
            const res: any = await callGetOrCreateConversation({
                user_id: val,
            });
            if (res?.isSuccess) {
                const conv = res.data;
                setSelectedConversation(conv); // ID là UUID string
                setSelectedOtherUser(getOtherUser(conv, user));
                dispatch(
                    fetchConversation({ query: `current=1&pageSize=100` })
                );
            } else {
                console.error("Failed get/create conversation", res.data);
            }
        } catch (e) {
            console.error("Error getting/creating conversation", e);
        }
    };

    return (
        <div>
            {user.id > 0 && (
                <>
                    {user.role !== ROLE.CUSTOMER && (
                        <Select
                            placeholder="Select a person"
                            className="w-[300px] h-[60px]"
                            options={users.map((user: any) => {
                                return {
                                    label: (
                                        <div className="flex items-center gap-[10px]">
                                            <img
                                                src={getUserAvatar(user.avatar)}
                                                className="w-[40px] h-[40px] object-cover rounded-[50%]"
                                            />
                                            <div>
                                                <p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
                                                <p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
                                            </div>
                                        </div>
                                    ),
                                    value: user.id,
                                };
                            })}
                            onChange={handleSelectUser}
                        />
                    )}

                    {conversations.length > 0 && (
                        <div className="flex gap-[20px] mt-[20px]">
                            <div>
                                <div className="h-[500px] overflow-y-auto">
                                    {conversations.map((conv: any) => (
                                        <div
                                            key={conv.id}
                                            onClick={() => handleOpenChat(conv)}
                                            className={`flex gap-[10px] border-[1px] p-[10px] border-[#ddd] cursor-pointer mb-[5px] ${selectedOtherUser.id ===
                                                getOtherUser(conv, user).id
                                                ? "bg-[#f0f0f0]"
                                                : "bg-white"
                                                }`}
                                        >
                                            {getOtherUser(conv, user)?.role ===
                                                ROLE.OWNER ? (
                                                <>
                                                    <img
                                                        src={`${import.meta.env.VITE_BE_URL
                                                            }${getOtherUser(
                                                                conv,
                                                                user
                                                            )?.hotel
                                                                ?.images?.[0]
                                                                ?.image
                                                            }`}
                                                        className="w-[50px] h-[50px] object-cover rounded-[50%]"
                                                    />
                                                    <div>
                                                        <p className="font-bold">
                                                            {
                                                                getOtherUser(
                                                                    conv,
                                                                    user
                                                                )?.hotel?.name
                                                            }
                                                        </p>
                                                        <p className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden">
                                                            {conv.last_message}
                                                        </p>
                                                        <p className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden text-[#5e6b82] text-[12px]">
                                                            {dayjs(
                                                                conv.created_at
                                                            ).format(
                                                                "DD-MM-YYYY HH:mm:ss"
                                                            )}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <img
                                                        src={`${getUserAvatar(
                                                            getOtherUser(
                                                                conv,
                                                                user
                                                            )?.avatar
                                                        )}`}
                                                        className="w-[50px] h-[50px] object-cover rounded-[50%]"
                                                    />
                                                    <div>
                                                        <p className="font-bold">
                                                            {`${getOtherUser(
                                                                conv,
                                                                user
                                                            )?.first_name
                                                                } ${getOtherUser(
                                                                    conv,
                                                                    user
                                                                )?.last_name
                                                                }`}
                                                        </p>
                                                        <p className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden">
                                                            {conv.last_message}
                                                        </p>
                                                        <p className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden text-[#5e6b82] text-[12px]">
                                                            {dayjs(
                                                                conv.created_at
                                                            ).format(
                                                                "DD-MM-YYYY HH:mm:ss"
                                                            )}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                {!_.isEmpty(selectedConversation) ? (
                                    <ChatRoom
                                        conversation={selectedConversation}
                                        otherUser={selectedOtherUser}
                                    />
                                ) : (
                                    <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
            {(!user.id ||
                (user.role === ROLE.CUSTOMER &&
                    conversations.length === 0)) && (
                    <div className="bg-white h-[722px] rounded-[16px]">
                        <div className="flex items-center justify-center flex-col h-full">
                            <IoChatboxEllipses className="text-[100px] text-[#2067da]" />
                            <p className="font-semibold">
                                Quý khách không có cuộc trò chuyện nào
                            </p>
                            <p className="text-[#6b7388] text-[12px]">
                                Bắt đầu cuộc trò chuyện bằng cách viết tin nhắn bên
                                dưới.
                            </p>
                            <div className="text-[#2067da] mt-[22px] font-semibold relative h-[36px] flex justify-center items-center px-[24px] rounded-[50px] border-[1px] border-[#050a0f69] after:bg-[#2067da] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:opacity-0 hover:after:opacity-10 after:transition-all after:duration-300 after:rounded-[50px]">
                                Chuyển đến đặt phòng của tôi
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Chat;
