const { get } = require("../routes/api");

let db;
let budgetVersion;

const request = indexeDB.open('BudgetDB' ,budgetVersion || 1);

request.onupgradenned = function (e) {
    console.log('Upgrade needed in IndexDB');

    const { oldVersion } = e;
    const newVersion = e. newVersion || db. version;

    console.log(`DB Updated from version ${oldVersion}to ${newVersion}`);

    db = e.target.result;

    if (db. objectStoreName.length === 0) {
        db.creatObjectStore('BudgetStore', { autoIncrement: true});
    }
};

request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
    console.log('check db invoked');

    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = trabsaction.objectStore('BudgetStore');

    const getAll = store.getAll();

    getAll.onsuccess = function () {

        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((res) => {

                if (res.length !== 0) {
                    transaction = db.transaction(['BudgetStore'], 'readwrite');

                    const currentStore = transaction.objectStore('BudgetStore');

                    currentStore.clear();
                    console.log('clearing store 🧹');
                }
            });
        }
    };
}

request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;

    if(navigator.onLine) {
        console.log('Backend online!🗄️');
        checkDatabase();
    }
};

const saveRecord = (record) => {
    console.log('Save record invoked');

    const transaction = db.transaction.objectStore(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    store.add(record);
};

window.addEventListener('online', checkDatabase);