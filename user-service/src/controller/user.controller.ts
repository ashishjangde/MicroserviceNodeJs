import  asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userRepository } from "../repositories/user.repository.js";
import { signupSchema } from "../schema/SIgnupSchema.js";
import { loginSchema } from "../schema/LoginSchema.js";
import { formatValidationErrors } from "../utils/FormatValidationError.js";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken 
} from "../helper/JwtHelper.js";
import bcrypt from "bcryptjs";
import { 
  genrateVerificationCodeExpiry, 
  genrateVerificationCode 
} from "../helper/VerificationCodeHelper.js";
import { userVerificationSchema } from "../schema/UserVerificationSchema.js";

const hashPassword = async (password: string) => await bcrypt.hash(password, 10);

const comparePassword = async (password: string, hashedPassword: string) => await bcrypt.compare(password, hashedPassword);

export const Signup = asyncHandler(async (req, res) => {
    
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        const error =  formatValidationErrors(result.error);
        throw new ApiError(400, "Validation Error", error);
    }
    const { name, username, email, password } = result.data;
    
    const existingUser = await userRepository.getUserByEmail(email);
    const existingUsername = await userRepository.getUserByUsername(username);
    if(existingUser?.verified == false && existingUsername?.verified  == false){
        const verificationCode = genrateVerificationCode();
        const verificationCodeExpiry = genrateVerificationCodeExpiry();
        const hashedPassword = await hashPassword(password);
        existingUser.username = username;
        existingUser.name = name;
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpiry = verificationCodeExpiry;
        existingUser.password = hashedPassword;
        await userRepository.saveUser(existingUser);
        const { password: _ , verificationCode: __, verificationCodeExpiry: ___, verificationToken: ____,  ...rest } = existingUser;
        res.status(200).json(new ApiResponse(rest));
    } else{
        if (existingUser) throw new ApiError(400, "User already exists");
    if (existingUsername) throw new ApiError(400, "Username already Taken");
    const verificationCode = genrateVerificationCode();
    const verificationCodeExpiry = genrateVerificationCodeExpiry();
    const hashedPassword = await hashPassword(password);
    const user = await userRepository.createUser({
        name,
        username,
        email,
        password : hashedPassword,
        verificationCode,
        verificationCodeExpiry,
    });
    const { password: _ , verificationCode: __, verificationCodeExpiry: ___, verificationToken: ____,  ...rest } = user;
    res.status(201).json(new ApiResponse(rest));
    }
    
});


export const Login = asyncHandler(async (req, res) => {
  
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        const error =  formatValidationErrors(result.error);
        throw new ApiError(400, "Validation Error", error);
    }

    const { email, password } = result.data;
    const user = await userRepository.getUserByEmail(email);
    if (!user) throw new ApiError(400, "User not found");
    const isPasswordValid = await comparePassword(password, user.password!);
    if (!isPasswordValid) throw new ApiError(400, "Invalid Password");
    if (!user.verified) throw new ApiError(400, "User not verified");
    const accessToken = await  generateAccessToken(user.id, user.email);
    const refreshToken = await  generateRefreshToken(user.id);
    const { password: _ , verificationCode: __, verificationCodeExpiry: ___, verificationToken: ____,  ...rest } = user;
    console.log(rest , accessToken)
    res.status(200)
    .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/"
    })
    .json(new ApiResponse({       
        accessToken, 
        ...rest
     }));

   
});
export const Verify = asyncHandler(async (req, res) => { 
    
    const result = userVerificationSchema.safeParse(req.body);
    if (!result.success) {
        const error =  formatValidationErrors(result.error);
        throw new ApiError(400, "Validation Error", error);
    }
    const { email, verificationCode } = result.data;
    const user = await userRepository.getUserByEmail(email);
    if (!user) throw new ApiError(400, "User not found");
    if (user.verified) throw new ApiError(400, "User already verified");
    if (user.verificationCode !== verificationCode) throw new ApiError(400, "Invalid verification code");
    if (user.verificationCodeExpiry! <= new Date()) throw new ApiError(400, "Verification code expired Signup again !!");
    user.verified = true;
    await userRepository.saveUser(user);
    res.status(200).json(new ApiResponse({
        message: "User verified successfully"
    }));
});

export const Refresh = asyncHandler(async (req, res) => { 
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new ApiError(401, "Unauthorized");
    const decoded =  verifyToken(refreshToken);
    const user = await userRepository.getUserById((await decoded).id);
    if (!user) throw new ApiError(401, "Unauthorized");
    const accessToken = await  generateAccessToken(user.id, user.email);
    const { password: _ , verificationCode: __, verificationCodeExpiry: ___, verificationToken: ____,  ...rest } = user;

    res.status(200).json(new ApiResponse({
        accessToken,
        ...rest
    }));
});



export const Logout = asyncHandler(async (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(400).json(new ApiResponse({
            message: "User not found, cannot log out",
        }));
    }

    res.cookie("refreshToken", "", {
        httpOnly: true,
        path: "/",
    });

    res.status(200).json(new ApiResponse({
        message: `User ${userId} logged out successfully`,
    }));
});


export const hello = asyncHandler(async (req, res) => {
    console.log("inside the hello")
    res.status(200).json(new ApiResponse({
        message: "Hello World",
    }));
})