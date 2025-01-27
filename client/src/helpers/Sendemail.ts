import { resend } from "../../../backend/lib/resend";
import { Apiresponse } from "../../../backend/types/Apiresponse";
import VerificationEmail from "../../../backend/email/Emailtemplate";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<Apiresponse> {
  try {
    await resend.emails.send({
      from: "Aryanshraj1139@gmail.com",
      to: email,
      subject: "Mystery Message Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: "Verification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email." };
  }
}
