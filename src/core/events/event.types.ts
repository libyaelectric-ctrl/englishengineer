import { AppError } from '../errors/app-error';

export type AppEvent =
  | AppStartedEvent
  | AppErrorEvent
  | RouteChangedEvent
  | UserActionEvent
  | LearningStartedEvent
  | LearningCompletedEvent
  | XpEarnedEvent
  | BadgeUnlockedEvent
  | AICoachStartedEvent
  | AICoachCompletedEvent
  | AICoachFailedEvent
  | VocabularyMasteredEvent;

export interface BaseEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: string;
}

export interface AppStartedEvent extends BaseEvent {
  readonly type: 'app.started';
  readonly payload: {
    readonly environment: string;
    readonly userAgent: string;
    readonly timestamp: number;
  };
}

export interface AppErrorEvent extends BaseEvent {
  readonly type: 'app.error';
  readonly payload: {
    readonly error: AppError;
  };
}

export interface RouteChangedEvent extends BaseEvent {
  readonly type: 'route.changed';
  readonly payload: {
    readonly from: string;
    readonly to: string;
  };
}

export interface UserActionEvent extends BaseEvent {
  readonly type: 'user.action';
  readonly payload: {
    readonly action: string;
    readonly target: string;
    readonly metadata?: Record<string, unknown>;
  };
}

export interface LearningStartedEvent extends BaseEvent {
  readonly type: 'learning.started';
  readonly payload: {
    readonly module: string;
    readonly topicId: string;
  };
}

export interface LearningCompletedEvent extends BaseEvent {
  readonly type: 'learning.completed';
  readonly payload: {
    readonly module: string;
    readonly topicId: string;
    readonly score: number;
    readonly durationSeconds: number;
  };
}

export interface XpEarnedEvent extends BaseEvent {
  readonly type: 'xp.earned';
  readonly payload: {
    readonly amount: number;
    readonly reason: string;
  };
}

export interface BadgeUnlockedEvent extends BaseEvent {
  readonly type: 'badge.unlocked';
  readonly payload: {
    readonly badgeId: string;
    readonly badgeName: string;
  };
}

export interface AICoachStartedEvent extends BaseEvent {
  readonly type: 'ai.coach.started';
  readonly payload: {
    readonly modeId: string;
    readonly modeName: string;
    readonly focusArea: string;
  };
}

export interface AICoachCompletedEvent extends BaseEvent {
  readonly type: 'ai.coach.completed';
  readonly payload: {
    readonly modeId: string;
    readonly modeName: string;
    readonly providerState: string;
    readonly focusArea: string;
  };
}

export interface AICoachFailedEvent extends BaseEvent {
  readonly type: 'ai.coach.failed';
  readonly payload: {
    readonly modeId: string;
    readonly modeName: string;
    readonly message: string;
  };
}

export interface VocabularyMasteredEvent extends BaseEvent {
  readonly type: 'vocabulary:mastered';
  readonly payload: {
    readonly termId: string;
    readonly masteredAt: string;
  };
}

export type EventSubscriptionToken = {
  readonly unsubscribe: () => void;
};

export type AppEventHandler<T extends AppEvent = AppEvent> = (event: T) => void;
