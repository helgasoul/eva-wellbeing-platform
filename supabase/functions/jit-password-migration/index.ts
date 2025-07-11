import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JITMigrationRequest {
  email: string;
  password: string;
  legacyUserData: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    phone?: string;
    onboarding_completed?: boolean;
    profile_data?: Record<string, any>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 JIT Migration: Starting password migration process');
    
    const { email, password, legacyUserData }: JITMigrationRequest = await req.json();

    if (!email || !password || !legacyUserData) {
      throw new Error('Отсутствуют обязательные поля: email, password, legacyUserData');
    }

    // Создаем Supabase клиент с service role для административных операций
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🔍 JIT Migration: Processing migration for user ${email}`);

    // 1. Проверяем, существует ли уже пользователь в Supabase
    const { data: existingUser, error: userCheckError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userCheckError && userCheckError.message !== 'User not found') {
      throw new Error(`Ошибка проверки существующего пользователя: ${userCheckError.message}`);
    }

    if (existingUser?.user) {
      console.log(`⚠️ JIT Migration: User ${email} already exists in Supabase`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Пользователь уже существует в новой системе',
          code: 'USER_EXISTS'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Создаем пользователя в Supabase Auth
    console.log(`👤 JIT Migration: Creating new user in Supabase Auth`);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Автоматически подтверждаем email
      user_metadata: {
        first_name: legacyUserData.first_name || '',
        last_name: legacyUserData.last_name || '',
        role: legacyUserData.role || 'patient',
        phone: legacyUserData.phone,
        legacy_id: legacyUserData.id,
        migrated_at: new Date().toISOString(),
        migration_source: 'jit_migration'
      }
    });

    if (createError) {
      console.error(`❌ JIT Migration: Failed to create user: ${createError.message}`);
      throw new Error(`Ошибка создания пользователя: ${createError.message}`);
    }

    if (!newUser?.user) {
      throw new Error('Пользователь не был создан');
    }

    console.log(`✅ JIT Migration: User created successfully with ID: ${newUser.user.id}`);

    // 3. Создаем/обновляем профиль пользователя
    console.log(`📝 JIT Migration: Creating user profile`);
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: newUser.user.id,
        email: email,
        first_name: legacyUserData.first_name || '',
        last_name: legacyUserData.last_name || '',
        role: legacyUserData.role || 'patient',
        phone: legacyUserData.phone,
        onboarding_completed: legacyUserData.onboarding_completed || false,
        registration_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`❌ JIT Migration: Profile creation failed: ${profileError.message}`);
      // Не прерываем процесс, так как пользователь уже создан
    } else {
      console.log(`✅ JIT Migration: Profile created successfully`);
    }

    // 4. Мигрируем данные онбординга, если они есть
    if (legacyUserData.profile_data && legacyUserData.onboarding_completed) {
      console.log(`🎯 JIT Migration: Migrating onboarding data`);
      
      const { error: onboardingError } = await supabase
        .from('onboarding_data')
        .insert({
          user_id: newUser.user.id,
          step_name: 'legacy_migration',
          step_number: 1,
          step_data: legacyUserData.profile_data,
          completed_at: new Date().toISOString()
        });

      if (onboardingError) {
        console.error(`⚠️ JIT Migration: Onboarding data migration failed: ${onboardingError.message}`);
        // Не критично, продолжаем
      } else {
        console.log(`✅ JIT Migration: Onboarding data migrated successfully`);
      }
    }

    // 5. Логируем успешную миграцию
    console.log(`🎉 JIT Migration: Migration completed successfully for ${email}`);
    
    const { error: auditError } = await supabase
      .from('security_audit_log')
      .insert({
        user_id: newUser.user.id,
        audit_type: 'user_migration',
        action: 'jit_password_migration',
        details: {
          email: email,
          legacy_id: legacyUserData.id,
          migration_timestamp: new Date().toISOString(),
          source: 'jit_migration'
        },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    if (auditError) {
      console.error(`⚠️ JIT Migration: Audit log failed: ${auditError.message}`);
    }

    // 6. Возвращаем успешный результат
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          migrated: true
        },
        message: 'Пользователь успешно мигрирован'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ JIT Migration: Migration failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Неизвестная ошибка миграции',
        code: 'MIGRATION_FAILED'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});