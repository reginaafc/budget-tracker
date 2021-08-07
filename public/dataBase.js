let dataBase;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(e) {
  const dataBase = e.target.result;
  dataBase.createObjectStore("pend", { autoIncrement: true });
};

request.onsuccess = function(e) {
    dataBase = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(e) {
  console.log("An error has occured " + e.target.errorCode);
};

function saveRecord(record) {
  const transaction = dataBase.transaction(["pend"], "readwrite");
  const store = transaction.objectStore("pend");
  store.add(record);
}

function checkDatabase() {
  const transaction = dataBase.transaction(["pend"], "readwrite");
  const store = transaction.objectStore("pend");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = dataBase.transaction(["pend"], "readwrite");
        const store = transaction.objectStore("pend");
        store.clear();
      });
    }
  };
}

window.addEventListener("online", checkDatabase);