import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,  // NOTE!: Remember, `secure` is false because port 587 uses STARTTLS
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

/**
 * Sends a verification email with an OTP to a specified email address.
 * @param {string} email The email address to send the OTP.
 * @param {string} otp The one-time password to include in the email.
 */
export const sendVerificationEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL, 
        to: email, 
        subject: 'Verify Your BantuRide Account', 
        text: `Your OTP for account verification is: ${otp}`,
        html: `<p>Your OTP for account verification is: <strong>${otp}</strong></p>` 
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', email);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error; // Rethrow the error for further handling if necessary
    }
};



export const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if(err){
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) {
                    reject (err);
                }
                resolve(hash);
            });
        });
    });
};

export const comparePassword = (password, hashed) => {
    return bcrypt.compare(password, hashed);
};

