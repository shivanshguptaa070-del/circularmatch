export const formatNumber = (value: number | null | undefined, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(value ?? 0)

export const formatCurrency = (value: number | null | undefined, maximumFractionDigits = 0) =>
  value === null || value === undefined
    ? 'Not provided'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits,
      }).format(value)

export const formatKg = (value: number | null | undefined) => `${formatNumber(value)} kg`

export const titleCase = (value: string | null | undefined) =>
  (value || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export const compactNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0)
