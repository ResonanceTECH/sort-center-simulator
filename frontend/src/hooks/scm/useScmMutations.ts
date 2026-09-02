import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/queryClient';
import {
  applyRecommendation,
  cancelShipment,
  changeCarrier,
  createIncidentFromException,
  resolveIncident,
} from '@/services/scm/scmService';
import { useUiStore } from '@/store/uiStore';

export function useChangeCarrierMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  return useMutation({
    mutationFn: ({ shipmentId, carrierId }: { shipmentId: string; carrierId: string }) =>
      changeCarrier(shipmentId, carrierId),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipment(vars.shipmentId) });
      void queryClient.invalidateQueries({ queryKey: ['shipments'] });
      showSnackbar('Перевозчик назначен', 'success');
    },
    onError: () => showSnackbar('Не удалось назначить перевозчика', 'error'),
  });
}

export function useCancelShipmentMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  return useMutation({
    mutationFn: (shipmentId: string) => cancelShipment(shipmentId),
    onSuccess: (_data, shipmentId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipment(shipmentId) });
      void queryClient.invalidateQueries({ queryKey: ['shipments'] });
      showSnackbar('Поставка отменена', 'success');
    },
    onError: () => showSnackbar('Не удалось отменить поставку', 'error'),
  });
}

export function useResolveIncidentMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  return useMutation({
    mutationFn: (incidentId: string) => resolveIncident(incidentId),
    onSuccess: (_data, incidentId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.incident(incidentId) });
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      showSnackbar('Инцидент решён', 'success');
    },
    onError: () => showSnackbar('Не удалось закрыть инцидент', 'error'),
  });
}

export function useApplyRecommendationMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  return useMutation({
    mutationFn: (recommendationId: string) => applyRecommendation(recommendationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
      showSnackbar('Рекомендация применена', 'success');
    },
    onError: () => showSnackbar('Не удалось применить рекомендацию', 'error'),
  });
}

export function useCreateIncidentMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  return useMutation({
    mutationFn: (exceptionId: string) => createIncidentFromException(exceptionId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      showSnackbar('Инцидент создан', 'success');
      return data;
    },
    onError: () => showSnackbar('Не удалось создать инцидент', 'error'),
  });
}
