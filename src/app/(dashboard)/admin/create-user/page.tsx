// src/app/(dashboard)/admin/create-user/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateUserForm from "@/components/admin/CreateUserForm";

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/signin");
  }

  return <CreateUserForm />;
}
