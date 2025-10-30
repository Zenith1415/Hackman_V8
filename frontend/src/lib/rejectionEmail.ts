import nodemailer from 'nodemailer';

export type RejectionEmailPayload = {
  teamName: string;
  teamCode: string;
  recipients: string[];
  feedback?: string;
};

export function buildRejectionEmailHtml(teamName: string, teamCode: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center; margin-bottom: 30px;">
         Application Update | HackmanV8
      </h2>

      <h3>Hello ${teamName},</h3>

      <p>Thank you for applying to <strong><a href="https://hackman.dsce.in/">HackmanV8</a></strong> and for the time and effort your team put into your submission.</p>

      <p>After careful consideration, we regret to inform you that your team has <strong>not been selected</strong> for this edition of HackmanV8.</p>

      

      <p>We received many high-quality submissions and the selection process was very competitive. We encourage you to keep building and to apply again in the future.</p>

      <h4>Next steps</h4>
      <ul>
        <li>Save any materials you submitted</li>
       
        <li>Follow us On our <strong><a href="https://www.instagram.com/wearehackman?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==">Instagram</a></strong> and future events and opportunities</li>
      </ul>

      <p>If you have any questions , feel free to reply to this email.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="font-size: 12px; color: #666; text-align: center;">
        HackmanV8<br>
        Questions? Contact us at ise.genesis.dsce@gmail.com
      </p>
    </div>
  `;
}

export async function sendRejectionEmail({ teamName, teamCode, recipients }: RejectionEmailPayload): Promise<void> {
  if (!recipients || recipients.length === 0) {
    console.warn('No recipients for rejection email');
    return;
  }

  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error('Email not sent: EMAIL_SERVER_USER or EMAIL_SERVER_PASSWORD not set');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.info('Email transporter verified for rejection emails');
  } catch (verifyErr) {
    console.error('Email transporter verification failed:', verifyErr);
    // proceed anyway
  }

  const subject = 'HackmanV8 — Application Update';
  const html = buildRejectionEmailHtml(teamName, teamCode);

  console.info(`Sending rejection email to ${recipients.length} recipient(s) for team ${teamCode}`);
  try {
    await Promise.all(
      recipients.map((to) =>
        transporter.sendMail({
          from: `Hackman V8 Team <${process.env.EMAIL_SERVER_USER}>`,
          to,
          subject,
          html,
        })
      )
    );
    console.info(`Successfully sent rejection email to team ${teamCode}`);
  } catch (sendErr) {
    console.error('Failed to send rejection email(s):', sendErr);
    throw sendErr;
  }
}
