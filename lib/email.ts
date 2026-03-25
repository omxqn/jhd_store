import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const smtpPort = Number(process.env.SMTP_PORT) || 587; // Updated default to 587 (STARTTLS)

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465, // Use true only for 465 (SMTPS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
    },
    family: 4,
    connectionTimeout: 10000, // 10s
} as any);

const headerImagePath = path.join(process.cwd(), "public", "email-header.png");
const emailAttachments = [
    {
        filename: "email-header.png",
        path: headerImagePath,
        cid: "jhd-header",
        contentDisposition: "inline" as const
    }
];

export type OrderEmailData = {
    orderId: number | string;
    customerName: string;
    customerEmail: string;
    total: number;
    currency: string;
    status: string;
    items: any[];
};

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    if (!process.env.SMTP_USER) {
        console.warn("SMTP_USER not configured. Skipping email.");
        return;
    }

    const itemsHtml = data.items.map(item => `
                            <tr>
                                <td style="border-bottom: 1px solid #eeeeee;">
                                    <strong style="font-size: 14px; color: #333;">${item.name}</strong><br>
                                    <span style="font-size: 12px; color: #777;">${item.fabricType || ""}${item.neckline ? ", " + item.neckline : ""}</span>
                                </td>
                                <td align="center" style="border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333;">${item.quantity}</td>
                                <td align="left" style="border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333;">${data.currency} ${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
    `).join("");

    const orderDetailLink = `${process.env.NEXT_PUBLIC_URL || 'https://jhd-line.com'}/myaccount/order-detail?id=${data.orderId}`;
    const invoiceLink = `${process.env.NEXT_PUBLIC_URL || 'https://jhd-line.com'}/api/admin/orders/${data.orderId}/invoice`;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif; }
    table { border-collapse: collapse; }
    .btn { display: inline-block; background-color: #b83424; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 15px; margin: 5px; }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif;">

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf5ce; padding: 20px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">
                
                <tr>
                    <td align="center" style="background-color: transparent;">
                        <img src="cid:jhd-header" alt="JHD Line Banner" width="100%" style="display: block; max-width: 100%; height: auto; border: 0; background-color: transparent;">
                    </td>
                </tr>

                <tr>
                    <td style="padding: 30px 30px 10px 30px;">
                        
                        <h2 style="color: #172370; font-size: 20px; margin-top: 0; text-align: right;">${data.customerName}! شكرًا لطلبك،</h2>
                        
                        <p style="color: #333333; font-size: 15px; line-height: 1.6; text-align: right;">
                            يسعدنا إبلاغك بأنه قد تم استلام طلبك رقم <strong>#${data.orderId}</strong> وهو قيد المراجعة حاليًا.
                        </p>

                        <table width="100%" border="0" cellspacing="0" cellpadding="15" style="margin-top: 20px; text-align: right; border-bottom: 1px solid #eeeeee;">
                            <tr style="background-color: #fafafa; font-weight: bold; font-size: 14px;">
                                <td width="50%" style="border-bottom: 1px solid #eeeeee;">المنتج</td>
                                <td width="20%" style="border-bottom: 1px solid #eeeeee;" align="center">الكمية</td>
                                <td width="30%" style="border-bottom: 1px solid #eeeeee;" align="left">المجموع</td>
                            </tr>
                            ${itemsHtml}
                        </table>

                        <table width="100%" border="0" cellspacing="0" cellpadding="15">
                            <tr>
                                <td align="right" style="font-weight: bold; font-size: 16px;">الإجمالي الكلي</td>
                                <td align="left" style="font-weight: bold; font-size: 18px; color: #b83424;">${data.currency} ${data.total.toFixed(2)}</td>
                            </tr>
                        </table>

                        <div style="background-color: #faf8f0; padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <h3 style="color: #172370; font-size: 16px; margin: 0 0 10px 0;">تتبع طلبك</h3>
                            <p style="color: #555555; font-size: 14px; margin: 0; line-height: 1.5;">
                                يمكنك تتبع حالة طلبك عبر حسابك الشخصي في المتجر في أي وقت.
                            </p>
                        </div>

                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 30px;">
                            <tr>
                                <td align="center">
                                    <a href="${orderDetailLink}" style="display: block; width: 200px; background-color: #b83424; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 15px;">مشاهدة تفاصيل الطلب</a>
                                    <a href="${invoiceLink}" style="display: block; width: 200px; background-color: #b83424; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 16px;">تحميل الفاتوره</a>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>

                <tr>
                    <td align="center" style="background-color: #b83424; padding: 15px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://jhd-line.com'}" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold;">زيارة الموقع</a>
                        <span style="color: #ffffff; margin: 0 10px;">|</span>
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://jhd-line.com'}/contact" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold;">تواصل معنا</a>
                    </td>
                </tr>
            </table>

            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                <tr>
                    <td align="center" style="padding: 20px; color: #b83424; font-size: 12px; font-weight: bold; line-height: 1.8;">
                        جميع الحقوق محفوظة. ${new Date().getFullYear()} JHD.LINE ©<br>
                        هذا البريد الإلكتروني مرسل آليًا، يرجى عدم الرد عليه.
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>

</body>
</html>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE" <${process.env.SMTP_USER}>`,
        to: data.customerEmail,
        subject: `تأكيد الطلب #${data.orderId} - JHD.LINE`,
        html,
        attachments: emailAttachments,
    });
}

