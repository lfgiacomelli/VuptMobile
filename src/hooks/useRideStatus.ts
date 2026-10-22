import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";

export type RideStatus = "pendente" | "aceito" | "recusado" | "cancelada";

export function useRideStatus(sol_codigo: string) {
    const [request, setRequest] = useState<any>(null);
    const [status, setStatus] = useState<RideStatus>("pendente");
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const checkStatus = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const { data } = await api.get(`requests/request/${sol_codigo}`);
            const ride = data.data;

            setRequest(ride);
            
            if (ride.sol_status !== status) {
                setStatus(ride.sol_status as RideStatus);
                
                if (ride.sol_status !== "pendente") {
                    stopPolling();
                }
            }
        } catch (error) {
            console.error("Erro no polling:", error);
        } finally {
            setLoading(false);
        }
    };

    const stopPolling = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => {
        checkStatus();
        intervalRef.current = setInterval(() => checkStatus(true), 3500);
        return stopPolling;
    }, [sol_codigo]);

    return { request, status, loading };
}