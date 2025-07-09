import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  code: string;
  type: 'email_verification' | 'password_reset';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, type }: VerificationEmailRequest = await req.json();

    let subject = "Подтверждение email - Eva Platform";
    let htmlContent = "";

    if (type === 'email_verification') {
      subject = "Подтверждение email - Eva Platform";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; font-size: 28px; margin: 0;">Eva Platform</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Ваш персональный помощник в период менопаузы</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; font-size: 24px; margin: 0 0 15px 0;">Подтвердите ваш email</h2>
            <p style="color: white; font-size: 16px; margin: 0 0 20px 0;">
              Введите этот код в форме регистрации для подтверждения email адреса:
            </p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #8B5CF6; letter-spacing: 4px;">${code}</span>
            </div>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 15px 0 0 0;">
              Код действителен в течение 10 минут
            </p>
          </div>
          
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">🛡️ Безопасность - наш приоритет</h3>
            <ul style="color: #6B7280; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Никогда не сообщайте этот код третьим лицам</li>
              <li>Мы никогда не просим подтвердить данные по email или телефону</li>
              <li>Все ваши данные защищены шифрованием AES-256</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>Если вы не регистрировались на Eva Platform, просто проигнорируйте это письмо.</p>
            <p style="margin-top: 20px;">
              <strong>Eva Platform</strong><br>
              Поддержка: support@eva-platform.ru
            </p>
          </div>
        </div>
      `;
    } else if (type === 'password_reset') {
      subject = "Восстановление пароля - Eva Platform";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; font-size: 28px; margin: 0;">Eva Platform</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Восстановление доступа к аккаунту</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; font-size: 24px; margin: 0 0 15px 0;">Код для восстановления пароля</h2>
            <p style="color: white; font-size: 16px; margin: 0 0 20px 0;">
              Используйте этот код для восстановления доступа к вашему аккаунту:
            </p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #F59E0B; letter-spacing: 4px;">${code}</span>
            </div>
          </div>
          
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #92400E; margin: 0; font-size: 14px;">
              ⚠️ <strong>Внимание:</strong> Если вы не запрашивали восстановление пароля, 
              немедленно свяжитесь с нашей службой поддержки.
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p style="margin-top: 20px;">
              <strong>Eva Platform</strong><br>
              Поддержка: support@eva-platform.ru
            </p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Eva Platform <noreply@eva-platform.ru>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email отправлен успешно",
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Ошибка отправки email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);