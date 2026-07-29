"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContextProvider = void 0;
class ExecutionContextProvider {
    constructor(repo) {
        this.repo = repo;
    }
    async initialize() {
        this.currentContext =
            await this.repo.getCurrentContext();
    }
    current() {
        if (!this.currentContext) {
            throw new Error("ExecutionContextProvider has not been initialized.");
        }
        return this.currentContext;
    }
    async refresh() {
        this.currentContext = await this.repo.getCurrentContext();
    }
}
exports.ExecutionContextProvider = ExecutionContextProvider;
