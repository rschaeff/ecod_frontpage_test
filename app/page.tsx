// app/page.tsx
import ContextBridge from '@/components/ContextBridge';
import ECODHomePage from '@/components/ECODHomePage';

export default function Home() {
  return (
    <ContextBridge>
      <ECODHomePage />
    </ContextBridge>
  );
}
