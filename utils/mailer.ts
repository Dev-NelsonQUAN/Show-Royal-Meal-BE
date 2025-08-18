import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const brandPrimary = "#FF6347";
const brandSecondary = "#333333";
const lightGrey = "#f7f7f7";
const successColor = "#28a745";
const dangerColor = "#dc3545";

const createEmailTemplate = (
  title: string,
  contentHtml: string,
  buttonText?: string,
  buttonLink?: string,
  buttonColor: string = brandPrimary
) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 16px; color: ${brandSecondary}; background-color: ${lightGrey}; padding: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border-collapse: separate; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <tr>
          <td align="center" style="padding: 24px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: ${brandPrimary};">Show Royal Meal</h1>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 32px 24px;">
            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: ${brandSecondary};">${title}</h2>
            ${contentHtml}
            ${
              buttonText && buttonLink
                ? `
              <table cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${buttonLink}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: ${buttonColor}; border-radius: 6px; text-decoration: none; border: 1px solid ${buttonColor};">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            `
                : ""
            }
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 16px; background-color: ${brandSecondary}; color: #ffffff; font-size: 12px;">
            <p style="margin: 0;">&copy; 2025 Show Royal Meal. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
};

export const sendUserWelcomeMail = async (to: string, name: string) => {
  const mailContent = `
    <p style="font-size: 16px; line-height: 1.6;">Hello ${name},</p>
    <p style="font-size: 16px; line-height: 1.6;">We're so happy to have you! You're now officially a part of the Show Royal Meal family. Get ready to experience some delicious food.</p>
    <p style="font-size: 16px; line-height: 1.6;">Explore our full menu and place your first order today!</p>
  `;

  const mailOptions = {
    from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
    to,
    subject: "Welcome to Show Royal Meal! 🎉",
    html: createEmailTemplate(
      "Welcome Aboard!",
      mailContent,
      "Browse Our Menu",
      "https://yourwebsite.com/menu"
    ),
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminNotificationMail = async (
  adminEmail: string,
  newUserName: string,
  newUserEmail: string
) => {
  const mailContent = `
    <p style="font-size: 16px; line-height: 1.6;">Hello Admin,</p>
    <p style="font-size: 16px; line-height: 1.6;">A new user has just signed up!</p>
    <ul style="list-style-type: none; padding: 0; margin-top: 20px;">
      <li style="margin-bottom: 10px;"><strong>Name:</strong> ${newUserName}</li>
      <li><strong>Email:</strong> ${newUserEmail}</li>
    </ul>
  `;

  const mailOptions = {
    from: `"Show Royal Meal Admin" <${process.env.MAIL_USER}>`,
    to: adminEmail,
    subject: "New User Registration",
    html: createEmailTemplate("New User Registered", mailContent),
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderMail = async (
  to: string,
  name: string,
  orderId: string
) => {
  const mailContent = `
    <h3 style="font-size: 20px; margin-top: 0; color: ${brandPrimary};">Hello, ${name}!</h3>
    <p style="font-size: 16px; line-height: 1.6;">
      Thank you for your order! We've received it and are preparing it now. Your order number is <strong>#${orderId}</strong>.
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      We'll let you know when it's on its way!
    </p>
  `;

  const mailOptions = {
    from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
    to,
    subject: `Order Confirmed - #${orderId}`,
    html: createEmailTemplate(
      "Order Confirmation",
      mailContent,
      "View Your Order",
      `https://yourwebsite.com/orders/${orderId}`,
      successColor
    ),
  };
  await transporter.sendMail(mailOptions);
};

export const orderStatusMail = async (
  to: string,
  name: string,
  status: "shipped" | "delivered" | "cancelled",
  orderId: string
) => {
  let title = "Order Status Update";
  let content = "";
  let buttonColor = brandPrimary;

  switch (status) {
    case "shipped":
      title = `Order #${orderId} has Shipped! 🚀`;
      content = `<p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p><p style="font-size: 16px; line-height: 1.6;">Great news! Your order <strong>#${orderId}</strong> has been shipped and is on its way to you.</p>`;
      break;
    case "delivered":
      title = `Order #${orderId} Delivered! ✅`;
      content = `<p style="font-size: 16px; line-height: 1.6;">Hello ${name},</p><p style="font-size: 16px; line-height: 1.6;">Your order <strong>#${orderId}</strong> has been successfully delivered. We hope you enjoy it!</p>`;
      buttonColor = successColor;
      break;
    case "cancelled":
      title = `Order #${orderId} Cancelled 😔`;
      content = `<p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p><p style="font-size: 16px; line-height: 1.6;">We regret to inform you that your order <strong>#${orderId}</strong> has been cancelled.</p>`;
      buttonColor = dangerColor;
      break;
  }

  const mailOptions = {
    from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
    to,
    subject: title,
    html: createEmailTemplate(
      title,
      content,
      "View Order Details",
      `https://yourwebsite.com/orders/${orderId}`,
      buttonColor
    ),
  };
  await transporter.sendMail(mailOptions);
};

export const sendBulkWaitlistEmail = async (
  recipientEmails: string[],
  subject: string,
  htmlMessage: string
): Promise<void> => {
  console.log(
    `Starting bulk email job to ${recipientEmails.length} recipients...`
  );

  const emailHtml = createEmailTemplate(subject, htmlMessage);

  const mailOptions = {
    from: `"Show Royal Meal" <${process.env.MAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
    bcc: recipientEmails,
    subject: subject,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Bulk email job successfully sent to mail provider.");
  } catch (error) {
    console.error("Failed to send bulk email:", error);
    throw new Error("The email service failed to send the bulk message.");
  }
};
