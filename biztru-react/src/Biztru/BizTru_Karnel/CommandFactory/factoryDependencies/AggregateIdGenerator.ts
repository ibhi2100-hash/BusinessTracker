export class AggregateIdGenerator {

    next() {

        return crypto.randomUUID();

    }

}