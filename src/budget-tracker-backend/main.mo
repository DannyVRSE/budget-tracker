import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import List "mo:base/List";
import Nat32 "mo:base/Nat32";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import Text "mo:base/Text";

actor {

  type PeriodId = Nat32;
  type ExpenseId = Nat32;

  type Key<K> = Trie.Key<K>;
  //expense
  public type Expense = {
    id : ExpenseId;
    date : Nat32;
    details : Text;
    amount : Nat32;
  };
  //period
  //add id to period
  public type Period = {
    id : PeriodId;
    start : Nat32;
    end : Nat32;
    budget : Nat32;
    expenses : List.List<Expense>;
  };
  //user
  public type User = {
    periods : List.List<Period>;
  };
  //all users
  private stable var users : Trie.Trie<Principal, User> = Trie.empty();
  //check if exists

  func key(p : Principal) : Key<Principal> {
    { hash = Principal.hash p; key = p };
  };

  //id's
  stable var nextPeriodId : PeriodId = 0;
  stable var nextExpenseId : ExpenseId = 0;

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
  public func addUser(principal : Principal, user : User) : async Principal {
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
  public func fetchPeriods(principal : Principal) : async [Period] {
    var periods = List.nil<Period>(); //empty list
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
      let user = { periods = List.nil<Period>() };
      var _userPrincipal = await addUser(principal, user);
      let userOpt = Trie.find(users, key(principal), Principal.equal);
      switch (userOpt) {
        case (?user) { periods := user.periods };
        case (null) {};
      };
    };
    //return array
    return List.toArray<Period>(periods);
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

    let user = Trie.find(users, key(principal), Principal.equal);
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
            expenses = List.nil<Expense>(); //empty list
          };
          //create new period list with the new period
          let updatedPeriods = List.push(period, periods);
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
          let period = List.find<Period>(periods, func p { p.id == periodId });
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
              let updatedExpenses = List.push(expense, expenses);
              //updated period
              let updatedPeriod : Period = {
                id = period.id;
                start = period.start;
                end = period.end;
                budget = period.budget;
                expenses = updatedExpenses;
              };
              //create new period list with the updated period
              let updatedPeriods = List.map<Period, Period>(
                periods,
                func p {
                  if (p.id == periodId) {
                    updatedPeriod;
                  } else {
                    p;
                  };
                },
              );

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

};
