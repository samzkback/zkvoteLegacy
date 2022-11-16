# [Fix Bundle](./packages/snap/scripts/fix-bundle.js)  

1. [SyntaxError: Possible direct eval expression rejected at <unknown>:23672. (SES_EVAL_REJECTED)]

fix : rename eval() to eval8484() in packages/snap/node_modules/ffjavascript/build/main.cjs

2. ReferenceError: Worker is not defined

  In Node, it's a web-compatible Worker implementation atop Node's worker_threads.

  In the browser (and when bundled for the browser), it's simply an alias of Worker.

  ```javascript
      1: [function (require, module, exports) {
        module.exports = Worker;
      }, {}],
      2: [function (require, module, exports) {
        "use strict";
  ```

  How to enable Worker in SES ?
  window is subset in metamask flask.
  window.Worker exist in chromium, but not in metamask flask.
  might missing to add as endowments during create snap. (No, third-party/snaps-monorepo/packages/controllers/src/snaps/endowments/enum.ts)


3. Error when adding snap. Error: Error while running snap 'local:http://localhost:8080': Cannot read properties of undefined (reading 'Promise')

  ```javascript
    //var snarkjs = require('snarkjs');
    var ejs = require('ejs');
  ```

  Since ejs only used for generate solidity verifier，just remove from bundle.