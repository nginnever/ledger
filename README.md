# ledger
an immutable transaction ledger (this is a thought experiment for developing blockchains)

##Requirements

- No double spending.
- Clients should reject tx's that don't agree with their view of the state
- UTXOs must be fully spent
- Change is sent back as another UTXO back to origin.
- The block state is immutable, append only.
- Balance must be maintained for each address.
- Balance is a collection of UTXOs spent to address
- Transactions will be rejected if sum inputs < sum outputs
- All out puts have an input tx
- The coinbase transaction is the only tx to violate this rule.


##Design

The following code runs a simple simulation of a distributed system updating a list of transaction operations.
The goal is to make this list immutable so that once a transaction is agreed (this simulation does not provide a
consensus algorithm) to have been placed in the list, it can be verified to have happened as long as nobody can
alter the append only requirement of the list. In practice this would be done with one way math functions where
no two different inputs will map to the same image.

The ledger here is a log of operations used to verify valid transactions. The current state is built from replaying
the operations in the log.  Clients will receive messages from the network to add new transaction operations to their
pool. The client builds new blocks of operations to append to the ledger by verifying if these transactions agree with
their view of the local state. If a client chooses to include transaction operations in a new block that do not conform 
to the above requirements, other clients will choose to reject that block, as clients will only agree to add a new block
if the incoming confirmed transactions are valid.

In this simulation you will see a pseudo blockchain instantiated with immutable.js list data structure. This ensures
that any new add operations to the list strictly create a new state instead of mutating the existing one. A history
of state can be maintained. This program however does not have any data persistence, everything is in memory.

An initial state is created by the requirements of the test question. A transaction pool is then formed and the client
begins running the operations in the pool and verifies the requirements. The client will then post a new set of ops 
to the blockchain list, discarding the old list (no history maintained but would be persisted to storage if their was
a db).

The accounts are A, B, and C and their balances reflect the transactions created from the test question. If the
transactions are played out of order where C tries to spend inputs the client hasn't seen yet, the client will reject
this transaction until it sees the missing one.

Clients will need to maintain their transaction pool and view of the state as they read operations from blocks. If a transaction is broadcast that the client has already seen, or contains a tx with inputs that have not been played out in the client state, it will reject the transaction as it is updating. A client will not be able to confirm blocks unless it has ran through the entire history (no SPV here or prunning in this example) and played out the transaction operations to maintain an updated view of the state of transactions.

##Scalability

A system as described above will have two fileds of concerns when dealing with scalability.

####Network

Possible network architectures have not yet been discussed in this simulation. There is a large field of study on bandwidth costs in distributed systems. Assume the network in place is using a gossip protocol. Overheads such as broadcasting messages to nodes that have already received those messages need to be considered. Gossiping to gain information about the network in an attempt to reduce this could result in more network calls. There are protocols to reduce this load by aggregating information with different methods.

####Storage

Something to note about an immutable database is the size of the log. Since the log is append only it will continue to grow at the speed of transaction confirmation. In Satoshi's paper he describes "pruning", a way to delete unnecessary data about transactions that are fully spent. This can help reduce the amount of data needed to be stored by full validation clients. 


##Prototype

output of simulation run

```
Running transaction simulation:
Initializing state:
State:
{ 
  A: { unspent: [], balance: 0 },
  B: { unspent: [ [Object], [Object] ], balance: 500 },
  C: { unspent: [ [Object] ], balance: 200 } 
}

Setting initial transaction pool:
[ 
  { 
   inputs: [ [Object] ], outputs: [ [Object], [Object] ] 
  },
  { 
    inputs: [ [Object], [Object] ],
    outputs: [ [Object], [Object] ] 
  } 
]

Simulating first block transmission:
Reviewing txs in pool:

tx1:
input txs:
[ 
  { 
    address: 'X',
    input_UTXO_id: 0,
    sig: 'a2d2d2emk3mk3k33',
    value: 400
  }
]
    
coinbase:
deduction from inputs
-400
adding output value:
+300
adding output value:
+100
end tx analysis:
input total: -400
output total: +400
-------------------

tx2:
input txs:
[ 
  { 
    address: 'C',
    input_UTXO_id: 2,
    sig: 'a2d2d2emk3mk3k33',
    value: 200 },
  { 
    address: 'C',
    input_UTXO_id: 3,
    sig: 'a2d2d2emk3mk3k33',
    value: 300
  } 
]
    
deduction from inputs:
-200
deduction from inputs:
-300
adding output value:
+400
adding output value:
+100
end tx analysis:
input total: -500
output total: +500
-------------------

Transactions confirmed, broadcasting block:
New client state:
{ 
  A: { unspent: [ [Object] ], balance: 400 },
  B: { unspent: [ [Object] ], balance: 100 },
  C: { unspent: [ [Object] ], balance: 100 } 
}

Blockchain:
List [ "[{\"inputs\":[{\"address\":\"X\",\"input_UTXO_id\":0,\"sig\":\"a2d2d2emk3mk3k33\",\"value\":400}],\"outputs\":[{\"address\":\"C\",\"value\":300,\"sig\":\"f34f3v3c\"},{\"address\":\"B\",\"value\":100,\"sig\":\"feef3c46c\"}]},{\"inputs\":[{\"address\":\"C\",\"input_UTXO_id\":2,\"sig\":\"a2d2d2emk3mk3k33\",\"value\":200},{\"address\":\"C\",\"input_UTXO_id\":3,\"sig\":\"a2d2d2emk3mk3k33\",\"value\":300}],\"outputs\":[{\"address\":\"A\",\"value\":400,\"sig\":\"f34f3v3c\"},{\"address\":\"C\",\"value\":100,\"sig\":\"feef3c46c\"}]}]" ]
```


##Fail Case

To test the fail case, you can change the variable names of the transactions so that the pool picks them up in the
reverse order.  This will cause a case were account C is trying to spend more in its input transactions than the current
view of the state says that C has.

output

``Error: Transaction input invalid: not enough encumbered funds``
