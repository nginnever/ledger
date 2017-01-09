'use strict'
const Immutable = require('immutable')

//Accounts
var A = {}
var B = {}
var C = {}

// Store this nodes view of the state in memory
// I am not implementing permenant storage or
// network calls updating state so it will only persist in memory
var currentState = {}
var blockchain = Immutable.List([])
var tx_pool = []

// simulate client witnessing transactions and appending to global ledger
function run() {
  console.log('Running transaction simulation:')
  console.log('Initializing state:')
  // set coinbase and initial state
  A.unspent = []
  A.balance = 0
  B.unspent = [
    {
      UTXO_id: 0,
      input_tx: null, // coinbase, hash of the transaction that created this input 
      value: 400
    },
    {
      UTXO_id: 1,
      input_tx: '1b2j3b', // hash of the transaction that created this input 
      value: 100
    }
  ]
  B.balance = 500
  C.unspent = [
    {
      UTXO_id: 2,
      input_tx: '2df3f3', // coinbase, hash of the transaction that created this input 
      value: 200
    }
  ]
  C.balance = 200

  currentState.A = A
  currentState.B = B
  currentState.C = C

  console.log(currentState)

  // Set initial tx pool
  console.log('Setting initial transaction pool:')
  const tx1 = {
    inputs: [
      {
      	address: 'X',
  	input_UTXO_id: 0,
        sig: 'a2d2d2emk3mk3k33',
        value: 400
      }
    ],
    outputs: [
      {
      	address: 'C',
      	value: 300,
      	sig: 'f34f3v3c'
      },
      {
      	address: 'B',
      	value: 100,
      	sig: 'feef3c46c'
      }
    ]
  }

  const tx2 = {
    inputs: [
      {
      	address: 'C',
  	input_UTXO_id: 2,
        sig: 'a2d2d2emk3mk3k33',
        value: 200
      },
      {
      	address: 'C',
  	input_UTXO_id: 3, // created from proper order execution of txs
        sig: 'a2d2d2emk3mk3k33',
        value: 300
      }
    ],
    outputs: [
      {
      	address: 'A',
      	value: 400,
      	sig: 'f34f3v3c'
      },
      {
      	address: 'C',
      	value: 100,
      	sig: 'feef3c46c'
      }
    ]
  }
  
  // Simulate correct order of transaction execution
  tx_pool.push(tx1)
  tx_pool.push(tx2)

  console.log(tx_pool)

  console.log('Simulating first block transmission:')
  // assume the tx pool only has one tx in it per block
  var newState = createBlock(tx_pool, currentState)
  currentState = newState
}

function createBlock(pool, state) {
  console.log('Reviewing txs in pool:')
  var block = {}
  for (var i = 0; i < pool.length; i++) {
    console.log('TX: ' + i)
    console.log(pool[i].inputs)
    var inputTotal = 0
    var outputTotal = 0
    for (var v = 0; v < pool[i].inputs.length; v++) {
      if (pool[i].inputs[v].address == 'X') {
        //see coinbase tx
        console.log('coinbase:')
        inputTotal = inputTotal + 400
        currentState['B'].unspent.pop()
        currentState['B'].balance -= pool[i].inputs[v].value
      } else {
        // if (currentState[pool[i].inputs[v].address]
        console.log('deducting inputs')
        if (currentState[pool[i].inputs[v].address].balance < pool[i].inputs[v].value)
	  throw new Error('Transaction input invalid: not enough encumbered funds')
	console.log('-' + pool[i].inputs[v].value)
	currentState[pool[i].inputs[v].address].unspent.pop()
	currentState[pool[i].inputs[v].address].balance -= pool[i].inputs[v].value
        inputTotal = inputTotal + pool[i].inputs[v].value
      }
    }
    for (var z = 0; z < pool[i].outputs.length; z++) {
      // check here for genesis block bug
      outputTotal = outputTotal + pool[i].outputs[z].value
      currentState[pool[i].outputs[z].address].balance += pool[i].outputs[z].value
      currentState[pool[i].outputs[z].address].unspent.push({
        UTXO_id: 4,
        input_tx: '2sdfsd3f3', // coinbase, hash of the transaction that created this input 
        value: pool[i].outputs[z].value
      })
      console.log('adding output value:')
      console.log('+' + outputTotal)
    } 
    console.log('end tx analysis:')
    console.log('input total: '+ inputTotal)
    console.log('output total: '+ outputTotal)
    console.log('-------------------')
    if (inputTotal < outputTotal) {
      throw new Error('Not enough input funds for ouput of tx:')
    }
  }
  console.log('New client state:')
  console.log(currentState)
  console.log('Transactions confirmed, broadcasting block:')
  console.log('Blockchain:')
  console.log(addBlock(tx_pool))
}

function addBlock(pool) {
  blockchain = blockchain.push(JSON.stringify(pool))
  return blockchain
}
run()
