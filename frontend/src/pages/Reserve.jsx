import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAvailableSlots, createReservation } from '../api/reservationApi';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useReservation } from '../context/ReservationContext';
import Tooltip from '../components/Tooltip';

const STEPS = ['Reserve Table', 'Pre-order Menu', 'Review & Confirm'];

const SEATING_OPTIONS = [
  { value: 'any', label: 'Any Seating (No Preference)' },
  { value: 'main', label: 'Indoor Dining Hall' },
  { value: 'outdoor', label: 'Outdoor Patio & Garden' },
  { value: 'window', label: 'Window View Seat' },
  { value: 'private', label: 'Private Room' }
];

const CATEGORIES = ['all', 'breakfast', 'lunch', 'dinner', 'desserts', 'drinks'];
const CATEGORY_ICONS = {
  all: 'ðŸ½ï¸', breakfast: 'ðŸ³', lunch: 'ðŸ¥—',
  dinner: 'ðŸŒ™', desserts: 'ðŸ°', drinks: 'ðŸ¸'
};

const Reserve = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items: menuItems, fetchMenu } = useMenu();
  const {
    reservationDetails,
    preOrder,
    setReservationDetails,
    addToPreOrder,
    updatePreOrderQuantity,
    clearReservation
  } = useReservation();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Local state for slots
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Local state for menu filter in step 1
  const [category, setCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');

  // Local state for simulated deposit payment
  const [depositChecked, setDepositChecked] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Fetch full menu on load
  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Hook for sticky bottom bar navigation event
  useEffect(() => {
    const handleNavConfirm = () => {
      setStep(2);
    };
    window.addEventListener('nav-to-confirm', handleNavConfirm);
    return () => window.removeEventListener('nav-to-confirm', handleNavConfirm);
  }, []);

  // Automatically fetch slots when date, guests, or seatingPreference changes
  useEffect(() => {
    if (!reservationDetails.date || !reservationDetails.guests) return;
    let cancelled = false;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setError('');
      try {
        const { data } = await getAvailableSlots(
          reservationDetails.date,
          reservationDetails.guests,
          reservationDetails.seatingPreference
        );
        if (!cancelled) setSlots(data.data.slots || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Failed to fetch available slots');
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };
    fetchSlots();
    return () => { cancelled = true; };
  }, [reservationDetails.date, reservationDetails.guests, reservationDetails.seatingPreference]);

  useEffect(() => {
    if (window.location.hash === '#reservation-form') {
      requestAnimationFrame(() => {
        const formSection = document.getElementById('reservation-form');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }, []);

  // Filtered menu list for pre-ordering step
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.isAvailable) return false;
      const matchCat = category === 'all' || item.category === category;
      const matchDiet = dietFilter === 'all'
        || (dietFilter === 'veg' && item.isVeg)
        || (dietFilter === 'non-veg' && !item.isVeg);
      return matchCat && matchDiet;
    });
  }, [menuItems, category, dietFilter]);

  // Calculate totals
  const totalItems = preOrder.reduce((acc, item) => acc + item.quantity, 0);
  const totalBill = preOrder.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const maxPrepTime = preOrder.reduce((acc, item) => Math.max(acc, item.menuItem.preparationTime || 0), 0);

  const handleConfirmReservation = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(true);
    setError('');

    // Check email format
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(String(user.email).toLowerCase())) {
      setError('Your account email is invalid. Please update it in your profile before booking.');
      setLoading(false);
      return;
    }

    // Verify deposit payment checkbox
    if (reservationDetails.depositAmount > 0 && !depositChecked) {
      setError('Please pay the refundable deposit to confirm your table.');
      setLoading(false);
      return;
    }

    // Prepare preorder payload: mapping menuItem to ID
    const preOrderPayload = preOrder.map(item => ({
      menuItem: item.menuItem._id || item.menuItem.id,
      quantity: item.quantity
    }));

    try {
      await createReservation({
        date: reservationDetails.date,
        time: reservationDetails.time,
        guests: reservationDetails.guests,
        seatingPreference: reservationDetails.seatingPreference,
        specialRequests: specialRequests,
        preOrder: preOrderPayload,
        confirmationChannel: reservationDetails.confirmationChannel
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Reservation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessFinished = () => {
    clearReservation();
    navigate('/');
  };

  if (success) {
    const formattedDate = new Date(reservationDetails.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <main className="page-enter reserve-page">
        <div className="container reserve-success animate-fade-in">
          <div className="success-icon">ðŸŽ‰</div>
          <h1 className="section-title">Reservation Confirmed!</h1>
          <div className="divider">
            <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
          </div>

          <div className="success-card glass">
            <div className="success-details">
              <div className="success-row"><span>Date & Time</span><strong>{formattedDate} at {reservationDetails.time}</strong></div>
              <div className="success-row"><span>Guests</span><strong>{reservationDetails.guests} guests</strong></div>
              <div className="success-row"><span>Seating Preference</span><strong>{SEATING_OPTIONS.find(o => o.value === reservationDetails.seatingPreference)?.label}</strong></div>
              <div className="success-row"><span>Confirmation Alerts</span><strong>Sent via {reservationDetails.confirmationChannel.toUpperCase()} ({user?.phone || user?.email})</strong></div>
              {totalItems > 0 && (
                <>
                  <div className="success-row"><span>Pre-ordered Dishes</span><strong>{totalItems} items</strong></div>
                  <div className="success-row"><span>Estimated Preparation Time</span><strong>{maxPrepTime} mins (Ready on arrival)</strong></div>
                  <div className="success-row"><span>Estimate Total Bill</span><strong className="gold">â‚¹{totalBill}</strong></div>
                </>
              )}
              {reservationDetails.depositAmount > 0 && (
                <div className="success-row"><span>Refundable Deposit Paid</span><strong className="success-text">â‚¹{reservationDetails.depositAmount} âœ“</strong></div>
              )}
            </div>

            <div className="success-alert">
              ðŸ½ï¸ <strong>Ready When Seated:</strong> Your table is secured and your pre-ordered dishes will be served fresh shortly after you sit down.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
            <Tooltip content="Explore and manage details" position="top">
              <button onClick={handleSuccessFinished} className="btn btn-primary">Done & Go Home</button>
            </Tooltip>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-enter reserve-page">
      <div className="container">
        <div className="section-header" style={{ paddingTop: 'var(--space-3xl)' }}>
          <span className="section-label">Smart Fine Dining</span>
          <h1 className="section-title">Reserve & Pre-order</h1>
          <div className="divider">
            <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
          </div>
        </div>

        {/* Wizard Step Indicators */}
        <div className="wizard-steps">
          {STEPS.map((label, i) => (
            <div key={i} className="step-item">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Tooltip content={`Step ${i + 1}: ${label}`} position="bottom">
                  <div
                    className={`step-circle ${i < step ? 'done' : i === step ? 'active' : ''}`}
                    onClick={() => i < step && setStep(i)}
                    style={{ cursor: i < step ? 'pointer' : 'default' }}
                  >
                    {i < step ? 'âœ“' : i + 1}
                  </div>
                </Tooltip>
                <span className={`step-label ${i < step ? 'done' : i === step ? 'active' : ''}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-connector ${i < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* WIZARD CARD PANEL */}
        <div className="reserve-card glass" id="reservation-form">

          {/* STEP 0: RESERVE TABLE */}
          {step === 0 && (
            <div className="reserve-step">
              <h2 className="reserve-step__title">1. Seating Details & Time Slot</h2>

              <div className="reserve-step__fields">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <Tooltip content="Choose your dining date" position="top">
                    <input
                      className="form-input"
                      type="date"
                      value={reservationDetails.date}
                      min={today}
                      onChange={(e) => setReservationDetails({ date: e.target.value })}
                    />
                  </Tooltip>
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Guests</label>
                  <Tooltip content="Select the size of your party" position="top">
                    <select
                      className="form-select"
                      value={reservationDetails.guests}
                      onChange={(e) => setReservationDetails({ guests: Number(e.target.value) })}
                    >
                      {[1,2,3,4,5,6,7,8,9,10,12,15,20].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
                    </select>
                  </Tooltip>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Seating Preference</label>
                  <Tooltip content="Choose where you would prefer to sit" position="top">
                    <select
                      className="form-select"
                      value={reservationDetails.seatingPreference}
                      onChange={(e) => setReservationDetails({ seatingPreference: e.target.value })}
                    >
                      {SEATING_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </Tooltip>
                </div>
              </div>

              {/* Time Slots Area */}
              {reservationDetails.date && (
                <div className="slots-section" style={{ marginTop: 'var(--space-md)' }}>
                  <h3 className="slots-title">Available Time Slots</h3>
                  {slotsLoading && slots.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
                  ) : slots.length === 0 ? (
                    <p className="no-slots">No slots available for the selected criteria. Try changing the date or seating section.</p>
                  ) : (
                    <div className="slots-grid">
                      {slots.map((slot) => (
                        <Tooltip
                          key={slot.time}
                          content={slot.available ? `${slot.tablesAvailable} table${slot.tablesAvailable > 1 ? 's' : ''} available` : 'Fully booked'}
                          position="top"
                        >
                          <button
                            className={`slot-btn ${!slot.available ? 'slot-btn--unavail' : ''} ${reservationDetails.time === slot.time ? 'slot-btn--selected' : ''}`}
                            onClick={() => slot.available && setReservationDetails({ time: slot.time })}
                            disabled={!slot.available}
                          >
                            <span className="slot-time">{slot.time}</span>
                            <span className="slot-status">{slot.available ? `${slot.tablesAvailable} left` : 'Full'}</span>
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && <p className="form-error" role="alert">{error}</p>}

              <div className="reserve-step__actions" style={{ justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(1)}
                  disabled={!reservationDetails.date || !reservationDetails.time}
                >
                  Continue to Pre-order Menu â†’
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: PRE-ORDER MENU */}
          {step === 1 && (
            <div className="reserve-step">
              <h2 className="reserve-step__title">2. Choose Dishes in Advance</h2>
              <p className="reserve-step__subtitle">
                Select from our active kitchen menu. Pre-ordering ensures food is prepared in advance so you experience no waiting.
              </p>

              {/* Menu Category and Dietary Tabs */}
              <div className="preorder-menu-filters">
                <div className="menu-tabs" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`menu-tab ${category === cat ? 'menu-tab--active' : ''}`}
                      onClick={() => setCategory(cat)}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
                    >
                      {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="diet-toggle">
                  {['all', 'veg', 'non-veg'].map((diet) => (
                    <button
                      key={diet}
                      className={`diet-btn ${dietFilter === diet ? 'diet-btn--active' : ''}`}
                      onClick={() => setDietFilter(diet)}
                    >
                      {diet === 'all' ? 'All' : diet === 'veg' ? 'ðŸŸ¢ Veg' : 'ðŸ”´ Non-Veg'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-order dishes grid */}
              <div className="preorder-dishes-grid">
                {filteredMenuItems.length === 0 ? (
                  <p style={{ textAlign: 'center', gridColumn: 'span 2', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No available items match the selected filters.
                  </p>
                ) : (
                  filteredMenuItems.map((item) => {
                    const itemId = item._id || item.id;
                    const orderItem = preOrder.find(p => (p.menuItem._id || p.menuItem.id) === itemId);
                    const qty = orderItem ? orderItem.quantity : 0;

                    return (
                      <div key={itemId} className="preorder-card glass">
                        <img
                          src={item.image || '/images/dinner.jpg'}
                          alt={item.name}
                          onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
                        />
                        <div className="preorder-card__info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={`tonight-item__dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
                                <h4 className="preorder-card__name">{item.name}</h4>
                              </div>
                              <p className="preorder-card__price">â‚¹{item.price}</p>
                            </div>
                            <span className="preorder-card__time">â± {item.preparationTime} min</span>
                          </div>

                          <div className="preorder-card__actions">
                            {qty > 0 ? (
                              <div className="preorder-controls" style={{ height: '32px' }}>
                                <button className="preorder-btn" style={{ height: '30px', width: '30px' }} onClick={() => updatePreOrderQuantity(itemId, qty - 1)}>âˆ’</button>
                                <span className="preorder-qty" style={{ fontSize: '0.8rem' }}>{qty}</span>
                                <button className="preorder-btn" style={{ height: '30px', width: '30px' }} onClick={() => updatePreOrderQuantity(itemId, qty + 1)}>+</button>
                              </div>
                            ) : (
                              <button className="btn btn-outline btn-sm" style={{ width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => addToPreOrder(item)}>
                                Add to Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Actions */}
              <div className="reserve-step__actions">
                <button className="btn btn-ghost" onClick={() => setStep(0)}>â† Seating Details</button>
                <button className="btn btn-primary" onClick={() => setStep(2)}>
                  {totalItems > 0 ? `Review Pre-order (${totalItems} items) â†’` : 'Review & Confirm Table â†’'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW & CONFIRM */}
          {step === 2 && (
            <div className="reserve-step animate-fade-in">
              <h2 className="reserve-step__title">3. Review & Confirm Booking</h2>

              {!user && (
                <div className="auth-prompt">
                  <p>Please <Link to="/auth" className="gold">sign in</Link> or register to finalize your reservation.</p>
                </div>
              )}

              {/* Summary Layout */}
              <div className="booking-review-summary">
                <div className="booking-summary-column glass">
                  <h3>Table Details</h3>
                  <div className="confirm-row"><span>Date</span><strong>{reservationDetails.date}</strong></div>
                  <div className="confirm-row"><span>Time Slot</span><strong>{reservationDetails.time}</strong></div>
                  <div className="confirm-row"><span>Guests Count</span><strong>{reservationDetails.guests} guests</strong></div>
                  <div className="confirm-row"><span>Seating Prefer.</span><strong>{SEATING_OPTIONS.find(o => o.value === reservationDetails.seatingPreference)?.label}</strong></div>
                  {user && <div className="confirm-row"><span>Guest Name</span><strong>{user.name}</strong></div>}
                </div>

                <div className="booking-summary-column glass">
                  <h3>Advance Pre-orders</h3>
                  {preOrder.length === 0 ? (
                    <p style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem', padding: '1rem 0' }}>No dishes selected. Food can be ordered on arrival.</p>
                  ) : (
                    <div className="preorder-review-list">
                      {preOrder.map((item) => (
                        <div key={item.menuItem._id || item.menuItem.id} className="preorder-review-item">
                          <span>{item.menuItem.name} <strong>x{item.quantity}</strong></span>
                          <span>â‚¹{item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="preorder-review-totals border-top">
                        <div className="confirm-row" style={{ padding: '8px 0', fontSize: '0.85rem' }}><span>Est. Prep Time</span><strong>{maxPrepTime} mins</strong></div>
                        <div className="confirm-row" style={{ padding: '8px 0', fontSize: '1rem' }}><span className="gold">Estimated Total</span><strong className="gold">â‚¹{totalBill}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests Input */}
              <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                <label className="form-label">Special Requests (Occasion details, allergens, etc.)</label>
                <textarea
                  className="form-textarea"
                  placeholder="E.g., Vegetarian kitchen preparation, celebrating an anniversary..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                  maxLength={500}
                />
                <div className="char-counter">{specialRequests.length} / 500</div>
              </div>

              {/* Alert Channel Selection */}
              <div className="form-group">
                <label className="form-label">Receive Confirmation Via</label>
                <div className="confirmation-channels">
                  {[
                    { value: 'email', label: 'ðŸ“§ Email' },
                    { value: 'whatsapp', label: 'ðŸ’¬ WhatsApp' },
                    { value: 'sms', label: 'ðŸ“± SMS' }
                  ].map((ch) => (
                    <button
                      key={ch.value}
                      className={`channel-btn ${reservationDetails.confirmationChannel === ch.value ? 'channel-btn--active' : ''}`}
                      onClick={() => setReservationDetails({ confirmationChannel: ch.value })}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refundable Deposit Payment Simulation */}
              <div className="deposit-section glass">
                <div className="deposit-header">
                  <span className="deposit-badge">Refundable Deposit</span>
                  <h4>â‚¹{reservationDetails.depositAmount}</h4>
                </div>
                <p className="deposit-desc">
                  To prevent no-shows and support kitchen ingredient planning, a small deposit is required. It is fully refunded or adjusted in your final bill upon arrival.
                </p>
                <label className="deposit-checkbox-container">
                  <input
                    type="checkbox"
                    checked={depositChecked}
                    onChange={(e) => setDepositChecked(e.target.checked)}
                  />
                  <span className="checkmark" />
                  <span className="checkbox-label">Authorize payment of â‚¹{reservationDetails.depositAmount} refundable deposit</span>
                </label>
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}

              {/* Submit Buttons */}
              <div className="reserve-step__actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>â† Modify Pre-orders</button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmReservation}
                  disabled={!user || loading || (reservationDetails.depositAmount > 0 && !depositChecked)}
                >
                  {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Confirm Booking âœ“'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default Reserve;
