"use client";

import {
  collectProfileTags,
  getScenarioById,
  type ScenarioDef,
} from "@/data/akinator-flow";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

const STORAGE_KEY = "lunch-akinator-v1";

export interface AkinatorPersistedState {
  scenarioId: string | null;
  /** questionId → optionId */
  answers: Record<string, string>;
  /** 0 = 시나리오 선택, 1..n = 해당 시나리오 질문 인덱스(1-based) */
  stepIndex: number;
}

const defaultState: AkinatorPersistedState = {
  scenarioId: null,
  answers: {},
  stepIndex: 0,
};

type SessionAction =
  | { type: "hydrate"; payload: AkinatorPersistedState }
  | { type: "selectScenario"; scenario: ScenarioDef }
  | { type: "answer"; questionId: string; optionId: string }
  | { type: "goBack" }
  | { type: "resetAll" };

function sessionReducer(
  state: AkinatorPersistedState,
  action: SessionAction,
): AkinatorPersistedState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "selectScenario":
      return {
        scenarioId: action.scenario.id,
        answers: {},
        stepIndex: 1,
      };
    case "answer": {
      if (!state.scenarioId) return state;
      const scenario = getScenarioById(state.scenarioId);
      if (!scenario) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
        stepIndex: state.stepIndex + 1,
      };
    }
    case "goBack": {
      if (state.stepIndex <= 0) return state;
      if (state.stepIndex === 1) {
        return { scenarioId: null, answers: {}, stepIndex: 0 };
      }
      return { ...state, stepIndex: state.stepIndex - 1 };
    }
    case "resetAll":
      return defaultState;
    default:
      return state;
  }
}

function readStorage(): AkinatorPersistedState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AkinatorPersistedState>;
    return {
      scenarioId:
        typeof parsed.scenarioId === "string" || parsed.scenarioId === null
          ? parsed.scenarioId
          : defaultState.scenarioId,
      answers:
        parsed.answers && typeof parsed.answers === "object" && !Array.isArray(parsed.answers)
          ? (parsed.answers as Record<string, string>)
          : {},
      stepIndex:
        typeof parsed.stepIndex === "number" && Number.isFinite(parsed.stepIndex)
          ? Math.max(0, Math.floor(parsed.stepIndex))
          : 0,
    };
  } catch {
    return defaultState;
  }
}

function writeStorage(state: AkinatorPersistedState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function useAkinatorSession() {
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatch] = useReducer(sessionReducer, defaultState);

  useEffect(() => {
    dispatch({ type: "hydrate", payload: readStorage() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(state);
  }, [state, hydrated]);

  const { scenarioId, answers, stepIndex } = state;

  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);

  const totalSteps = scenario ? 1 + scenario.questions.length : 1;

  const currentQuestion = useMemo(() => {
    if (!scenario || stepIndex <= 0) return null;
    return scenario.questions[stepIndex - 1] ?? null;
  }, [scenario, stepIndex]);

  const profileTags = useMemo(
    () => (scenarioId ? collectProfileTags(scenarioId, answers) : []),
    [scenarioId, answers],
  );

  const selectScenario = useCallback((s: ScenarioDef) => {
    dispatch({ type: "selectScenario", scenario: s });
  }, []);

  const answerCurrent = useCallback((questionId: string, optionId: string) => {
    dispatch({ type: "answer", questionId, optionId });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "goBack" });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "resetAll" });
  }, []);

  const isComplete =
    Boolean(scenario) && stepIndex > 0 && stepIndex > scenario!.questions.length;

  return {
    hydrated,
    scenarioId,
    scenario,
    answers,
    stepIndex,
    totalSteps,
    currentQuestion,
    profileTags,
    selectScenario,
    answerCurrent,
    goBack,
    resetAll,
    isComplete,
  };
}
