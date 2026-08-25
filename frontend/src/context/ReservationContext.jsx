import { createContext, useContext, useState, useEffect } from 'react';

const ReservationContext = createContext(null);

const DEFAULT_DETAILS = {
  date: '',
  time: '',
  guests: 2,
  seatingPreference: 'any',
  confirmationChannel: 'email'
};

export const ReservationProvider = ({ children }) => {
  const [reservationDetails, setReservationDetailsState] = useState(() => {
    try {
      const stored = localStorage.getItem('lh_res_details');
      return stored ? JSON.parse(stored) : DEFAULT_DETAILS;
    } catch {
      return DEFAULT_DETAILS;
    }
  });

  const [preOrder, setPreOrder] = useState(() => {
    try {
      const stored = localStorage.getItem('lh_res_preorder');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('lh_res_details', JSON.stringify(reservationDetails));
  }, [reservationDetails]);

  useEffect(() => {
    localStorage.setItem('lh_res_preorder', JSON.stringify(preOrder));
  }, [preOrder]);

  const setReservationDetails = (details) => {
    setReservationDetailsState((prev) => ({
      ...prev,
      ...details
    }));
  };

  const addToPreOrder = (menuItem) => {
    setPreOrder((prev) => {
      const itemId = menuItem._id || menuItem.id;
      const existing = prev.find((item) => (item.menuItem._id || item.menuItem.id) === itemId);
      if (existing) {
        return prev.map((item) =>
          (item.menuItem._id || item.menuItem.id) === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromPreOrder = (itemId) => {
    setPreOrder((prev) => prev.filter((item) => (item.menuItem._id || item.menuItem.id) !== itemId));
  };

  const updatePreOrderQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromPreOrder(itemId);
      return;
    }
    setPreOrder((prev) =>
      prev.map((item) =>
        (item.menuItem._id || item.menuItem.id) === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearReservation = () => {
    setReservationDetailsState(DEFAULT_DETAILS);
    setPreOrder([]);
    localStorage.removeItem('lh_res_details');
    localStorage.removeItem('lh_res_preorder');
  };

  const hasActiveBookingDetails = () => {
    return !!(reservationDetails.date && reservationDetails.time);
  };

  return (
    <ReservationContext.Provider
      value={{
        reservationDetails,
        preOrder,
        setReservationDetails,
        addToPreOrder,
        removeFromPreOrder,
        updatePreOrderQuantity,
        clearReservation,
        hasActiveBookingDetails
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservation must be used within ReservationProvider');
  return ctx;
};
