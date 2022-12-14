import { getPrice } from './api'
import inquirer from 'inquirer'
import * as fs from 'fs'
import { parse } from 'csv-parse'

type Transaction = {
  timestamp: number;
  transaction_type: string;
  token: string;
  amount: number;
};

type Portfolio = {
  token: string;
  amount: number;
}

function readLines(filterDate: number, filterToken: string) {
    let rowCount = 0;

    const portfolios: Array<Portfolio> = []

    fs.createReadStream("transactions.csv")
    .pipe(parse({
      delimiter: ',',
      columns: ['timestamp', 'transaction_type', 'token', 'amount'],
      fromLine: 2,
      cast: (columnValue, context) => {
        if (context.column === 'timestamp') {
          return parseInt(columnValue)
        } else if (context.column === 'amount') {
          return parseFloat(columnValue)
        }
        return columnValue
      },
      on_record: (row: Transaction, context) => {
        if (filterDate && new Date(row.timestamp * 1000).setHours(0,0,0,0) != new Date(filterDate * 1000).setHours(0,0,0,0)) return
        if (filterToken && row.token !== filterToken) return

        return row
      },
    }))
    .on("data", (row: Transaction) => {
      rowCount ++;
      console.log(`Process Rows: ${rowCount}`)
      const exists = portfolios.find((obj) => {
        return obj.token === row.token
      })
      
      if (exists) 
        exists.amount += row.amount * (row.transaction_type == 'DEPOSIT'?1:-1)
      else 
        portfolios.push({token: row.token, amount: row.amount * (row.transaction_type == 'DEPOSIT'?1:-1)})
    }).on("end", () => {
      portfolios.forEach( async (portfolio) => {
        let price = await getPrice(portfolio.token)
        console.log(`${portfolio.token} Amount: ${portfolio.amount}, USD Price: ${price*portfolio.amount}`)
      });
      console.log('total', rowCount)
    }).on("error", (error) => {
      console.error(error.message)
    });
}

function start() {
  console.log('----------------------- start compare app --------------------------')
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
      readLines(inputs.date ? Math.floor(new Date(inputs.date).getTime() / 1000) : 0, inputs.token)
    })
}

start()