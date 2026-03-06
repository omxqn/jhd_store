import nodemailer from "nodemailer";

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
    connectionTimeout: 10000, // 10s
});

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
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong><br/>
                <small>${item.fabricType || ""}, ${item.neckline || ""}</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${data.currency} ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join("");

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden;">
            <div style="background: #1A1A1A; color: #C62828; padding: 30px; text-align: center;">
                <h1 style="margin: 0; letter-spacing: 2px;">JHD.LINE</h1>
                <p style="color: #F9F1C8; margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Premium Bespoke Fashion</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #283593;">شكرًا لطلبك، ${data.customerName}!</h2>
                <p>يسعدنا إبلاغك بأنه قد تم استلام طلبك رقم <strong>#${data.orderId}</strong> وهو قيد المراجعة حاليًا.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f9f9f9;">
                            <th style="padding: 10px; text-align: right;">المنتج</th>
                            <th style="padding: 10px; text-align: center;">الكمية</th>
                            <th style="padding: 10px; text-align: left;">المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 20px 10px 10px; text-align: right; font-weight: bold;">الإجمالي الكلي</td>
                            <td style="padding: 20px 10px 10px; text-align: left; font-weight: bold; color: #C62828; font-size: 18px;">${data.currency} ${data.total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="background: #FDF9F0; padding: 20px; border-radius: 10px; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #283593;">تتبع طلبك</h4>
                    <p style="margin: 0; font-size: 14px; color: #555;">يمكنك تتبع حالة طلبك عبر حسابك الشخصي في المتجر في أي وقت.</p>
                </div>
            </div>
            <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} JHD.LINE. جميع الحقوق محفوظة.<br/>
                هذا البريد الإلكتروني مرسل آليًا، يرجى عدم الرد عليه.
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE" <${process.env.SMTP_USER}>`,
        to: data.customerEmail,
        subject: `تأكيد الطلب #${data.orderId} - JHD.LINE`,
        html,
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
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden;">
            <div style="background: #1A1A1A; color: #C62828; padding: 30px; text-align: center;">
                <h1 style="margin: 0; letter-spacing: 2px;">JHD.LINE</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px;">🚚</div>
                <h2 style="color: #283593;">تحديث حالة الطلب #${data.orderId}</h2>
                <p style="font-size: 18px; color: #333;">أهلاً ${data.customerName}،</p>
                <p>نود إبلاغك بأن حالة طلبك قد تغيرت إلى:</p>
                <div style="display: inline-block; padding: 10px 25px; background: #E53935; color: white; border-radius: 50px; font-weight: bold; font-size: 20px; margin: 20px 0;">
                    ${statusText}
                </div>
                <p style="color: #666;">شكراً لتسوقك معنا!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
                <a href="${process.env.NEXT_PUBLIC_URL || 'https://jhd-line.com'}/myaccount/order-detail?id=${data.orderId}" 
                   style="display: inline-block; padding: 12px 30px; background: #283593; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   تتبع الطلب الآن
                </a>
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE" <${process.env.SMTP_USER}>`,
        to: data.customerEmail,
        subject: `تحديث حالة طلبك #${data.orderId} - JHD.LINE`,
        html,
    });
}

export async function sendAdminOrderAlert(data: OrderEmailData, adminEmail: string) {
    if (!process.env.SMTP_USER) return;

    const itemsHtml = data.items.map(item => `
        <li>${item.name} (x${item.quantity}) - ${data.currency} ${(item.price * item.quantity).toFixed(2)}</li>
    `).join("");

    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-top: 5px solid #C62828;">
            <h2 style="color: #1A1A1A;">New Order Received! 🛍️</h2>
            <p><strong>Order ID:</strong> #${data.orderId}</p>
            <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
            <p><strong>Total Amount:</strong> ${data.currency} ${data.total.toFixed(2)}</p>
            <hr/>
            <h3>Order Items:</h3>
            <ul>
                ${itemsHtml}
            </ul>
            <p style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_URL || 'https://jhd-line.com'}/admin" 
                   style="display: inline-block; padding: 10px 20px; background: #C62828; color: white; text-decoration: none; border-radius: 5px;">
                   Manage Order in Admin Panel
                </a>
            </p>
        </div>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE System" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `[ADMIN ALERT] New Order #${data.orderId} from ${data.customerName}`,
        html,
    });
}

export async function sendOTPEmail(email: string, otp: string) {
    if (!process.env.SMTP_USER) return;

    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; direction: rtl; text-align: right;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #C62828; margin: 0; font-size: 28px;">JHD.LINE</h1>
            </div>
            <h2 style="color: #1A1A1A; margin-bottom: 20px;">رمز التحقق الخاص بك (OTP)</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                مرحباً بك في عالم جهاد! استخدم الرمز التالي لإتمام عملية تسجيل الدخول:
            </p>
            <div style="background: #FDF9F0; border: 2px dashed #C62828; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 12px; color: #C62828; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">
                هذا الرمز صالح لمدة 10 دقائق فقط. إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد.
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #C62828; font-weight: 600; text-align: center;">شكراً لثقتك بـ JHD.LINE</p>
        </div>
    `;

    await transporter.sendMail({
        from: `"JHD.LINE Auth" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `رمز التحقق الخاص بك: ${otp} - JHD.LINE`,
        html,
    });
}
