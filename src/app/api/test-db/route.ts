import { supabase } from "@/config/supabase";
import { PrismaClient } from "@/generated/prisma";

export async function GET() {
  const results = {
    supabase: { status: "", error: "", details: {} as Record<string, unknown> },
    prisma: { status: "", error: "", count: 0 },
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
      databaseUrl: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"
    }
  };

  // Test Supabase connection with more detailed diagnostics
  try {
    // First try a simple auth check
    const { error: authError } = await supabase.auth.getSession();
    results.supabase.details.authCheck = authError ? `Error: ${authError.message}` : "✅ Auth accessible";

    // Try different table name variations
    let tableError = null;
    let tableAccess = false;
    
    // Try 'User' (capital U)
    const { error: userError } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (!userError) {
      tableAccess = true;
      results.supabase.details.tableAccess = "✅ Can access 'User' table";
    } else {
      tableError = userError;
      // Try 'user' (lowercase)
      const { error: userLowerError } = await supabase
        .from('user')
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      if (!userLowerError) {
        tableAccess = true;
        results.supabase.details.tableAccess = "✅ Can access 'user' table (lowercase)";
      } else {
        results.supabase.details.tableAccess = "❌ Cannot access User table";
        results.supabase.details.userTableError = userError.message;
        results.supabase.details.userLowerTableError = userLowerError.message;
      }
    }
    
    if (tableAccess) {
      results.supabase.status = "✅ Connected";
    } else {
      results.supabase.status = "❌ Failed";
      results.supabase.error = tableError?.message || "Table access denied";
    }
  } catch (e: unknown) {
    results.supabase.status = "❌ Failed";
    results.supabase.error = e instanceof Error ? e.message : 'Unknown error';
  }

  // Test Prisma connection
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    const userCount = await prisma.user.count();
    results.prisma.status = "✅ Connected";
    results.prisma.count = userCount;
    await prisma.$disconnect();
  } catch (e: unknown) {
    results.prisma.status = "❌ Failed";
    results.prisma.error = e instanceof Error ? e.message : 'Unknown error';
  }

  return new Response(JSON.stringify({
    message: "Database Connection Test Results",
    environment: results.environment,
    supabase: results.supabase,
    prisma: results.prisma,
    timestamp: new Date().toISOString()
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
