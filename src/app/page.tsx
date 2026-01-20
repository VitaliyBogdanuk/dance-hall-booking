import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function HomePage() {
  const session = await auth();
  
  // Redirect authenticated users to their dashboard
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  } else if (session?.user?.role === "TRAINER") {
    redirect("/trainer");
  } else if (session?.user?.role === "PARENT") {
    redirect("/parent");
  } else if (session?.user) {
    redirect("/schedule");
  }
  
  // Redirect unauthenticated users to login
  redirect("/login");
}
