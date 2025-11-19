/* eslint-disable @typescript-eslint/no-explicit-any */
export const getOtherUser = (conversation: any, currentUser: any) => {
    if (conversation.user1.id === currentUser.id) return conversation.user2;
    return conversation.user1;
};
