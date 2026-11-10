import NagorikSathiApp from '@/components/nagorik/NagorikSathiApp';

export default async function TrackCaseIdPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <NagorikSathiApp
      initialTab="track"
      initialRole="citizen"
      initialCaseNumber={decodeURIComponent(caseId)}
    />
  );
}
