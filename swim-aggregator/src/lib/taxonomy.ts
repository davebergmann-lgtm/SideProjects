export const SPORTS = ["swimming", "strength"] as const;
export type Sport = (typeof SPORTS)[number];

export const SWIM_STROKES = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "IM",
  "any",
] as const;
export type SwimStroke = (typeof SWIM_STROKES)[number];

export const SWIM_EXERCISE_TYPES = [
  "drill",
  "set",
  "warmup",
  "cooldown",
  "technique",
  "pull",
  "kick",
  "main_set",
] as const;
export type SwimExerciseType = (typeof SWIM_EXERCISE_TYPES)[number];

export const POOL_TYPES = ["SCY", "SCM", "LCM", "open_water"] as const;
export type PoolType = (typeof POOL_TYPES)[number];

export const SWIM_EQUIPMENT = [
  "none",
  "fins",
  "paddles",
  "pullbuoy",
  "kickboard",
  "snorkel",
  "tempo_trainer",
  "parachute",
  "ankle_band",
  "mesh_bag",
  "resistance_cord",
  "monofin",
] as const;
export type SwimEquipment = (typeof SWIM_EQUIPMENT)[number];

export const SWIM_FOCUS = [
  "catch",
  "high_elbow_pull",
  "rotation",
  "body_position",
  "breathing",
  "streamline",
  "kick_from_hips",
  "turns",
  "starts",
  "underwater_dolphin",
  "tempo",
  "distance_per_stroke",
  "endurance",
  "speed",
  "threshold",
  "VO2max",
] as const;
export type SwimFocus = (typeof SWIM_FOCUS)[number];

export const DIFFICULTY = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTY)[number];

export type SwimmingAttrs = {
  stroke: SwimStroke;
  exercise_type: SwimExerciseType;
  distance_meters?: number;
  pool_type?: PoolType;
  focus: SwimFocus[];
};
