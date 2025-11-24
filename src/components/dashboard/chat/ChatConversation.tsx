/* eslint-disable @typescript-eslint/no-explicit-any */

import { ROLE } from "@/constants/role";
import { useSocket } from "@/context/SocketProvider";
import { useAppSelector } from "@/redux/hooks";
import { getOtherUser } from "@/utils/conversation";
import { getUserAvatar } from "@/utils/imageUrl";
import { Badge } from "antd";
import dayjs from "dayjs";
import { HiBuildingOffice2 } from "react-icons/hi2";

const ChatConversation = ({ selectedOtherUser, handleOpenChat }: any) => {
    const user = useAppSelector((state) => state.account.user);

    const { onlineUsers, conversations } = useSocket();

    return (
        <div className="flex-1/4">
            <div className="h-[500px] overflow-y-auto">
                {conversations.map((conv: any) => (
                    <div
                        key={conv.id}
                        onClick={() => handleOpenChat(conv)}
                        className={`flex gap-[10px] border-[1px] p-[10px] border-[#ddd] cursor-pointer mb-[5px] ${selectedOtherUser.id === getOtherUser(conv, user).id
                            ? "bg-[#f0f0f0]"
                            : "bg-white"
                            }`}
                    >
                        {getOtherUser(conv, user)?.role === ROLE.STAFF ? (
                            <>
                                <div className="relative h-fit">
                                    <img
                                        src={getUserAvatar(
                                            getOtherUser(conv, user)
                                                ?.hotel?.images?.[0]?.image
                                        )}
                                        alt={getUserAvatar(
                                            getOtherUser(conv, user)?.username
                                        )}
                                        className="w-[50px] h-[50px] object-cover rounded-[50%]"
                                    />
                                    <img
                                        src={getUserAvatar(
                                            getOtherUser(conv, user)?.avatar
                                        )}
                                        alt={getOtherUser(conv, user)?.username}
                                        className="absolute right-[-4px] bottom-[-4px] w-[24px] h-[24px] object-cover rounded-[50%]"
                                    />
                                    {onlineUsers.find(
                                        (onlineUser: any) =>
                                            onlineUser.id ===
                                            getOtherUser(conv, user)?.id
                                    ) && (
                                            <div className="absolute right-[-4px] bottom-[-4px] bg-[#52c41a] w-[10px] h-[10px] rounded-[50%]"></div>
                                        )}
                                </div>
                                <div className="flex items-center gap-[20px]">
                                    <div>
                                        <p className="font-bold">
                                            {
                                                getOtherUser(conv, user)
                                                    ?.hotel?.name
                                            }
                                        </p>
                                        <p className="flex items-center gap-[20px] justify-between">
                                            <span className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden">
                                                {conv.last_message}
                                            </span>
                                            {conv?.latest_message?.sender
                                                ?.id === user.id &&
                                                conv?.latest_message?.seen && (
                                                    <img
                                                        src={getUserAvatar(
                                                            getOtherUser(
                                                                conv,
                                                                user
                                                            )?.avatar
                                                        )}
                                                        alt={
                                                            getOtherUser(
                                                                conv,
                                                                user
                                                            )?.username
                                                        }
                                                        className="mt-[4px] w-[14px] h-[14px] object-cover rounded-[50%]"
                                                    />
                                                )}
                                        </p>
                                        <p className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden text-[#5e6b82] text-[12px]">
                                            {dayjs(conv.created_at).format(
                                                "DD-MM-YYYY HH:mm:ss"
                                            )}
                                        </p>
                                    </div>
                                    {!!(
                                        conv?.unseen_count > 0 &&
                                        conv?.latest_message?.sender?.id !==
                                        user?.id
                                    ) && (
                                            <Badge
                                                count={conv.unseen_count}
                                                showZero
                                                color="#fa2314"
                                            />
                                        )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative h-fit">
                                    <img
                                        src={`${getUserAvatar(
                                            getOtherUser(conv, user)?.avatar
                                        )}`}
                                        alt={getOtherUser(conv, user)?.username}
                                        className="w-[50px] h-[50px] object-cover rounded-[50%]"
                                    />
                                    {onlineUsers.find(
                                        (onlineUser: any) =>
                                            onlineUser.id ===
                                            getOtherUser(conv, user)?.id
                                    ) && (
                                            <div className="absolute right-[5px] bottom-[2px] bg-[#52c41a] w-[10px] h-[10px] rounded-[50%]"></div>
                                        )}
                                </div>
                                <div className="flex items-center gap-[20px]">
                                    <div>
                                        <div className="flex items-center gap-[5px]">
                                            <p className="font-bold">
                                                {`${getOtherUser(conv, user)
                                                    ?.first_name
                                                    } ${getOtherUser(conv, user)
                                                        ?.last_name
                                                    }`}
                                            </p>
                                            {getOtherUser(conv, user)?.role ===
                                                ROLE.OWNER && (
                                                    <HiBuildingOffice2 className="text-[#5392f9] text-[20px]" />
                                                )}
                                        </div>
                                        <p className="flex items-center gap-[20px] justify-between">
                                            <span className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden">
                                                {conv.last_message}
                                            </span>
                                            {conv?.latest_message?.sender
                                                ?.id === user.id &&
                                                conv?.latest_message?.seen && (
                                                    <img
                                                        src={`${getUserAvatar(
                                                            getOtherUser(
                                                                conv,
                                                                user
                                                            )?.avatar
                                                        )}`}
                                                        alt={
                                                            getOtherUser(
                                                                conv,
                                                                user
                                                            )?.username
                                                        }
                                                        className="mt-[4px] w-[14px] h-[14px] object-cover rounded-[50%]"
                                                    />
                                                )}
                                        </p>
                                        <p className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden text-[#5e6b82] text-[12px]">
                                            {dayjs(conv.created_at).format(
                                                "DD-MM-YYYY HH:mm:ss"
                                            )}
                                        </p>
                                    </div>
                                    {!!(
                                        conv?.unseen_count > 0 &&
                                        conv?.latest_message?.sender?.id !==
                                        user?.id
                                    ) && (
                                            <Badge
                                                count={conv.unseen_count}
                                                showZero
                                                color="#fa2314"
                                            />
                                        )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatConversation;
