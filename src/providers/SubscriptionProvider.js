// SubscriptionProvider: Manages subscription state (converted from Flutter SubscriptionService)
import React, { createContext, useContext, useState } from 'react';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const isProFreeForAll = true;
  const [isPro, setIsPro] = useState(isProFreeForAll);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(true);

  return (
    <SubscriptionContext.Provider value={{ isPro, isProFreeForAll, setIsPro, isFirebaseAvailable, setIsFirebaseAvailable }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
