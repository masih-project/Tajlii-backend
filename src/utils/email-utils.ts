import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class EmailUtils {
  async sendEmail(info: any) {
    const transporter = await createTransport({
      service: 'gmail',
      auth: {
        user: 'aminsehatidev@gmail.com',
        pass: 'lsvwkghcgcoaecvd',
      },
    });
    const mailOptions = {
      form: 'aminsehati70@gmail.com',
      to: info.to,
      subject: info.subject,
      html: info.html,
    };
    return await transporter.sendMail(mailOptions);
  }
}
