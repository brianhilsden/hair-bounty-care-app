// Age Groups
export const AGE_GROUPS = [
  { value: 'KIDS', label: 'Kids', subtitle: 'Under 12', emoji: '👶' },
  { value: 'TEENS', label: 'Teens', subtitle: '13-17 years', emoji: '🧒' },
  { value: 'YOUNG_ADULT', label: 'Young Adults', subtitle: '18-30 years', emoji: '👨' },
  { value: 'ADULT', label: 'Adults', subtitle: '31+ years', emoji: '👴' },
] as const;

// Genders
export const GENDERS = [
  { value: 'MALE', label: 'Male', emoji: '♂️' },
  { value: 'FEMALE', label: 'Female', emoji: '♀️' },
  { value: 'NON_BINARY', label: 'Non-Binary', emoji: '⚧️' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say', emoji: '🤐' },
] as const;

// Hair Goals
export const HAIR_GOALS = [
  { value: 'LENGTH', label: 'Length', description: 'Grow longer hair', emoji: '📏' },
  { value: 'DENSITY', label: 'Density', description: 'Increase hair thickness', emoji: '🌿' },
  { value: 'HEALTH', label: 'Health', description: 'Overall hair health', emoji: '💚' },
  { value: 'MOISTURE', label: 'Moisture', description: 'Better moisture retention', emoji: '💧' },
  { value: 'DAMAGE_REPAIR', label: 'Damage Repair', description: 'Fix damaged hair', emoji: '🔧' },
  { value: 'FRESH_START', label: 'Fresh Start', description: 'New hair journey', emoji: '✨' },
  { value: 'STYLE_VARIETY', label: 'Style Variety', description: 'Try new styles', emoji: '🎨' },
] as const;

// Curl Patterns
export const CURL_PATTERNS = [
  { value: 'TYPE_1A', label: 'Type 1A', description: 'Straight, fine hair', category: 'Straight' },
  { value: 'TYPE_1B', label: 'Type 1B', description: 'Straight, medium texture', category: 'Straight' },
  { value: 'TYPE_1C', label: 'Type 1C', description: 'Straight, coarse hair', category: 'Straight' },
  { value: 'TYPE_2A', label: 'Type 2A', description: 'Wavy, fine hair', category: 'Wavy' },
  { value: 'TYPE_2B', label: 'Type 2B', description: 'Wavy, medium texture', category: 'Wavy' },
  { value: 'TYPE_2C', label: 'Type 2C', description: 'Wavy, coarse hair', category: 'Wavy' },
  { value: 'TYPE_3A', label: 'Type 3A', description: 'Curly, loose curls', category: 'Curly' },
  { value: 'TYPE_3B', label: 'Type 3B', description: 'Curly, medium curls', category: 'Curly' },
  { value: 'TYPE_3C', label: 'Type 3C', description: 'Curly, tight curls', category: 'Curly' },
  { value: 'TYPE_4A', label: 'Type 4A', description: 'Coily, soft defined coils', category: 'Coily' },
  { value: 'TYPE_4B', label: 'Type 4B', description: 'Coily, wiry Z-pattern', category: 'Coily' },
  { value: 'TYPE_4C', label: 'Type 4C', description: 'Coily, tight zig-zag', category: 'Coily' },
] as const;

// Hair Density
export const HAIR_DENSITY = [
  { value: 'LOW', label: 'Low Density', description: 'Can easily see scalp', emoji: '🔍' },
  { value: 'MEDIUM', label: 'Medium Density', description: 'Scalp somewhat visible', emoji: '👀' },
  { value: 'HIGH', label: 'High Density', description: 'Scalp barely visible', emoji: '🌳' },
] as const;

// Porosity
export const POROSITY = [
  { value: 'LOW', label: 'Low Porosity', description: 'Takes long to absorb moisture', emoji: '🔒' },
  { value: 'NORMAL', label: 'Normal Porosity', description: 'Absorbs moisture well', emoji: '✅' },
  { value: 'HIGH', label: 'High Porosity', description: 'Absorbs quickly, loses fast', emoji: '🚰' },
] as const;

// Strand Thickness
export const STRAND_THICKNESS = [
  { value: 'FINE', label: 'Fine', description: 'Thin, delicate strands', emoji: '〰️' },
  { value: 'MEDIUM', label: 'Medium', description: 'Average thickness', emoji: '➖' },
  { value: 'THICK', label: 'Thick', description: 'Wide, strong strands', emoji: '━' },
] as const;

// Scalp Types
export const SCALP_TYPES = [
  { value: 'oily', label: 'Oily', description: 'Gets greasy quickly', emoji: '💦' },
  { value: 'dry', label: 'Dry', description: 'Feels tight and flaky', emoji: '🏜️' },
  { value: 'normal', label: 'Normal', description: 'Balanced, comfortable', emoji: '😊' },
  { value: 'combination', label: 'Combination', description: 'Oily roots, dry ends', emoji: '🎭' },
] as const;
