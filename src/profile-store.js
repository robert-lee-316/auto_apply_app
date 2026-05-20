import fs from "fs/promises";
import path from "path";
import { profile as defaultProfile } from "./profile.js";

export function getDefaultProfile() {
  return structuredClone(defaultProfile);
}

export function getProfilePath(userDataPath) {
  return path.join(userDataPath, "profile.json");
}

export async function loadProfile(userDataPath) {
  const filePath = getProfilePath(userDataPath);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return { ...getDefaultProfile(), ...JSON.parse(raw) };
  } catch {
    return getDefaultProfile();
  }
}

export async function saveProfile(userDataPath, profile) {
  const filePath = getProfilePath(userDataPath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(profile, null, 2), "utf8");
  return filePath;
}
