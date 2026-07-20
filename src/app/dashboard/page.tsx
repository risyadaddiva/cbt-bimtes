import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./_components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) redirect("/login");
  if (user.role !== "PARTICIPANT") redirect("/admin/dashboard");

  const participant = await prisma.participant.findUnique({
    where: { id: user.participantId },
    include: {
      examSessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!participant) redirect("/login");

  const examSession = participant.examSessions[0];
  const examStatus = (examSession?.status ?? null) as any;

  return (
    <DashboardClient
      name={participant.name}
      school={participant.school}
      track={participant.track as any}
      examStatus={examStatus}
    />
  );
}
