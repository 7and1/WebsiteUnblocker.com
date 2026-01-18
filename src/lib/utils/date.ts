const defaultFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function formatDate(date: string | number | Date, formatter = defaultFormatter) {
  return formatter.format(new Date(date))
}
