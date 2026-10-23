export const USER_ROLES = ["admin", "mentor", "mentee"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const INVITATION_RECORD_STATUSES = ["pending", "accepted", "expired", "revoked"] as const;
export type InvitationRecordStatus = (typeof INVITATION_RECORD_STATUSES)[number];

export const INVITATION_VALIDATION_STATUSES = ["valid", "invalid", "expired", "revoked", "used", "setup"] as const;
export type InvitationValidationStatus = (typeof INVITATION_VALIDATION_STATUSES)[number];

export const INVITATION_TYPES = [
  "admin_invites_admin",
  "admin_invites_mentor",
  "admin_invites_mentee",
  "mentor_invites_mentee",
  "mentor_requests_future_mentor"
] as const;
export type InvitationType = (typeof INVITATION_TYPES)[number];

export const RELATIONSHIP_STATUSES = ["invited", "requested", "active", "paused", "ended"] as const;
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];

export const MENTORSHIP_PLAN_STATUSES = ["draft", "active", "completed", "paused"] as const;
export type MentorshipPlanStatus = (typeof MENTORSHIP_PLAN_STATUSES)[number];

export const LESSON_STATUSES = ["not_started", "scheduled", "in_progress", "completed", "skipped"] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export const SESSION_STATUSES = ["proposed", "confirmed", "completed", "canceled", "missed"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const MATERIAL_TYPES = [
  "html",
  "pdf",
  "presentation",
  "markdown",
  "text",
  "image",
  "external_link",
  "repository"
] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

export const ATTACHMENT_TARGET_TYPES = ["plan", "lesson", "session"] as const;
export type AttachmentTargetType = (typeof ATTACHMENT_TARGET_TYPES)[number];

export const PROGRESS_CONFIDENCE_LEVELS = ["low", "growing", "confident"] as const;
export type ProgressConfidence = (typeof PROGRESS_CONFIDENCE_LEVELS)[number];

export const NOTIFICATION_TYPES = [
  "invitation_created",
  "invitation_accepted",
  "relationship_activated",
  "plan_activated",
  "session_scheduled",
  "session_rescheduled",
  "session_completed",
  "shared_note"
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_ENTITY_TYPES = ["invitation", "relationship", "plan", "session", "note"] as const;
export type NotificationEntityType = (typeof NOTIFICATION_ENTITY_TYPES)[number];

export const COMMUNICATION_NOTE_TYPES = [
  "mentor_private",
  "mentor_shared",
  "mentee_note",
  "next_action",
  "session_summary"
] as const;
export type CommunicationNoteType = (typeof COMMUNICATION_NOTE_TYPES)[number];

export const COMMUNICATION_CONTEXT_TYPES = ["relationship", "plan", "lesson", "session"] as const;
export type CommunicationContextType = (typeof COMMUNICATION_CONTEXT_TYPES)[number];

export const COMMUNICATION_VISIBILITIES = ["mentor_only", "mentor_and_mentee"] as const;
export type CommunicationVisibility = (typeof COMMUNICATION_VISIBILITIES)[number];
