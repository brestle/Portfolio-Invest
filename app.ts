import { getPrice } from './api'
import inquirer from 'inquirer'
import * as fs from 'fs'

//  portfolio model
type Portfolio = {
  token: string;
  amount: number;
}

function readBytes(filterDate: number, filterToken: string) {
  const portfolios: Array<Portfolio> = []

  var offset = 40                                 // skip header
  var chunkSize = 2048                            // read memory chunk size
  var chunkBuffer = Buffer.alloc(chunkSize)       // alloc chunk buffer
  var fp = fs.openSync('transactions.csv', 'r')
  var bytesRead = 0                               // bytes read so far

  while(bytesRead = fs.readSync(fp, chunkBuffer, 0, chunkSize, offset)) {
    offset += bytesRead                           // move cursor
    var str = chunkBuffer.subarray(0, bytesRead).toString()
    var chunkRows:Array<any> = str.split('\n')    // read lines in current chunk

    if(bytesRead = chunkSize) {
      // the last item of the chunkRows may be not a full line, leave it to the next chunk
      offset -= chunkRows.pop().length
    }

    // process read rows in current chunk
    chunkRows.forEach( row => {
      const cols = row.split(',')                 // get col data of each row
      
      // skip lines unmatching with user inputs
      if (filterToken && cols[2] != filterToken) return
      if (filterDate && new Date(filterDate*1000).setHours(0,0,0,0) != new Date(parseInt(cols[0])*1000).setHours(0,0,0,0)) return

      // update portfolio data
      const exists = portfolios.find((obj) => {
        return obj.token === cols[2]
      })
      
      if (exists) 
        exists.amount += parseFloat(cols[3]) * (cols[1] == 'DEPOSIT'?1:-1)
      else 
        portfolios.push({token: cols[2], amount: parseFloat(cols[3]) * (cols[1] == 'DEPOSIT'?1:-1)})
    })
  }  // completed reading csv

  portfolios.forEach( async (portfolio) => {
    let price = await getPrice(portfolio.token)   // get token price in usd
    console.log(`${portfolio.token} Amount: ${portfolio.amount}, USD Price: ${price*portfolio.amount}`)   // show result
  })
  console.log('Completed!')
  setTimeout(()=>start(), 2000)   // get new inputs
}

function start() {
  console.log('----------------------- start app --------------------------')
  return inquirer.
    prompt([
      {
        name: 'token',
        message: 'Token Name: ',
        type: 'input',
        validate: (token:string) => {
          if ( /^[A-Z]*$/.test(token) ) return true;
          else return 'Allowed null or capital letters';
        }
      },{
        name: "date",
        message: "Date (YYYY-MM-DD): ",
        type: "input", 
        validate: (d:string) => {
          if ( /^([0-9]{4}-[0-9]{2}-[0-9]{2}|)$/.test(d) ) return true;
          else return 'Allowed null or valid dates';
        },
      }
    ])
    .then ((inputs:any) => {
      console.log('Processing...')
      readBytes(inputs.date ? Math.floor(new Date(inputs.date).getTime() / 1000) : 0, inputs.token)
    })
}

start()