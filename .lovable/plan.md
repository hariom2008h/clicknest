

## Problem Analysis

Two admin form errors:

1. **Products — "new row violates row-level security policy"**: The `AdminProducts.tsx` inserts directly via the Supabase client with a dummy `seller_id` UUID. RLS requires `auth.uid() = seller_id`, but since Clerk is used (not Supabase Auth), `auth.uid()` is always null. The insert is rejected.

2. **Categories — "Failed to send a request to the Edge Function"**: The `admin-categories` edge function exists and boots fine, but the CORS `Access-Control-Allow-Headers` is missing some headers that the Supabase JS client sends automatically (like `apikey`, `x-client-info`). This causes the preflight to fail in the browser.

## Plan

### 1. Create `admin-products` Edge Function
Create a new edge function `supabase/functions/admin-products/index.ts` that mirrors the `admin-categories` pattern:
- Verify admin via Clerk API using `x-custom-auth` header
- Use service role to bypass RLS
- Support `list`, `create`, `update`, `delete` actions for the `products` table
- Include proper CORS headers (with all Supabase client headers)

### 2. Fix CORS Headers on Both Edge Functions
Update `Access-Control-Allow-Headers` in both `admin-categories` and `admin-products` to include all headers the Supabase JS client sends:
```
authorization, x-custom-auth, content-type, apikey, x-client-info
```

### 3. Update `AdminProducts.tsx`
Refactor the component to call the `admin-products` edge function (via `supabase.functions.invoke`) instead of direct Supabase client queries. Pass the Clerk user ID via `x-custom-auth` header, similar to `AdminCategories.tsx`.

### Files Changed
- **Create**: `supabase/functions/admin-products/index.ts`
- **Edit**: `supabase/functions/admin-categories/index.ts` (CORS fix)
- **Edit**: `src/pages/admin/AdminProducts.tsx` (use edge function)

