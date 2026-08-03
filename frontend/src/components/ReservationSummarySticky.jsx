import { useReservation } from '../context/ReservationContext';
import { Link, useLocation } from 'react-router-dom';
import Tooltip from './Tooltip';

const ReservationSummarySticky = () => {
  const { reservationDetails, preOrder, hasActiveBookingDetails } = useReservation();
  const location = useLocation();

  // If there are no booking details active, do not display
  if (!hasActiveBookingDetails()) return null;

  // Don't render on the Auth page or when we are showing the reservation success screen
  if (location.pathname === '/auth') return null;

  const totalItems = preOrder.reduce((acc, item) => acc + item.quantity, 0);
  const totalBill = preOrder.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const maxPrepTime = preOrder.reduce((acc, item) => Math.max(acc, item.menuItem.preparationTime || 0), 0);

  const formattedDate = new Date(reservationDetails.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const sectionName = reservationDetails.seatingPreference.charAt(0).toUpperCase() + reservationDetails.seatingPreference.slice(1);

  return (
    <div className="reservation-summary-sticky glass animate-slide-up">
      <div className="container sticky-inner">
        <div className="sticky-section sticky-info">
          <div className="sticky-info__badge">📅 Reservation</div>
          <div>
            <p className="sticky-info__text">
              <strong>{formattedDate}</strong> at <strong>{reservationDetails.time}</strong>
            </p>
            <p className="sticky-info__subtext">
              {reservationDetails.guests} {reservationDetails.guests === 1 ? 'Guest' : 'Guests'} · {sectionName} Seating
            </p>
          </div>
        </div>

        <div className="divider-vertical" />

        <div className="sticky-section sticky-order">
          <div className="sticky-order__stats">
            <span className="sticky-order__badge">🛒 Pre-order</span>
            <p className="sticky-order__text">
              <strong>{totalItems} {totalItems === 1 ? 'item' : 'items'}</strong> · <strong className="gold">₹{totalBill}</strong>
            </p>
            {totalItems > 0 && (
              <p className="sticky-order__subtext">
                Est. Prep: <strong>{maxPrepTime} min</strong>
              </p>
            )}
          </div>
          <div className="sticky-ready-badge">
            <span className="pulse-dot" />
            <span className="ready-text">Ready when seated</span>
          </div>
        </div>

        <div className="sticky-actions">
          {location.pathname === '/reserve' ? (
            <Tooltip content="Go to the review and confirmation step" position="top">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // Dispatch a custom event to navigate steps inside Reserve.jsx if needed
                  window.dispatchEvent(new CustomEvent('nav-to-confirm'));
                }}
              >
                Confirm Reservation & Pre-order →
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="Continue reservation checkout" position="top">
              <Link to="/reserve" className="btn btn-primary">
                Review & Confirm Booking →
              </Link>
            </Tooltip>
          )}
        </div>
      </div>

      <style>{`
        .reservation-summary-sticky {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(26, 23, 20, 0.85);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border-top: 1px solid var(--color-border);
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
          padding: var(--space-md) 0;
          transition: all var(--transition);
        }

        .sticky-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .sticky-section {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .divider-vertical {
          width: 1px;
          height: 40px;
          background: var(--color-border);
        }

        .sticky-info__badge, .sticky-order__badge {
          background: rgba(201, 169, 98, 0.12);
          border: 1px solid rgba(201, 169, 98, 0.25);
          color: var(--color-primary);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .sticky-info__text, .sticky-order__text {
          font-size: 0.95rem;
          color: var(--color-text);
          margin: 0;
          line-height: 1.2;
        }

        .sticky-info__subtext, .sticky-order__subtext {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin: 4px 0 0 0;
          line-height: 1.2;
        }

        .sticky-ready-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(76, 175, 125, 0.12);
          border: 1px solid rgba(76, 175, 125, 0.25);
          padding: 6px 12px;
          border-radius: var(--radius-full);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-success);
          box-shadow: 0 0 0 0 rgba(76, 175, 125, 0.7);
          animation: pulse 1.6s infinite;
        }

        .ready-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-success);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(76, 175, 125, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(76, 175, 125, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(76, 175, 125, 0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .reservation-summary-sticky {
            padding: var(--space-sm) var(--space-md) calc(var(--space-sm) + 10px);
          }
          .sticky-inner {
            flex-direction: column;
            align-items: stretch;
            gap: var(--space-sm);
          }
          .divider-vertical {
            display: none;
          }
          .sticky-section {
            justify-content: space-between;
          }
          .sticky-actions .btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ReservationSummarySticky;
