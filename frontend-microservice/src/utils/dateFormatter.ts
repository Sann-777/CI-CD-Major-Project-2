export const formattedDate = (date: string | undefined): string => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return dateObj.toLocaleDateString('en-US', options)
}
