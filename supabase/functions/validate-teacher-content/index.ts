import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  subject?: string;
  class_level: string;
  language: string;
}

/**
 * validate-teacher-content Edge Function
 * 
 * Validates that a teacher is authorized to create content for a specific
 * subject, class, and language based on their Admin-assigned allocation.
 * 
 * This provides backend enforcement to prevent API tampering.
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to check teacher allocation
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is a teacher
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'teacher')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Not a teacher' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch teacher's allocation
    const { data: allocation, error: allocError } = await adminClient
      .from('teacher_assignments')
      .select('subjects, classes, languages, is_active')
      .eq('teacher_id', user.id)
      .maybeSingle();

    if (allocError) {
      console.error('Error fetching allocation:', allocError);
      return new Response(
        JSON.stringify({ valid: false, error: 'Failed to fetch allocation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allocation) {
      return new Response(
        JSON.stringify({ valid: false, error: 'No allocation found. Contact admin.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allocation.is_active) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Teacher account is disabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: ValidationRequest = await req.json();
    const { subject, class_level, language } = body;

    const errors: string[] = [];

    // Validate subject if provided
    if (subject) {
      const allowedSubjects = (allocation.subjects || []).map((s: string) => s.toLowerCase());
      if (!allowedSubjects.includes(subject.toLowerCase())) {
        errors.push(`You are not authorized to add content for subject: ${subject}`);
      }
    }

    // Validate class
    const allowedClasses = allocation.classes || [];
    if (!allowedClasses.includes(class_level)) {
      errors.push(`You are not authorized to add content for class: ${class_level}`);
    }

    // Validate language
    const allowedLanguages = allocation.languages || ['hindi', 'english'];
    if (!allowedLanguages.includes(language)) {
      errors.push(`You are not authorized to add content in language: ${language}`);
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ valid: false, errors }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
