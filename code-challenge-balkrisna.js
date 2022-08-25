// concurrencyLimit which will return a function that does exactly what fn does, but with the number of concurrent calls to fn limited to n. We will assume fn returns a Promise.
// Since fn returns a Promise, we could keep track of the "process" of each call by keeping the promises they returns. We keep those promises in the list pendingPromises.

const concurrencyMax = 4;

// Sheduler timeout
function scheduler(cb, taskName, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cb(taskName);
      resolve();
    }, delay);
  });
}

// Keep track of the "process" and returns the promise
const concurrencyLimit = (fn, n) => {
  const pendingPromises = new Set();
  return async function (...args) {
    while (pendingPromises.size >= n) {
      await Promise.race(pendingPromises);
    }
    const p = fn.apply(this, args);
    const r = p.catch(() => {});
    pendingPromises.add(r);
    await r;
    pendingPromises.delete(r);
    return p;
  };
};

const taskList = ["A", "B", "C", "D", "E", "F", "G", "h", "I"];

let cb = (taskName) => {
  console.log(taskName + " task completed", Date.now() % 10000);
};

// Sheduler modifie if needed
let modifiedScheduler = concurrencyLimit(scheduler, concurrencyMax);

// executing
const exe = () => taskList.map((t) => modifiedScheduler(cb, t, 1000));
exe();
