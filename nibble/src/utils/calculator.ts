export function calculateTDEE(params: {
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: "male" | "female";
  activityLevel: number; // e.g. 1.2, 1.375, 1.55, 1.725
  goalType: "deficit" | "maintenance" | "surplus";
}): number {
  // :number = returns number
  const { weight, height, age, gender, activityLevel, goalType } = params;

  // Mifflin-St Jeor Equation for BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Multiply by Activity Factor to get Maintenance TDEE
  const tdee = bmr * activityLevel;

  if (goalType === "deficit") {
    return Math.round(tdee - 500); // -500 cal
  } else if (goalType === "surplus") {
    return Math.round(tdee + 300); // + 300cal
  }
  return Math.round(tdee); // Maintenance cal
}
