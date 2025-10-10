export const getOtherUser = (conversation, currentUser) => {
    if (conversation.user1.id === currentUser.id) return conversation.user2;
    return conversation.user1;
};