import { MultipleQueryOptions, convertQueryOptionsToString } from "../src/query-options";

describe("QueryOptions", () => {
    describe("$select", () => {
        it("should generate a $select query option", () => {
            const options: MultipleQueryOptions = {
                select: ["foo", "bar"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=foo,bar");
        });
    });

    describe("$filter", () => {
        it("should generate a $filter query option", () => {
            const options: MultipleQueryOptions = {
                filters: [{
                    conditions: [{
                        attribute: "foo",
                        operator: "eq",
                        value: "bar"
                    }]
                }],
                select: ["selectedField"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$filter=(foo eq 'bar')");
        });

        it("should generate a greater than $filter query option", () => {
            const options: MultipleQueryOptions = {
                filters: [{
                    conditions: [{
                        attribute: "foo",
                        operator: "gt",
                        value: 10
                    }]
                }],
                select: ["selectedField"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$filter=(foo gt 10)");
        });

        it("should generate a Between $filter query option", () => {
            const options: MultipleQueryOptions = {
                filters: [{
                    conditions: [{
                        attribute: "foo",
                        operator: "Between",
                        value: [10, 20]
                    }]
                }],
                select: ["selectedField"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$filter=(Microsoft.Dynamics.CRM.Between(PropertyName='foo',PropertyValues=['10','20']))");
        });

        it("should generate a Tomorrow $filter query option", () => {
            const options: MultipleQueryOptions = {
                filters: [{
                    conditions: [{
                        attribute: "foo",
                        operator: "Tomorrow"
                    }]
                }],
                select: ["selectedField"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$filter=(Microsoft.Dynamics.CRM.Tomorrow(PropertyName='foo'))");
        });
    });

    describe("$top", () => {
        it("should generate a $top query option", () => {
            const options: MultipleQueryOptions = {
                top: 10,
                select: ["selectedField"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$top=10");
        });
    });

    describe("$expand", () => {
        it("should generate a $expand query option", () => {
            const options: MultipleQueryOptions = {
                expands: [{
                    attribute: "foo",
                    select: ["bar"]
                }],
                select: ["selectedField"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$expand=foo($select=bar)");
        });
    });

    describe("$orderby", () => {
        it("should generate a $orderby query option", () => {
            const options: MultipleQueryOptions = {
                orders: [
                    {
                        attribute: "foo",
                        order: "desc"
                    },
                    {
                        attribute: "bar",
                        order: "asc"
                    }
                ],
                select: ["selectedField"]
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$orderby=foo desc,bar asc");
        });
    });

    describe("multiple query options", () => {
        it("should generate multiple query options", () => {
            const options: MultipleQueryOptions = {
                expands: [{
                    attribute: "foo",
                    select: ["bar"]
                }],
                filters: [{
                    conditions: [{
                        attribute: "foo",
                        operator: "eq",
                        value: "bar"
                    }]
                }],
                select: ["selectedField"],
                top: 10
            };
            expect(convertQueryOptionsToString(options)).toBe("?$select=selectedField&$filter=(foo eq 'bar')&$top=10&$expand=foo($select=bar)");
        });
    });
});