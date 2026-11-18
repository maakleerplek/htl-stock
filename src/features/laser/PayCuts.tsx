import { useRef, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import ModalFrame from '../../components/ModalFrame';
import WeroQrCode from '../../QrCode';
import { useToast } from '../../ToastContext';
import { checkoutApi, useBill, extraLabel, billDescription, type CheckoutCart, type Bill } from '../../lib/checkoutApi';
import { useLock } from '../../lib/useLock';
import { invalidateInventree } from '../../features/inventory/queryClient';

/** Pay laser cuts right on the laser page: the bill, 2 s to read it, then the QR code.
 *  Same sale as the till (core/checkout.py), only with cuts and no items. */
export function PayCuts({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const { addToast } = useToast();
  const cart: CheckoutCart = { items: [], prints: [], machines: [], cuts: ids };
  const { bill, error } = useBill(cart);
  const lockLeft = useLock(!!bill);
  const [selling, setSelling] = useState(false);
  const [paid, setPaid] = useState<Bill | null>(null);
  // One key per sale: a retry after a network error books nothing twice.
  const key = useRef(crypto.randomUUID());

  const pay = async () => {
    setSelling(true);
    try {
      const sale = await checkoutApi.checkout(cart, key.current, 'laser-page');
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
        <h3 className="font-semibold text-lg">{paid ? 'Scan to pay' : 'Pay your laser time'}</h3>
        {!paid && <button onClick={onClose} aria-label="Cancel"><X size={22} /></button>}
      </div>
      <div className="p-4 sm:p-6 bg-white space-y-3">
        {!shown && (error
          ? <p className="text-sm text-red-700">Cannot price these cuts: {error}</p>
          : <p className="text-sm text-grafiet flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Pricing…</p>)}
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
            <span className="text-4xl font-semibold tabular-nums">€{shown.total.toFixed(2)}</span>
          </div>
        </>)}
        {paid && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <WeroQrCode total={paid.total} description={billDescription(paid)} />
            <p className="text-xs text-grafiet text-center">Scan with your banking app. Your cuts are booked as paid.</p>
          </div>
        )}
      </div>
      <div className="border-t border-lijn p-4 flex gap-3 bg-brand-beige">
        {paid
          ? <button onClick={onClose} className="flex-1 brutalist-button h-12 bg-brand-black text-white font-semibold">I have paid</button>
          : (<>
            <button onClick={onClose} className="brutalist-button h-12 px-5 bg-white font-semibold">Cancel</button>
            <button onClick={pay} disabled={!bill || selling || lockLeft > 0}
              className="flex-1 brutalist-button h-12 bg-emerald-400 text-brand-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {selling ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Pay{bill && ` €${bill.total.toFixed(2)}`}{lockLeft > 0 && <span className="tabular-nums"> ({lockLeft})</span>}
            </button>
          </>)}
      </div>
    </ModalFrame>
  );
}
