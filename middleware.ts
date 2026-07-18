import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";
export async function middleware(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return NextResponse.next();
 let response=NextResponse.next({request});
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const {data:{user}}=await supabase.auth.getUser(); const path=request.nextUrl.pathname;
 if((path.startsWith("/admin")||path.startsWith("/mi-cuenta"))&&!user){const u=request.nextUrl.clone();u.pathname="/login";u.searchParams.set("next",path);return NextResponse.redirect(u)}
 if(user&&(path.startsWith("/admin")||path.startsWith("/mi-cuenta")||path==="/login")){
   const {data:p}=await supabase.from("profiles").select("rol,activo").eq("id",user.id).maybeSingle();
   if(p?.activo===false){await supabase.auth.signOut();const u=request.nextUrl.clone();u.pathname="/login";u.search="";return NextResponse.redirect(u)}
   const isAdmin=["admin","administrador","super_admin"].includes(p?.rol ?? "");
   if(path.startsWith("/admin")&&!isAdmin){const u=request.nextUrl.clone();u.pathname="/mi-cuenta";u.search="";return NextResponse.redirect(u)}
   if(path.startsWith("/mi-cuenta")&&isAdmin){const u=request.nextUrl.clone();u.pathname="/admin";u.search="";return NextResponse.redirect(u)}
   if(path==="/login"){const u=request.nextUrl.clone();u.pathname=isAdmin?"/admin":"/mi-cuenta";u.search="";return NextResponse.redirect(u)}
 }
 return response;
}
export const config={matcher:["/admin/:path*","/mi-cuenta/:path*","/login"]};