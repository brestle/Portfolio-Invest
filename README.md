# Porfolio-Calulation

## Install

Replace transactions.csv to this directory.
Since it's large file, i didn't put the file in this repository

```
npm install
```
or
```
yarn install
```

## Run

```
npm run start
```

Process requires 2 step input prompts.
User can input correct valid data or press enter to skip

for example
```
Token Name  :  XRP
Date: 2011-11-11

```
 
## Explain

Algorithm to calculate portfolio balances is simple, not so complex.
The problem was to handle large scale csv file (30000000 rows) and i tried 2 ways to read csv file

  - read csv line by line in stream mode.  (compare.ts)
  - read lines from buffer chunks.  (app.ts)

The result shows reading from memory is much more fast than reading line by line

You can execute first way
```
npm run compare
```

Warm Regards!