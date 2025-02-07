import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Nat32 "mo:base/Nat32";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import Text "mo:base/Text";

actor {

  //types
  type PeriodId = Nat32;
  type ExpenseId = Nat32;

  type Key<K> = Trie.Key<K>;

  //period
  public type Period = {
    start : Nat32;
    end : Nat32;
    budget : Nat32;
    expenses : Trie.Trie<ExpenseId, Expense>;
  };

  //expense
  public type Expense = {
    date : Nat32;
    details : Text;
    amount : Nat32;
  };

  //user
  public type User = {
    periods : Trie.Trie<PeriodId, Period>;
  };

  //all users
  private stable var users : Trie.Trie<Principal, User> = Trie.empty();
  //check if exists

  func key(p : Principal) : Key<Principal> {
    { hash = Principal.hash p; key = p };
  };

  //id's
  stable var nextPeriodId : PeriodId = 1;
  stable var nextExpenseId : ExpenseId = 1;

  //check if user exists
  public func exists(principal : Principal) : async Bool {
    let user = Trie.find(users, key(principal), Principal.equal);
    let exists = Option.isSome(user);
    if (exists) {
      true;
    } else {
      false;
    };
  };

  //add user
  public func addUser(principal : Principal) : async Principal {
    //create user with empty periods
    let user : User = {
      periods = Trie.empty();
    };
    //check if exists
    if (await exists(principal)) {
      return principal;
    } else {
      users := Trie.put(
        users,
        key principal,
        Principal.equal,
        user,
      ).0;
      return principal;
    };
  };

  //fetch periods or create account
  public func fetchPeriods(principal : Principal) : async [{
    id : PeriodId;
    period : Period;
  }] {

    var periods : Trie.Trie<PeriodId, Period> = Trie.empty(); //empty Trie

    //check if they exist
    if (await exists(principal)) {
      //if they do, fetch periods, will be a list
      let userOpt = Trie.find(users, key(principal), Principal.equal);
      switch (userOpt) {
        case (?user) { periods := user.periods };
        case (null) {};
      };
    } else {
      //if not create account, then fetch periods
      var _userPrincipal = await addUser(principal);
      let userOpt = Trie.find(users, key(principal), Principal.equal);
      switch (userOpt) {
        case (?user) { periods := user.periods };
        case (null) {};
      };
    };
    //return array
    return Trie.toArray<PeriodId, Period, { id : PeriodId; period : Period }>(
      periods,
      func(k, v) = ({ id = k; period = v }),
    );
  };

  //add period
  public func newPeriod(principal : Principal, start : Nat32, end : Nat32, budget : Nat32) : async Bool {
    //basic validation
    //check if start is before end
    if (start >= end) {
      return false;
    };

    //check if budget is positive
    if (budget <= 0) {
      return false;
    };

    let periodId = nextPeriodId;
    nextPeriodId += 1;

    let user = Trie.find(users, key(principal), Principal.equal); //find user
    let exists = Option.isSome(user);
    if (exists) {
      switch (user) {
        case (null) {
          return false;
        };
        case (?user) {
          let periods = user.periods;
          //create new period
          let period : Period = {
            id = periodId;
            start = start;
            end = end;
            budget = budget;
            expenses = Trie.empty(); //empty expenses initially
          };
          //create new period trie with the new period
          let updatedPeriods = Trie.put(periods, { hash = periodId; key = periodId }, Nat32.equal, period).0;
          //update the user with the new period
          let updatedUser : User = { periods = updatedPeriods };
          //update the user in the trie
          users := Trie.put(users, key principal, Principal.equal, updatedUser).0;
          return true;
        };
      };
    };
    return false;
  };

  //add expense
  public func newExpense(principal : Principal, periodId : Nat32, date : Nat32, details : Text, amount : Nat32) : async Bool {
    let expenseId = nextExpenseId;
    nextExpenseId += 1;

    let expense : Expense = {
      id = expenseId;
      date = date;
      details = details;
      amount = amount;
    };

    let user = Trie.find(users, key(principal), Principal.equal);
    let exists = Option.isSome(user);
    if (exists) {
      switch (user) {
        case (null) {
          return false;
        };
        case (?user) {
          let periods = user.periods;
          //fetch period
          let period = Trie.find(periods, { hash = periodId; key = periodId }, Nat32.equal);
          switch (period) {
            case (null) {
              return false;
            };
            case (?period) {
              //add expense to period
              let expenses = period.expenses;

              //check if expense is within period
              if (date < period.start or date > period.end) {
                return false;
              };

              //create new expense list with the new expense
              //let updatedExpenses = List.push(expense, expenses);
              let updatedExpenses = Trie.put(expenses, { hash = expenseId; key = expenseId }, Nat32.equal, expense).0;
              //updated period
              let updatedPeriod : Period = {
                start = period.start;
                end = period.end;
                budget = period.budget;
                expenses = updatedExpenses;
              };

              let updatedPeriods = Trie.put(periods, { hash = periodId; key = periodId }, Nat32.equal, updatedPeriod).0;

              //update the user with the new period
              let updatedUser : User = { periods = updatedPeriods };
              //update the user in the trie
              users := Trie.put(users, key principal, Principal.equal, updatedUser).0;

              return true;
            };
          }

        };
      };
    };

    //update user
    return false;
  };

  //remove period
  public func removePeriod(principal : Principal, periodId : Nat32) : async Bool {
    let user = Trie.find(users, key(principal), Principal.equal);//find user
    let exists = Option.isSome(user);
    if (exists) {
      switch (user) {
        case (null) {
          return false;
        };
        case (?user) {
          let periods = user.periods;
          //fetch period
          let period = Trie.find(periods, { hash = periodId; key = periodId }, Nat32.equal);
          switch (period) {
            case (null) {
              return false;
            };
            case (?period) {
              //remove period
              let updatedPeriods = Trie.remove(periods, { hash = periodId; key = periodId }, Nat32.equal).0;
              //update the user with the new period
              let updatedUser : User = { periods = updatedPeriods };
              //update the user in the trie
              users := Trie.put(users, key principal, Principal.equal, updatedUser).0;
              return true;
            };
          }

        };
      };
    };

    return false;
  };

  //remove expense
  public func removeExpense(principal : Principal, periodId : Nat32, expenseId : Nat32) : async Bool {
    let user = Trie.find(users, key(principal), Principal.equal);//find user
    let exists = Option.isSome(user);
    if (exists) {
      switch (user) {
      case (null) {
        return false;
      };
      case (?user) {
        let periods = user.periods;
        //fetch period
        let period = Trie.find(periods, { hash = periodId; key = periodId }, Nat32.equal);
        switch (period) {
        case (null) {
          return false;
        };
        case (?period) {
          //fetch expenses
          let expenses = period.expenses;
          //remove expense
          let updatedExpenses = Trie.remove(expenses, { hash = expenseId; key = expenseId }, Nat32.equal).0;
          //update the period with the new expenses
          let updatedPeriod : Period = {
          start = period.start;
          end = period.end;
          budget = period.budget;
          expenses = updatedExpenses;
          };

          let updatedPeriods = Trie.put(periods, { hash = periodId; key = periodId }, Nat32.equal, updatedPeriod).0;
          //update the user with the new period
          let updatedUser : User = { periods = updatedPeriods };
          //update the user in the trie
          users := Trie.put(users, key principal, Principal.equal, updatedUser).0;
          return true;
        };
        }

      };
      };
    };

    return false;
    };

};
