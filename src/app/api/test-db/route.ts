export async function GET() {
  try {
    const res = await fetch("https://db.trqlvpenpjavnvlrxcut.supabase.co:5432");
    return new Response("✅ Connected to Supabase DB host");
  } catch (e: any) {
    return new Response("❌ Failed to connect: " + e.message);
  }
}
