class SalesApi {

    constructor(

        private readonly domain: BusinessDomain

    ){}

    async createSale(request: CreateSaleRequest){

        return this.domain.execute({

            type: "sales.create",

            payload: request

        });

    }

}