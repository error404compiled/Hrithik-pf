import { getAppwriteServices, isAppwriteConfigured } from "./appwriteClient";

export async function getCurrentUser() {
  if (!isAppwriteConfigured()) return null;
  const services = getAppwriteServices();
  try {
    return await services.account.get();
  } catch {
    return null;
  }
}

export async function loginWithEmailPassword(email, password) {
  const services = getAppwriteServices();
  await services.account.createEmailPasswordSession(email, password);
  return services.account.get();
}

export async function logout() {
  const services = getAppwriteServices();
  await services.account.deleteSession("current");
}

export function isAdminUser(user) {
  if (!user?.email) return false;
  const services = getAppwriteServices();
  const adminEmail = services?.config?.adminEmail;
  if (!adminEmail) return false;
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

