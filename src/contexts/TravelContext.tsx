import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";
import { useToast } from "./ToastContext";
import * as Notifications from "expo-notifications";

interface ActiveTravel {
  via_codigo: number;
  via_status: string;
  via_valor_final: string;
  sol_origem: string;
  sol_destino: string;
  mot_nome: string;
  moto_modelo: string;
}

interface ActiveTravelResponse {
  success: boolean;
  data: ActiveTravel | null;
}

interface TravelContextData {
  activeTravel: ActiveTravel | null;
  loading: boolean;
  refreshTravel: () => Promise<void>;
}

const TravelContext = createContext({} as TravelContextData);

export function TravelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTravel, setActiveTravel] = useState<ActiveTravel | null>(null);
  const [loading, setLoading] = useState(false);

  const previousTravelRef = useRef<ActiveTravel | null>(null);

  async function sendTravelFinishedNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Corrida finalizada!",
        body: "Sua corrida foi finalizada pelo atendente, até logo!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
  }

  async function fetchActiveTravel() {
    if (!user) {
      setActiveTravel(null);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get<ActiveTravelResponse>(
        `/travels/pending-travel/${user.usu_codigo}`
      );

      const newTravel = response.data.success ? response.data.data : null;

      setActiveTravel(newTravel);
    } catch (error) {
      setActiveTravel(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      previousTravelRef.current = null;
      return;
    }

    if (previousTravelRef.current && !activeTravel) {
      showToast({
        title: "Corrida finalizada!",
        subtitle: "Sua corrida foi finalizada pelo atendente, até logo!",
        status: "success",
      });

      sendTravelFinishedNotification();
    }

    previousTravelRef.current = activeTravel;
  }, [activeTravel, user]);

  useEffect(() => {
    if (!user) {
      setActiveTravel(null);
      previousTravelRef.current = null;
      return;
    }

    fetchActiveTravel();
  }, [user]);

  useEffect(() => {
    if (!user || !activeTravel) return;

    const interval = setInterval(() => {
      fetchActiveTravel();
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTravel, user]);

  return (
    <TravelContext.Provider
      value={{
        activeTravel,
        loading,
        refreshTravel: fetchActiveTravel,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  return useContext(TravelContext);
}