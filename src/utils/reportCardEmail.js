import { appendSendLog, upsertReportCard } from "./reportCardsStorage";

/**
 * Simulated parent email send — swap body for Resend/SendGrid later.
 */
export async function sendReportCardEmail({ reportCard, student, parentEmail, schoolName }) {
  const email = String(parentEmail || "").trim();
  if (!email) {
    return { ok: false, error: "No parent/guardian email on file for this student." };
  }

  const message = {
    to: email,
    subject: `${schoolName || "School"} Report Card — ${student?.first || ""} ${student?.last || ""}`.trim(),
    body: `Dear Parent/Guardian,\n\nPlease find the report card for ${student?.first || "your child"} ${student?.last || ""} (${reportCard.term_or_terms}, ${reportCard.schoolYear}).\n\nThis is a simulated send from the MoneyTykes Teacher Dashboard.\n\nThank you.`
  };

  // Simulated delivery latency
  await new Promise(resolve => setTimeout(resolve, 280));

  const sentAt = new Date().toISOString();
  const updated = {
    ...reportCard,
    status: "sent",
    sentAt,
    generatedAt: reportCard.generatedAt || sentAt
  };
  upsertReportCard(updated);

  appendSendLog({
    id: `send-${Date.now()}-${reportCard.id}`,
    reportCardId: reportCard.id,
    parentEmail: email,
    sentAt,
    status: "simulated-sent",
    preview: message
  });

  return { ok: true, reportCard: updated, message };
}

export async function sendReportCardsBulk(targets) {
  const results = [];
  for (const target of targets) {
    // Sequential to keep toast/log readable; still fast (simulated)
    // eslint-disable-next-line no-await-in-loop
    results.push(await sendReportCardEmail(target));
  }
  return results;
}