export async function sendOrderStatusUpdateEmail(data: OrderEmailData) {
    if (!process.env.SMTP_USER) return;

    const statusMap: Record<string, string> = {
        paid: "تم تأكيد الدفع",
        processing: "قيد التنفيذ والمراجعة",
        shipped: "تم الشحن وهو في طريقه إليك",
        delivered: "تم التوصيل بنجاح",
    };

    const statusText = statusMap[data.status] || data.status;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif; }
    table { border-collapse: collapse; }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif;">

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf5ce; padding: 20px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">
                
                <tr>
                    <td align="center" style="background-color: transparent;">
                        <img src="cid:jhd-header" alt="JHD Line Banner" width="100%" style="display: block; max-width: 100%; height: auto; border: 0; background-color: transparent;">
                    </td>
                </tr>

                <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                        <div style="text-align: center;">
                            <div style="font-size: 40px; margin-bottom: 20px;">🚚</div>
                            <h2 style="color: #172370; font-size: 20px; margin-top: 0;">تحديث حالة الطلب #${data.orderId}</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6;">أهلاً ${data.customerName}،</p>
                            <p style="color: #555555; font-size: 15px;">نود إبلاغك بأن حالة طلبك قد تغيرت إلى:</p>
                            
                            <div style="display: inline-block; padding: 10px 25px; background-color: #b83424; color: #ffffff; border-radius: 50px; font-weight: bold; font-size: 18px; margin: 20px 0;">
                                ${statusText}
                            </div>
                            
                            <p style="color: #666666; font-size: 14px; margin-top: 20px;">شكراً لتسوقك معنا!</p>
                            
                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                            
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://jhd-line.com'}/myaccount/order-detail?id=${data.orderId}" 
                               style="display: inline-block; padding: 12px 30px; background-color: #172370; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                               تتبع الطلب الآن
                            </a>
                        </div>
                    </td>
                </tr>
                
                <tr>
                    <td align="center" style="background-color: #b83424; padding: 15px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://jhd-line.com'}" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold;">زيارة الموقع</a>
                        <span style="color: #ffffff; margin: 0 10px;">|</span>
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://jhd-line.com'}/contact" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold;">تواصل معنا</a>
                    </td>
                </tr>
            </table>

            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                <tr>
                    <td align="center" style="padding: 20px; color: #b83424; font-size: 12px; font-weight: bold; line-height: 1.8;">
                        جميع الحقوق محفوظة. ${new Date().getFullYear()} JHD.LINE ©<br>
                        هذا البريد الإلكتروني مرسل آليًا، يرجى عدم الرد عليه.
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>

</body>
</html>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE" <${process.env.SMTP_USER}>`,
        to: data.customerEmail,
        subject: `تحديث حالة طلبك #${data.orderId} - JHD.LINE`,
        html,
        attachments: emailAttachments,
    });
}

export async function sendTicketReplyEmail({ ticketId, customerName, customerEmail, subject, replyMessage }: { ticketId: string | number, customerName: string, customerEmail: string, subject: string, replyMessage: string }) {
    if (!process.env.SMTP_USER) return;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf5ce; padding: 20px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">
                <tr>
                    <td align="center">
                        <img src="cid:jhd-header" alt="JHD Line Banner" width="100%" style="display: block; max-width: 100%; height: auto; border: 0;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px; text-align: right;">
                        <h2 style="color: #172370; margin-top: 0;">تحديث تذكرة الدعم #${ticketId}</h2>
                        <p style="color: #333; font-size: 16px;">أهلاً ${customerName}،</p>
                        <p style="color: #555; font-size: 15px;">قام فريق الدعم بالرد على تذكرتك المتعلقة بـ <strong>"${subject}"</strong>:</p>
                        
                        <div style="background-color: #f8f9fa; border-right: 4px solid #b83424; padding: 15px; margin: 20px 0; color: #333; font-size: 14px; white-space: pre-wrap;">${replyMessage}</div>
                        
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://jhd-line.com'}/myaccount/support/${ticketId}" 
                           style="display: inline-block; padding: 12px 30px; background-color: #172370; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                           مشاهدة التذكرة كاملة
                        </a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE Support" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `تحديث التذكرة #${ticketId} - ${subject}`,
        html,
        attachments: emailAttachments,
    });
}

