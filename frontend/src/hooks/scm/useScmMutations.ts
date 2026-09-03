import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/queryClient';
import {
  applyRecommendation,
  cancelShipment,
  changeCarrier,
  addIncidentComment,
  createIncidentFromException,
  createScenario,
  executePlanAction,
  resolveIncident,
  runScenario,
} from '@/services/scm/scmService';
import type { CreateScenarioInput } from '@/types/scm/scenario';
import type { IncidentDetail } from '@/types/scm/incident';
import { ROLE_LABELS } from '@/types/scm/roles';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import type { PlanKind } from '@/mocks/scm/planState';
import { PLAN_ACTION_LABELS } from '@/constants/platformRu';

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

export function useAddIncidentCommentMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ incidentId, message }: { incidentId: string; message: string }) => {
      const author = user
        ? { name: user.name, role: ROLE_LABELS[user.role] ?? user.role }
        : undefined;
      return addIncidentComment(incidentId, message, author);
    },
    onSuccess: (comment, { incidentId }) => {
      queryClient.setQueryData<IncidentDetail>(queryKeys.incident(incidentId), (prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev,
      );
      showSnackbar('Комментарий добавлен', 'success');
    },
    onError: () => showSnackbar('Не удалось добавить комментарий', 'error'),
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

export function useExecutePlanActionMutation(planKind: PlanKind) {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const queryKey = planKind === 'supply' ? queryKeys.supplyPlan : queryKeys.transportPlan;

  return useMutation({
    mutationFn: (action: string) => executePlanAction(planKind, action),
    onSuccess: (_data, action) => {
      void queryClient.invalidateQueries({ queryKey });
      const label = PLAN_ACTION_LABELS[action] ?? action;
      showSnackbar(`${label} — выполнено`, 'success');
    },
    onError: (_err, action) => {
      const label = PLAN_ACTION_LABELS[action] ?? action;
      showSnackbar(`Не удалось: ${label.toLowerCase()}`, 'error');
    },
  });
}

export function useCreateScenarioMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  return useMutation({
    mutationFn: (input: CreateScenarioInput) => createScenario(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenarios() });
      showSnackbar('Сценарий создан', 'success');
    },
    onError: () => showSnackbar('Не удалось создать сценарий', 'error'),
  });
}

export function useRunScenarioMutation() {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  return useMutation({
    mutationFn: (scenarioId: string) => runScenario(scenarioId),
    onSuccess: (_data, scenarioId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenarios() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenario(scenarioId) });
      void queryClient.invalidateQueries({ queryKey: ['scenarioCompare'] });
      showSnackbar('Расчёт сценария завершён', 'success');
    },
    onError: () => showSnackbar('Не удалось запустить сценарий', 'error'),
  });
}
