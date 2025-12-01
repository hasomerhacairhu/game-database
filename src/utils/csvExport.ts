// src/utils/csvExport.ts

/**
 * Export an array of objects as a CSV file and trigger download in browser.
 * @param data Array of objects to export
 * @param filename Name of the downloaded file
 */
export function exportArrayAsCSV(data: any[], filename = 'export.csv') {
  if (!data || !data.length) return
  const keys = Object.keys(data[0])
  const header = keys.join(',')
  const rows = data.map(row =>
    keys.map(key => {
      let val = row[key]
      if (Array.isArray(val)) {
        return '"' + val.join(';') + '"'
      }
      if (typeof val === 'string') {
        return '"' + val.replace(/"/g, '""') + '"'
      }
      if (val === null || val === undefined) {
        return ''
      }
      return val
    }).join(',')
  )
  const csvContent = [header, ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
