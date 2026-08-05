class ProjectionRecoveryService {

    async rebuildAggregate(id){

        const events = await source.loadAggregate(id);

        await projectionEngine.replay(events);

    }

}