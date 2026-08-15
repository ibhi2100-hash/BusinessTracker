import { PreparedStatementManager }
  from "../../../PreparedStatement/PreparedStatementManager";

import { ledgerKeys }
  from "./ledgerKeys";


export class LedgerStatements {

  constructor(
    private readonly manager: PreparedStatementManager
  ) {}

  get append() {
    return this.manager.get(
      ledgerKeys.append
    );
  }

  get findById() {
    return this.manager.get(
      ledgerKeys.findById
    );
  }

  get findByEvent() {
    return this.manager.get(
      ledgerKeys.findByEvent
    );
  }

  get findByBusiness() {
    return this.manager.get(
      ledgerKeys.findByBusiness
    );
  }

  get findByBranch() {
    return this.manager.get(
      ledgerKeys.findByBranch
    );
  }

  get findByAccount() {
    return this.manager.get(
      ledgerKeys.findByAccount
    );
  }

  get accountTotals() {
    return this.manager.get(
      ledgerKeys.getAccountTotals
    );
  }

  get verifyEvent(){
    return this.manager.get(
        ledgerKeys.verfifyEvent
    )
  }

}