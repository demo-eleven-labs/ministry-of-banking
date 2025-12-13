const crypto = require('crypto');
const { Resend } = require('resend');

// Configure Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Generate a 6-digit OTP code
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP code to user's email using Resend
// For demo purposes, also log it to console
async function sendOTP(email) {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    console.log(
      `For Demo purposes: OTP for ${email}: ${otp} (expires at ${expiresAt.toISOString()})`
    );

    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Ministry of Banking <onboarding@resend.dev>',
          to: email,
          subject: 'Your Ministry of Banking Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Ministry of Banking</h2>
              <p>Your verification code is:</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #6b7280;">This code will expire in 5 minutes.</p>
              <p style="color: #6b7280; font-size: 12px;">If you did not request this code, please ignore this email.</p>
            </div>
          `,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          return {
            success: true,
            otp: otp,
            expiresAt: expiresAt.toISOString(),
            message: `OTP generated. Email delivery failed, check server console for code.`,
          };
        }

        console.log(`✅ OTP email sent successfully to ${email} (ID: ${data.id})`);

        return {
          success: true,
          otp: otp,
          expiresAt: expiresAt.toISOString(),
          message: `OTP sent to ${email}.`,
        };
      } catch (emailError) {
        console.error('❌ Resend error:', emailError.message);
        return {
          success: true,
          otp: otp,
          expiresAt: expiresAt.toISOString(),
          message: `OTP generated. Email delivery failed, check console log for the code.`,
        };
      }
    } else {
      console.log('⚠️ Resend not configured. OTP only available in console.');
      return {
        success: true,
        otp: otp,
        expiresAt: expiresAt.toISOString(),
        message: `OTP sent to ${email}. For demo purposes, check server console.`,
      };
    }
  } catch (error) {
    console.error('❌ Error generating OTP:', error);
    return {
      success: false,
      message: 'Failed to generate OTP code',
    };
  }
}

// Verify if OTP is still valid (not expired)
function isOTPValid(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

module.exports = {
  generateOTP,
  sendOTP,
  isOTPValid,
};
