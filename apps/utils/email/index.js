const nodemailer = require('nodemailer')
require('dotenv').config()

const sendMail = async (email, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        })

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html: html
        })
        console.log("email sent sucessfully");
    } catch (error) {
        console.log("email not sent");
        console.log(error);
    }
}

module.exports = sendMail;