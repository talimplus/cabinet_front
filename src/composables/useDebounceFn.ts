/**
 * Funksiya chaqiruvini kechiktiradi: ketma-ket chaqiruvlarda faqat oxirgisi,
 * `delay` ms jimlikdan so'ng ishga tushadi. Qidiruv inputlari uchun qulay.
 */
export function useDebounceFn<T extends (...args: unknown[]) => void>(fn: T, delay = 400) {
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
