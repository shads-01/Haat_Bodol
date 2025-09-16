import { transporter } from "./emailConfig.js";
import { Verification_Email_Template } from "./emailTemplate.js";


export const sendVerificationEmail = async (email,verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: '"Haat Bodol" <tamimshahadat15@gmail.com>',
            to: email,
            subject: "Verify your email",
            text: "Verify your email",
            html: Verification_Email_Template.replace("{verificationCode}",verificationCode), // HTML body
        });
        console.log("Email sent succesfully",response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export const welcomeEmail = async (email,name) => {
    try {
        const response = await transporter.sendMail({
            from: '"Haat Bodol" <tamimshahadat15@gmail.com>',
            to: email,
            subject: "Welcome to Haat Bodol",
            text: "Welcome to Haat Bodol",
            html: Welcome_Email_Template.replace("{name}",name), // HTML body
        });
        console.log("Email sent succesfully",response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}