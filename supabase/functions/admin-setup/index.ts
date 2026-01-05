import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function creates the initial admin user
// It should only be called once during initial setup
// Security: Uses a setup key that must match ADMIN_SETUP_KEY environment variable

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, password, fullName, setupKey } = body;

    // Verify setup key (you should set this as a secret)
    const validSetupKey = Deno.env.get('ADMIN_SETUP_KEY') || 'shiksha-setu-admin-2026';
    
    if (setupKey !== validSetupKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid setup key' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if any admin exists
    const { data: existingAdmins, error: checkError } = await adminClient
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (checkError) {
      console.error('Error checking for existing admins:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing admins' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Admin already exists. This function can only create the first admin.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the admin user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || 'Administrator',
        role: 'admin',
        language: 'english',
      },
    });

    if (createError) {
      console.error('Error creating admin user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The trigger should create the role, but let's verify
    const { data: roleCheck, error: roleCheckError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', newUser.user.id)
      .maybeSingle();

    if (!roleCheck || roleCheck.role !== 'admin') {
      // Manually insert the admin role if trigger didn't work
      const { error: insertRoleError } = await adminClient
        .from('user_roles')
        .upsert({
          user_id: newUser.user.id,
          role: 'admin',
        }, { onConflict: 'user_id' });

      if (insertRoleError) {
        console.error('Error inserting admin role:', insertRoleError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        email: newUser.user.email,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});