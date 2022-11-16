# Annoymous Voting Demo

1. User provide "seed" for generate identity commitment
2. User Create A Group, and Been the Group Cordinator.
3. Any Other User Permit by Cordinator Could Join a Group with identity commitment , been Group Member.
4. Any one in Group could "Proposal Msg" with proof to voting in Group

# [Workflow](./WORKFLOW.md)

# setup

```shell
nvm use
yarn install
yarn build:snap
yarn start
[Optional] ts-node packages/site/backend/backend.ts
```

# TODO

1. Frontend reconstrcut group in runtime ? No, Group is the same, need a backend. (Group will not change, when vote start.)

2. Deploy optimism testnet/explower

3. Vercle Deploy


# Local Testnet issues

1. metamask : advance --> reset , when restart a chain.
2. metmask optimsim testnet chain ID 17: invalid sender #0


# [Fix Bundle](./FIX_BUNDLE.md)
  