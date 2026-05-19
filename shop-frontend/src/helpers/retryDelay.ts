export const calculateRetryDelay = (retryCount: number) => {
    const base = 2000

    const max = 1000 * 60 * 5 // 5 minutes

    return Math.min(
        base * Math.pow(2, retryCount), 
        max
    )
}