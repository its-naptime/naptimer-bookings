import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const RATE_LIMIT = {
  WINDOW_HOURS: 1,
  MAX_REQUESTS: 3,
};

async function checkRateLimit(identifier: string) {
  try {
    const key = `booking:ratelimit:${identifier}`;
    const now = Date.now();
    const windowMs = RATE_LIMIT.WINDOW_HOURS * 3600000;

    // Get existing count
    const count = await redis.get(key);
    
    if (!count) {
      // First request
      await redis.set(key, '1', { ex: RATE_LIMIT.WINDOW_HOURS * 3600 });
      return {
        allowed: true
      };
    }

    const currentCount = parseInt(count as string);
    
    if (currentCount >= RATE_LIMIT.MAX_REQUESTS) {
      // Get TTL for reset time
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        resetInSeconds: ttl
      };
    }

    // Increment count
    await redis.incr(key);
    
    return {
      allowed: true
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // If Redis fails, dont allow the request but log the error
    return { allowed: false };
  }
}

function formatContactPreferences(formData: FormData): string {
  const preferences = [];
  if (formData.get('contactPreferences.instagram') === 'true') preferences.push('Instagram');
  if (formData.get('contactPreferences.mobile') === 'true') preferences.push('Mobile (WhatsApp/Telegram)');
  if (formData.get('contactPreferences.email') === 'true') preferences.push('Email');
  return preferences.join(', ');
}

export async function POST(request: Request) {
  try {
    // Get device identifier
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const deviceId = `booking-${userAgent}`;

    // Check rate limit
    const rateLimit = await checkRateLimit(deviceId);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: 'Too many requests',
        resetInSeconds: rateLimit.resetInSeconds,
      }, { status: 429 });
    }

    const formData = await request.formData();
    
    // Handle file uploads
    const images = formData.getAll('images') as File[];
    const imageAttachments = await Promise.all(
      images.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          filename: file.name,
          content: buffer,
          contentType: file.type,
        };
      })
    );

    const contactPreferences = formatContactPreferences(formData);

    // Prepare email content
    const emailContent = {
      from: {
        name: "Tattoo Booking System",
        address: process.env.GMAIL_USER!
      },
      to: process.env.RECIPIENT_EMAIL,
      subject: 'New Tattoo Booking Request',
      text: `
New Booking Request

Personal Information:
--------------------
Name: ${formData.get('name')}
Pronouns: ${formData.get('pronouns')}
Age: ${formData.get('age')}
Email: ${formData.get('email')}
Contact Number: ${formData.get('contactNumber')}
Instagram: ${formData.get('igHandle')}
Budget: ${formData.get('budget')}

Preferred Contact Methods: ${contactPreferences}

Tattoo Details:
--------------
Placement: ${formData.get('placement')}
Size: ${formData.get('size')}
Available Dates: ${formData.get('availableDates')}

Health Declaration:
-----------------
${formData.get('health')}

Additional Comments:
------------------
${formData.get('comments')}

Number of Reference Images: ${images.length}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Booking Request</h2>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #555;">Personal Information:</h3>
            <p><strong>Name:</strong> ${formData.get('name')}</p>
            <p><strong>Pronouns:</strong> ${formData.get('pronouns')}</p>
            <p><strong>Age:</strong> ${formData.get('age')}</p>
            <p><strong>Email:</strong> ${formData.get('email')}</p>
            <p><strong>Contact Number:</strong> ${formData.get('contactNumber')}</p>
            <p><strong>Instagram:</strong> ${formData.get('igHandle')}</p>
            <p><strong>Budget:</strong> ${formData.get('budget')}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #555;">Preferred Contact Methods:</h3>
            <p>${contactPreferences}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #555;">Tattoo Details:</h3>
            <p><strong>Placement:</strong> ${formData.get('placement')}</p>
            <p><strong>Size:</strong> ${formData.get('size')}</p>
            <p><strong>Available Dates:</strong> ${formData.get('availableDates')}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #555;">Health Declaration:</h3>
            <p>${formData.get('health')}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #555;">Additional Comments:</h3>
            <p>${formData.get('comments')}</p>
          </div>

          <div>
            <h3 style="color: #555;">Reference Images:</h3>
            <p>Number of images attached: ${images.length}</p>
          </div>
        </div>
      `.trim(),
      attachments: imageAttachments,
      replyTo: formData.get('email')?.toString(),
    };

    // Send email
    try {
      await transporter.sendMail(emailContent);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({
        error: 'Failed to send email'
      }, { status: 500 });
    }

    // Store booking in Redis for backup (optional)
    const bookingId = crypto.randomUUID();
    await redis.set(`booking:${bookingId}`, JSON.stringify({
      formData: Object.fromEntries(formData),
      timestamp: Date.now(),
      deviceId,
    }));

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({
      error: 'Failed to process submission'
    }, { status: 500 });
  }
}