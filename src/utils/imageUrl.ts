import defaultAvatar from "/images/user/default-avatar.png";

export const getUserAvatar = (name: string | undefined) => {
    return name
        ? (`${import.meta.env.VITE_BE_URL}${name}` as string)
        : defaultAvatar;
};