export async function sendAdminTicketAlert(adminEmail: string, { ticketId, customerName, subject }: { ticketId: string | number, customerName: string, subject: string }) {
    if (!process.env.SMTP_USER) return;
    const html = `<p>New support ticket #${ticketId} opened by ${customerName}. Subject: ${subject}</p>`;
    await transporter.sendMail({
        from: `"System Alert" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `[ADMIN] New Ticket #${ticketId} from ${customerName}`,
        html,
    });
}

export async function sendAdminOrderAlert(data: OrderEmailData, adminEmail: string) {
    if (!process.env.SMTP_USER) return;

    const itemsHtml = data.items.map(item => `
        <li>${item.name} (x${item.quantity}) - ${data.currency} ${(item.price * item.quantity).toFixed(2)}</li>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif; }
    table { border-collapse: collapse; }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif;">

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf5ce; padding: 20px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; width: 100%; text-align: left;">
                
                <tr>
                    <td align="center" style="background-color: transparent;">
                        <img src="cid:jhd-header" alt="JHD Line Banner" width="100%" style="display: block; max-width: 100%; height: auto; border: 0; background-color: transparent;">
                    </td>
                </tr>

                <tr>
                    <td style="padding: 30px;">
                        <h2 style="color: #172370; font-size: 20px; margin-top: 0;">New Order Received! 🛍️</h2>
                        <p style="color: #333333; font-size: 15px;"><strong>Order ID:</strong> #${data.orderId}</p>
                        <p style="color: #333333; font-size: 15px;"><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
                        <p style="color: #333333; font-size: 15px;"><strong>Total Amount:</strong> ${data.currency} ${data.total.toFixed(2)}</p>
                        
                        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                        
                        <h3 style="color: #172370; font-size: 16px;">Order Items:</h3>
                        <ul style="color: #555555; font-size: 14px; line-height: 1.6;">
                            ${itemsHtml}
                        </ul>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://jhd-line.com'}/admin" 
                               style="display: inline-block; padding: 12px 25px; background-color: #b83424; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                               Manage Order in Admin Panel
                            </a>
                        </div>
                    </td>
                </tr>
            </table>

            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                <tr>
                    <td align="center" style="padding: 20px; color: #b83424; font-size: 12px; font-weight: bold; line-height: 1.8;">
                        JHD.LINE System Alert<br>
                        This is an automated administrative notification.
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>

</body>
</html>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE System" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `[ADMIN ALERT] New Order #${data.orderId} from ${data.customerName}`,
        html,
        attachments: emailAttachments,
    });
}

export async function sendOTPEmail(email: string, otp: string) {
    if (!process.env.SMTP_USER) return;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif; }
    table { border-collapse: collapse; }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf5ce; font-family: Tahoma, Arial, sans-serif;">

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf5ce; padding: 20px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">
                
                <tr>
                    <td align="center" style="background-color: transparent;">
                        <img src="cid:jhd-header" alt="JHD Line Banner" width="100%" style="display: block; max-width: 100%; height: auto; border: 0; background-color: transparent;">
                    </td>
                </tr>

                <tr>
                    <td style="padding: 40px 30px;">
                        
                        <h2 style="color: #000000; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 20px; text-align: right;">رمز التحقق الخاص بك (OTP)</h2>
                        
                        <p style="color: #888888; font-size: 15px; margin-bottom: 30px; line-height: 1.5; text-align: right;">
                            مرحباً بك في عالم جهاد! استخدم الرمز التالي لإتمام عملية تسجيل الدخول:
                        </p>

                        <div style="margin: 30px 0;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="background-color: #f8f6f0; border: 2px dashed #b83424; border-radius: 8px; padding: 25px;">
                                        <span style="color: #b83424; font-size: 28px; font-weight: bold; letter-spacing: 12px; font-family: monospace;">${otp}</span>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <p style="color: #a0a0a0; font-size: 13px; text-align: right; margin-bottom: 30px;">
                            هذا الرمز صالح لمدة 10 دقائق فقط. إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد.
                        </p>

                        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 30px 0;">

                        <p style="color: #b83424; font-size: 14px; font-weight: bold; text-align: center; margin: 0;">
                            شكراً لثقتك بـ JHD.LINE
                        </p>

                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

</body>
</html>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE Auth" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `رمز التحقق الخاص بك: ${otp} - JHD.LINE`,
        html,
        attachments: emailAttachments,
    });
}
