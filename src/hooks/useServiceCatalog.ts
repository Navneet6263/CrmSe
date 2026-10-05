import { useCallback, useEffect, useState } from "react";
import { services as initialServices, type Service } from "@/data/mockCrmData";

const STORAGE_KEY = "crmse-services";
const CHANGE_EVENT = "crmse-services-change";

function readServices(): Service[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialServices;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as Service[]).map((service) => ({ ...service, active: service.active !== false })) : initialServices;
  } catch {
    return initialServices;
  }
}

export function useServiceCatalog() {
  const [services, setServices] = useState<Service[]>(readServices);

  useEffect(() => {
    const sync = () => setServices(readServices());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const save = useCallback((next: Service[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setServices(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const addService = useCallback((service: Omit<Service, "id">) => {
    save([...readServices(), { ...service, id: `svc-${Date.now()}` }]);
  }, [save]);

  const updateService = useCallback((service: Service) => {
    save(readServices().map((item) => item.id === service.id ? service : item));
  }, [save]);

  const removeService = useCallback((id: string) => {
    save(readServices().filter((item) => item.id !== id));
  }, [save]);

  const resetServices = useCallback(() => save(initialServices), [save]);
  return { services, addService, updateService, removeService, resetServices };
}