const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },
    set(_transactions){
        localStorage.setItem("dev.finances:transactions",JSON.stringify(_transactions))
    }
}

const Modal = {
    toggle(_element){
        document
            .querySelector('div.modal-overlay#'+_element)
            .classList
            .toggle('active');
        }
}

const Transactions = {
    all: Storage.get(),

    add(_transaction){
        this.all.push(_transaction);
        App.reload();
    },
    remove(_index){
        this.all.splice(_index, 1);
        App.reload();
    },
    incomes(){
        let income = 0;
        this.all
            .forEach(_transaction =>{
                if(_transaction.amount > 0){
                    income += _transaction.amount;
                }
            })
        return income;
    },
    expenses(){
        let expense = 0;
        this.all
            .forEach(_transaction =>{
            if(_transaction.amount < 0){
                    expense += _transaction.amount;
                }
            })
        return expense;
    },
    total(){
        return this.incomes() + this.expenses();
    }
}

const DOM = {    
    transactionsContainer: document.querySelector('section#transactions table#data-table tbody'),

    addTransactions(_transaction, _index){
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHTMLTransaction(_transaction, _index);
        tr.dataset.index = _index;
        this.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(_transaction, _index){
        const cssClass = _transaction.amount > 0 ? "income":"expense";
        const amount = Utils.formatCurrency(_transaction.amount) ;
        const html = 
            `
                <td class="description">${_transaction.description}</td>
                <td class="${cssClass}">${amount}</td>
                <td class="date">${_transaction.date}</td>
                <td>
                    <img onclick="Transactions.remove(${_index})" src="./assets/minus.svg" alt="Remover transação">
                </td>
            `;

        return html;
    },
    updateBalance(){
        document
            .querySelector('div.card#incomeDisplay p')
            .innerHTML = Utils.formatCurrency(Transactions.incomes());
        document
            .querySelector('div.card#expenseDisplay p')
            .innerHTML = Utils.formatCurrency(Transactions.expenses());
        document
            .querySelector('div.card#totalDisplay p')
            .innerHTML = Utils.formatCurrency(Transactions.total());

    },
    clearTransactions(){
        this.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatAmount(_amount){
        _amount = Number(_amount) * 100;
        return _amount    
    },
    formatDate(_date){
        _date = _date.split("-").reverse().join("/");
        return _date;
    },
    formatDescription(_description){
        _description = description.trim();
        return _description;
    },
    formatCurrency(_amount){
        const signal = Number(_amount) < 0 ? "-" : " ";

        _amount = String(_amount).replace(/\D/g,"");
        _amount = Number(_amount) / 100;
        _amount = _amount.toLocaleString("pt-br",{
            style: "currency",
            currency: "BRL"
        })

        return signal + _amount;
    }
}

const FormAddTransaction = {
    description: document.querySelector('div#form-add-transaction input#description-transaction'),
    amount: document.querySelector('div#form-add-transaction input#amount-transaction'),
    date: document.querySelector('div#form-add-transaction input#date-transaction'),

    getValues(){
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value,
        };
    },
    validateFields(){
        const {description,amount,date} = this.getValues();
        if 
        (
            description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === ""
        )
        {
            throw new Error("Por favor, preencha todos os campos");
        }
    },
    formatValues(){
        let {description,amount,date} = this.getValues();
        description = Utils.formatDate(description);
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },
    clearFields(){
        this.description.value = "";
        this.amount.value = "";
        this.date.value = "";
    },
    submit(event){
        event.preventDefault();        
        try{
            this.validateFields();
            const transaction = this.formatValues();
            Transactions.add(transaction);
            this.clearFields();
            Modal.toggle("add-transaction");
        }
        catch(error)
        {
            alert(error.message);
        };
    }
}

const App = {
    init() {
        Transactions.all.forEach((_transaction, _index) => {
            DOM.addTransactions(_transaction, _index);    
        });
        DOM.updateBalance();

        Storage.set(Transactions.all);
    },
    reload(){
        DOM.clearTransactions();
        this.init();
    }
}

App.init();

