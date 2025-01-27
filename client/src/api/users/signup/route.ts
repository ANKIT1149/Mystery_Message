import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../backend/lib/dbConfig";
import UserModel from "../../../../../backend/model/User";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/Sendemail";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const reqBody = await req.json();
    const { username, email, password } = reqBody;

    if (!username || !email || !password)
      return NextResponse.json(
        { message: "Please provide all details", success: true },
        { status: 200 }
      );

    const exsistinguserbyUsernameverified = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (exsistinguserbyUsernameverified)
      return NextResponse.json(
        {
          message: "User exsists with this username",
          success: false,
        },
        { status: 400 }
      );

    const exsistUserByemail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (exsistUserByemail) {
      if (exsistUserByemail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "User verified before and exsist",
          },
          { status: 404 }
        );
      } else {
        const hashedPassword = await bcryptjs.hash(password, 10);
        exsistUserByemail.password = hashedPassword;
        exsistUserByemail.verificationCode = verifyCode;
        exsistUserByemail.verificationcodeExpiry = new Date(Date.now() + 36000);
        await exsistUserByemail.save();
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verificationCode: verifyCode,
        isVerified: false,
        verificationcodeExpiry: expiryDate,
        acceptMessage: true,
        message: [],
      });

      await newUser.save();
    }

    const sendverificationEmail = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!sendverificationEmail.success)
      return NextResponse.json(
        {
          message: sendverificationEmail.message,
          success: false,
        },
        { status: 500 }
      );

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.Please verify your email",
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.log("User registration failed", error);
    return NextResponse.json(
      { success: false, message: "User registration failed" },
      { status: 404 }
    );
  }
}
