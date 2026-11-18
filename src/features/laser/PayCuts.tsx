import { useState } from 'react';
import { Check, X, Loader2, Scissors, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useVolunteer } from '../../VolunteerContext';
import { cutPreviewUrl, shortDuration, type LaserSession } from '../../lib/laserApi';
import ModalFrame from '../../components/ModalFrame';
import WeroQrCode from '../../QrCode';
import { useToast } from '../../ToastContext';
import { checkoutApi, useBill, extraLabel, billDescription, type CheckoutCart, type Bill } from '../../lib/checkoutApi';
import { useLock } from '../../lib/useLock';
import { invalidateInventree } from '../../features/inventory/queryClient';

/** Pay laser cuts right on the laser page: the bill, 2 s to read it, then the QR code.
 *  Same sale as the till (core/checkout.py), only with cuts and no items. */
export function PayCuts({ cuts, onClose }: { cuts: LaserSession[]; onClose: () => void }) {
  const ids = cuts.map(c => c.id);
  const { addToast } = useToast();
  const { isVolunteerMode } = useVolunteer();
  // VOLUNTEER / WORKSHOP: free, as in the checkout. Signed-in volunteers skip the question.
  const [free, setFree] = useState(false);
  const [askFree, setAskFree] = useState(false);
  const askLeft = useLock(askFree);
  const cart: CheckoutCart = { items: [], prints: [], machines: [], cuts: ids, volunteer: free };
  const { bill, error } = useBill(cart);
  const lockLeft = useLock(!!bill);
  const [selling, setSelling] = useState(false);
  const [paid, setPaid] = useState<Bill | null>(null);
  // One key per sale: a retry after a network error books nothing twice.
  const [key] = useState(() => crypto.randomUUID());

  const pay = async () => {
    setSelling(true);
    try {
      const sale = await checkoutApi.checkout(cart, key, 'laser-page');
      invalidateInventree();
      if (sale.warning) addToast(sale.warning, 'warning');
      setPaid(sale.bill);
    } catch (e) {
      addToast(e instanceof Error ? `Payment failed: ${e.message}` : 'Payment failed', 'error');
    } finally {
      setSelling(false);
    }
  };

  const shown = paid ?? bill;
  return (
    // No close on a background tap once paid: the QR code would be gone.
    <ModalFrame onClose={paid ? undefined : onClose} maxWidth="max-w-lg" className="bg-brand-beige flex flex-col">
      <div className="bg-brand-beige-dark p-4 flex items-center justify-between border-b border-lijn">
        <h3 className="font-semibold text-lg">{paid ? (paid.volunteer ? 'Booked' : 'Scan to pay') : 'Pay your laser time'}</h3>
        {!paid && <button onClick={onClose} aria-label="Cancel"><X size={22} /></button>}
      </div>
      <div className="p-4 sm:p-6 bg-white space-y-3">
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Cuts you pay for">
          {cuts.map(c => (
            <li key={c.id} className="w-24 shrink-0">
              <div className="h-20 border border-lijn bg-brand-beige-dark flex items-center justify-center">
                {c.has_preview
                  ? <img src={cutPreviewUrl(c.id)} alt="" className="w-full h-full object-contain p-1" />
                  : <Scissors size={20} className="text-grafiet" aria-hidden />}
              </div>
              <p className="text-xs font-semibold truncate mt-1">{c.name}</p>
              <p className="text-xs text-grafiet tabular-nums">{shortDuration(c.total_time)}</p>
            </li>
          ))}
        </ul>
        {!shown && (error
          ? <p className="text-sm text-red-700">Cannot price these cuts: {error}</p>
          : <p className="text-sm text-grafiet flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Pricing…</p>)}
        {askFree && (
          <div className="border-2 border-emerald-600 p-3 space-y-2">
            <p className="text-xs font-bold tracking-wide text-emerald-600">FOR VOLUNTEERS ONLY</p>
            <p className="text-sm">Are you an HTL volunteer, or is this for a workshop? Then this laser time is free, booked as volunteer / workshop use. Visitors pay as usual.</p>
            <div className="flex gap-2">
              <button onClick={() => setAskFree(false)} className="brutalist-button h-10 px-4 bg-white text-sm font-semibold">Back</button>
              <button onClick={() => { setAskFree(false); setFree(true); }} disabled={askLeft > 0}
                className="flex-1 brutalist-button h-10 bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">
                Yes, I am{askLeft > 0 && <span className="tabular-nums"> ({askLeft})</span>}
              </button>
            </div>
          </div>
        )}
        {shown && (<>
          {shown.extras.map((e, i) => (
            <div key={i} className="flex justify-between gap-3 p-3 border border-lijn bg-brand-beige-dark">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{extraLabel(e)}</p>
                <p className="text-[11px] text-grafiet">{e.quantity} {e.unit} × €{e.unit_price.toFixed(2)}</p>
              </div>
              <span className="font-semibold text-sm">€{(e.quantity * e.unit_price).toFixed(2)}</span>
            </div>
          ))}
          {shown.top_up > 0 && (
            <div className="flex justify-between p-3 border border-lijn bg-brand-beige-dark text-sm">
              <span className="font-semibold">Minimum per payment</span><span className="font-semibold">€{shown.top_up.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t-[3px] border-lijn pt-3">
            <span className="text-sm font-semibold text-grafiet">Total</span>
            <span className={cn('text-4xl font-semibold tabular-nums', shown.volunteer && 'text-emerald-600')}>{shown.volunteer ? 'Free' : `€${shown.total.toFixed(2)}`}</span>
          </div>
        </>)}
        {paid?.volunteer && <p className="text-sm text-grafiet">Booked as volunteer / workshop use. Nothing to pay.</p>}
        {paid && !paid.volunteer && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <WeroQrCode total={paid.total} description={billDescription(paid)} />
            <p className="text-xs text-grafiet text-center">Scan with your banking app. Your cuts are booked as paid.</p>
          </div>
        )}
      </div>
      <div className="border-t border-lijn p-4 flex gap-3 bg-brand-beige">
        {paid
          ? <button onClick={onClose} className="flex-1 brutalist-button h-12 bg-brand-black text-white font-semibold">{paid.volunteer ? 'Done' : 'I have paid'}</button>
          : (<>
            <button onClick={onClose} className="brutalist-button h-12 px-5 bg-white font-semibold">Cancel</button>
            <button onClick={() => free ? setFree(false) : isVolunteerMode ? setFree(true) : setAskFree(true)} disabled={selling} aria-pressed={free}
              className={cn('w-28 shrink-0 px-2 text-xs font-bold flex items-center justify-center gap-1 border-2 border-emerald-600',
                free ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50')}>
              {free && <CheckCircle size={14} aria-hidden />} VOLUNTEER / WORKSHOP
            </button>
            <button onClick={pay} disabled={!bill || selling || lockLeft > 0}
              className="flex-1 brutalist-button h-12 bg-emerald-400 text-brand-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {selling ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              {free ? 'Book free' : <>Pay{bill && ` €${bill.total.toFixed(2)}`}</>}{lockLeft > 0 && <span className="tabular-nums"> ({lockLeft})</span>}
            </button>
          </>)}
      </div>
    </ModalFrame>
  );
}
