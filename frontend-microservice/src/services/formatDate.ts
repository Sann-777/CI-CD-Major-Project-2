export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }
  const date = new Date(dateString)
  const formattedDate = date.toLocaleDateString("en-US", options)

  const day = date.getDate()
  const daySuffix = getDaySuffix(day)

  return formattedDate.replace(/\d+/, `${day}${daySuffix}`)
}

const getDaySuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return "th"
  }
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}
