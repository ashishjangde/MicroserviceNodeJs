export const genrateVerificationCode = () : string => {
    return (Math.floor(Math.random() * 1000000) + 9000000).toString();
}
export const genrateVerificationCodeExpiry = ():Date =>{
    return new Date(Date.now() + 10 * 60 * 1000);
}