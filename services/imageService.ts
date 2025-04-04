export const getProfileImage = (file: any) => {
    if (file && typeof file == "string") return file;
    if (file && typeof file == "object") return file.uri; // uri includes the location of the file

    return require("../assets/images/defaultAvatar.png"); // default avatar if none of above are trues
};
