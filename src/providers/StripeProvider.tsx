import React from 'react';
import { Platform } from 'react-native';

let NativeStripeProvider: any;
let useStripeNative: any;

if (Platform.OS !== 'web') {
  const stripe = require('@stripe/stripe-react-native');
  NativeStripeProvider = stripe.StripeProvider;
  useStripeNative = stripe.useStripe;
}

// Web + Native compatible StripeProvider
export const StripeProvider = ({
  children,
  publishableKey,
  merchantIdentifier
}: {
  children: React.ReactNode;
  publishableKey: string;
  merchantIdentifier?: string;
}) => {
  if (Platform.OS === 'web') {
    // On web we return children directly (we'll wrap Elements where payments happen)
    return <>{children}</>;
  }

  // On native use the real StripeProvider
  return (
    <NativeStripeProvider publishableKey={publishableKey} merchantIdentifier={merchantIdentifier}>
      {children}
    </NativeStripeProvider>
  );
};

export const useStripe = () => {
  if (Platform.OS === 'web') {
    console.warn('Native Stripe functions not available on web – use @stripe/react-stripe-js instead');
    return {};
  }
  return useStripeNative ? useStripeNative() : {};
};
