declare module 'virtual:study-activity' {
  /** YYYY-MM-DD -> commits that day touching CONFIG.record.activityDirs */
  const days: Record<string, number>
  export default days
}
