"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeMail = exports.orderStatusMail = exports.sendOrderMail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
// ====================================================================
// Reusable HTML Template & Styling
// ====================================================================
const brandPrimary = "#CC7722";
const brandSecondary = "#2C1202";
const successColor = "#28A745";
const dangerColor = "#DC3545";
const lightGrey = "#f4f4f4";
/**
 * Creates a reusable, styled HTML email template.
 * @param title The title for the email header.
 * @param contentHtml The main HTML content of the email.
 * @param buttonText The text for the call-to-action button.
 * @param buttonLink The URL for the button.
 * @param buttonColor The background color for the button.
 */
const createEmailTemplate = (title, contentHtml, buttonText, buttonLink, buttonColor = brandPrimary) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: ${brandSecondary}; background-color: ${lightGrey}; padding: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border-collapse: collapse; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <tr>
          <td align="center" style="padding: 24px; background-color: ${brandPrimary}; color: #ffffff;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; font-family: 'Georgia', serif;">${title}</h1>
          </td>
        </tr>
        
        <tr>
          <td style="padding: 32px;">
            ${contentHtml}
            ${buttonText && buttonLink
        ? `
              <table cellspacing="0" cellpadding="0" border="0" style="margin: 24px auto;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: ${buttonColor};">
                    <a href="${buttonLink}" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 6px; padding: 12px 24px; border: 1px solid ${buttonColor}; display: inline-block; font-weight: bold;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            `
        : ""}
          </td>
        </tr>
        
        <tr>
          <td align="center" style="padding: 24px; background-color: ${brandSecondary}; color: #ffffff; font-size: 12px;">
            <p style="margin: 0;">&copy; 2025 Show Royal Meal. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
};
// ====================================================================
// Updated Mailer Functions
// ====================================================================
const sendOrderMail = async (to, name, orderId) => {
    const mailContent = `
    <h2 style="font-size: 22px; margin-top: 0;">Hello, ${name}!</h2>
    <p style="font-size: 16px; line-height: 1.6;">
      Thank you for your order! We've received it and are preparing it now.
      Your order number is <strong style="color: ${brandPrimary};">${orderId}</strong>.
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      We'll let you know when it's on its way!
    </p>
  `;
    const mailOptions = {
        from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
        to,
        subject: `Order Confirmed - #${orderId}`,
        html: createEmailTemplate("Order Confirmation", mailContent, "View Your Order", `https://yourwebsite.com/orders/${orderId}`, successColor),
    };
    await exports.transporter.sendMail(mailOptions);
};
exports.sendOrderMail = sendOrderMail;
const orderStatusMail = async (to, name, status, orderId) => {
    const title = "Order Status Update";
    let content = "";
    let buttonColor = brandPrimary;
    let statusMessage = "";
    if (status === "shipped") {
        statusMessage = "Your order has been shipped!";
        content = `
      <h2 style="font-size: 22px; margin-top: 0;">Hi ${name},</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        Great news! Your order <strong>#${orderId}</strong> has been shipped and is on its way to you.
      </p>
    `;
    }
    else if (status === "delivered") {
        statusMessage = "Your order has been delivered!";
        content = `
      <h2 style="font-size: 22px; margin-top: 0;">Hello ${name},</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        Your order <strong>#${orderId}</strong> has been successfully delivered. We hope you enjoy it!
      </p>
    `;
        buttonColor = successColor;
    }
    else if (status === "cancelled") {
        statusMessage = "Your order has been cancelled.";
        content = `
      <h2 style="font-size: 22px; margin-top: 0;">Hi ${name},</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        We regret to inform you that your order <strong>#${orderId}</strong> has been cancelled.
      </p>
    `;
        buttonColor = dangerColor;
    }
    const mailOptions = {
        from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
        to,
        subject: `Order #${orderId} - ${statusMessage}`,
        html: createEmailTemplate(title, content, "View Order Details", `https://yourwebsite.com/orders/${orderId}`, buttonColor),
    };
    await exports.transporter.sendMail(mailOptions);
};
exports.orderStatusMail = orderStatusMail;
const welcomeMail = async (to, name) => {
    const mailContent = `
    <h2 style="font-size: 22px; margin-top: 0;">Welcome, ${name}!</h2>
    <p style="font-size: 16px; line-height: 1.6;">
      We're thrilled to have you as part of the Show Royal Meal family. You can now explore our delicious menu and place your first order.
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Thank you for joining us!
    </p>
  `;
    const mailOptions = {
        from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
        to,
        subject: "Welcome to Show Royal Meal!",
        html: createEmailTemplate("Welcome Aboard", mailContent, "Browse Our Menu", "https://yourwebsite.com/menu"),
    };
    await exports.transporter.sendMail(mailOptions);
};
exports.welcomeMail = welcomeMail;
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();
// export const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });
// export const sendOrderMail = async (
//   to: string,
//   name: string,
//   orderId: string
// ) => {
//   const mailOptions = {
//     from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
//     to,
//     subject: "Order Confirmation",
//     html: `
//         <h2>Hi ${name},</h2>
//         <p>We’ve received your order <strong>${orderId}</strong>.</p>
//          <p>Thank you for shopping with us!</p>
//         `,
//   };
//   await transporter.sendMail(mailOptions);
// };
// interface MailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }
// export const orderStatusMail = async ({ to, subject, html }: MailOptions) => {
//   await transporter.sendMail({
//     from: `"Mr chris bread company" <${process.env.MAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };
// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }
// export const welcomeMail = async ({ to, subject, html }: EmailOptions) => {
//   await transporter.sendMail({
//     from: `"Mr Chris bread company" <${process.env.MAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };
