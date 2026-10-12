export function isSameAccount(actorId, requestedId) {
  if (actorId === undefined || actorId === null || requestedId === undefined || requestedId === null) {
    return false;
  }
  return String(actorId) === String(requestedId);
}
