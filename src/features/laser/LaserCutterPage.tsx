import { useState } from 'react';
import LaserLibrary from '../../components/LaserLibrary';
import { type LaserCutterPageProps } from './shared';
import { type LaserTab, TimePanel } from './TimePanel';
import { SettingsPanel } from './SettingsPanel';
import { PayCuts } from './PayCuts';
import { type LaserSession } from '../../lib/laserApi';

export default function LaserCutterPage({ onShop, live }: LaserCutterPageProps) {
  // Goes up after every library save, so the settings panel loads the new materials and thicknesses.
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [tab, setTab] = useState<LaserTab>('cuts');
  // A copy of the cuts in the payment sheet: paid cuts drop out of live.sessions, the sheet still shows them.
  const [paying, setPaying] = useState<LaserSession[] | null>(null);
  return (
    <div className="flex-1 overflow-auto bg-brand-beige">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-lijn min-h-full">
        <TimePanel onPay={ids => setPaying(live.sessions.filter(s => ids.includes(s.id)))} paying={!!paying} onShop={onShop} live={live} tab={tab} setTab={setTab} />
        {/* Narrow: behind the Settings tab. Wide: always there, next to and under the cuts. */}
        <div className={tab === 'settings' ? 'contents' : 'hidden lg:contents'}>
          <SettingsPanel libraryVersion={libraryVersion} />
          <LaserLibrary onSaved={() => setLibraryVersion(v => v + 1)} />
        </div>
      </div>
      {paying && <PayCuts cuts={paying} onClose={() => setPaying(null)} />}
    </div>
  );
}
