import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Subscription } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionContextType {
  subscriptions: Subscription[];
  isLoading: boolean;
  saveSubscription: (subscriptionData: Omit<Subscription, "id"> & { id?: string }) => Promise<void>;
  deleteSubscription: (subscriptionId: string) => Promise<void>;
  clearAllSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Helper function to map DB snake_case to App camelCase
const mapDbSubToAppSub = (dbSub: any): Subscription => ({
  id: dbSub.id,
  name: dbSub.name,
  plan: dbSub.plan,
  amount: dbSub.amount,
  category: dbSub.category,
  billingCycle: dbSub.billing_cycle,
  paymentMethod: dbSub.payment_method,
  status: dbSub.status,
  nextBillingDate: dbSub.next_billing_date,
  startDate: dbSub.start_date,
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching subscriptions:", error);
        setSubscriptions([]);
      } else {
        setSubscriptions((data as any[]).map(mapDbSubToAppSub));
      }
      setIsLoading(false);
    };

    fetchSubscriptions();
  }, []);

  const saveSubscription = async (subscriptionData: Omit<Subscription, "id"> & { id?: string }) => {
    const subscriptionToSave = {
      name: subscriptionData.name,
      plan: subscriptionData.plan,
      amount: subscriptionData.amount,
      category: subscriptionData.category,
      billing_cycle: subscriptionData.billingCycle,
      payment_method: subscriptionData.paymentMethod,
      status: subscriptionData.status,
      next_billing_date: subscriptionData.nextBillingDate,
      start_date: subscriptionData.startDate,
    };

    if (subscriptionData.id) {
      // Update existing subscription
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionToSave)
        .eq('id', subscriptionData.id);

      if (error) {
        console.error("Error updating subscription:", error);
      } else {
        setSubscriptions(prevSubs => prevSubs.map(sub => sub.id === subscriptionData.id ? mapDbSubToAppSub({ ...subscriptionToSave, id: sub.id }) : sub));
      }
    } else {
      // Insert new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionToSave)
        .select();

      if (error) {
        console.error("Error inserting subscription:", error);
      } else if (data && data.length > 0) {
        setSubscriptions(prevSubs => [...prevSubs, mapDbSubToAppSub(data[0])]);
      }
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      console.error("Error deleting subscription:", error);
    } else {
      setSubscriptions(prevSubs => prevSubs.filter(sub => sub.id !== subscriptionId));
    }
  };

  const clearAllSubscriptions = async () => {
    const { error } = await supabase.from('subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error("Error clearing subscriptions:", error);
    setSubscriptions([]);
  };

  const value = { subscriptions, isLoading, saveSubscription, deleteSubscription, clearAllSubscriptions };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};