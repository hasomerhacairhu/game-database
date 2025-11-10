// Debug script to check CSV headers
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRcx1YPhoi6kUVe36T4T2162AhCdBwuVSX0ou2u-Vlicjf2So3VL3E2MDzrNYIbkgckP4n8p18_UOGP/pub?gid=0&single=true&output=csv')
  .then(response => response.text())
  .then(csvText => {
    const lines = csvText.split('\n')
    console.log('First 3 lines of CSV:')
    console.log(lines[0]) // Headers
    console.log(lines[1]) // First game
    console.log(lines[2]) // Second game
    
    // Parse headers
    const headers = lines[0].split(',')
    console.log('\nHeaders array:')
    headers.forEach((h, i) => console.log(`${i}: "${h}"`))
  })
