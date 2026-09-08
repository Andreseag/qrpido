export function getElapsedTime(createdAt: string): number {
  return Math.floor(
    (new Date().getTime() - new Date(createdAt).getTime()) / 60000,
  );
}
