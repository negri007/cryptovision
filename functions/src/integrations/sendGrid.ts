import axios from 'axios';
import * as logger from 'firebase-functions/logger';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'no-reply@cryptovision.com';
const FROM_NAME = 'CryptoVision';

const isMockMode = () => !SENDGRID_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';

export async function sendEmail(
  to: string, 
  subject: string, 
  templateId: string, 
  dynamicData: Record<string, any>
): Promise<boolean> {
  if (isMockMode()) {
    logger.info(`SendGrid Mock: Sending Email to [${to}]`, {
      subject,
      templateId,
      dynamicData
    });
    return true;
  }

  try {
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [
          {
            to: [{ email: to }],
            dynamic_template_data: dynamicData
          }
        ],
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject,
        template_id: templateId
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.status === 202;
  } catch (error: any) {
    logger.error(`SendGrid: Failed to send email to ${to}`, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}
