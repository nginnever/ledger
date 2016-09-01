# ledger
an immutable transaction ledger

##Requirements

- No double spending
- Clients should reject tx's that don't agree with their view of the state
- UTXOs must be fully spent
- Change is sent back as another UTXO back to origin
- The block state is immutable, append only
- Balance must be maintained for each address 
- Balance is a collection of UTXOs spent to address
- Transctions will be rejected if sum inputs < sum outputs
- All out puts have an input tx
- The coinbase transaction is the only tx to violate this rule


##Design

The following code runs a simple simulation of a distributed system updating a list of transaction operations.
The goal is to make this list immutable so that once a transaction is agreed (this simulation does not provide a
consensus algorithm) to have been placed in the list, it can be verified to have happened as long as nobody can
alter the append only requirement of the list. In practice this would be done with one way math functions where
no two different inputs will map to the same image.

The ledger here is a log of operations used to verify valid transactions. The current state is built from replaying
the operations in the log.  Clients will receive messages from the network to add new transaction operations to their
pool. The client builds new blocks of operations to append to the ledger by verifing if these transactions agree with
their view of the local state. If a client chooses to include transaction operations in a new block that do not conform 
to the above requirements, other clients will choose to reject that block, as clients will only agree to add a new block
if the incoming confirmed transactions are valid.

In this simulation you will see a psudo blockchain instantiated with immutable.js list data structure. This ensures
that any new add operations to the list strictly create a new state instead of mutating the existing one. A history
of state can be maintained. This program however does not have any data persistence, everything is in memory.

An initial state is created by the requirments of the test question. A transaction pool is then formed and the client
begins running the operations in the pool and verifies the requirements. The client will then post a new set of ops 
to the blockchain list, discarding the old list (no history maintained but would be persisted to storage if their was
a db).

The accounts are A, B, and C and their balances reflect the transactions created from the test question. If the
transactions are played out of order where C tries to spend inputs the client hasn't seen yet, the client will reject
this transaction until it sees the missing one.


##Prototype

output of simulation run


##Fail Case

To test the fail case, you can change the variable names of the transactions so that the pool picks them up in the
reverse order.  This will cause a case were account C is trying to spend more in its input transactions than the current
view of the state says that C has.

