interface SMSParams {
  to: string;
  message: string;
}

const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const AFRICASTALKING_SENDER_ID = process.env.AFRICASTALKING_SENDER_ID || 'BusyBeds';

export async function sendSMS({ to, message }: SMSParams): Promise<boolean> {
  if (!AFRICASTALKING_API_KEY) {
    console.log(`📱 [DEV MODE] SMS not sent (no Africa's Talking API key)`);
    console.log(`   To: ${to}`);
    console.log(`   Message: ${message}`);
    console.log('---');
    return true;
  }

  try {
    const response = await fetch(
      'https://api.africastalking.com/version1/messaging',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          apiKey: AFRICASTALKING_API_KEY,
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          username: AFRICASTALKING_USERNAME,
          to,
          message,
          from: AFRICASTALKING_SENDER_ID,
        }),
      }
    );

    const data = await response.json();

    if (data.SMSMessageData?.Recipients?.[0]?.statusCode === 101) {
      return true;
    }

    console.error('❌ SMS send failed:', JSON.stringify(data));
    return false;
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    return false;
  }
}
