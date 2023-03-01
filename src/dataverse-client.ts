import { DataverseClientOptions } from "./dataverse-client-options";
import { convertRetrieveMultipleOptionsToString, convertRetrieveOptionsToString, RetrieveMultipleOptions, RetrieveOptions } from "./query-options";
import { RequestOptions, Response, WebClient } from "./client";

/**
 * Collection of entities.
 */
export interface EntityCollection<TModele extends Modele = Modele> {
    /**
     * Entities.
     */
    entities: TModele[];
    /**
     * Nextlink to retrieve next page. To retrieve the next page, nextLink must be passed to the options parameter of retrieveMultipleRecords().
     */
    nextLink?: string;
}

type Modele = Record<string, any>;

/**
 * Dataverse client.
 * Allows to perform CRUD operations on Dataverse / D365 CE (on-premises) entities.
 */
export class DataverseClient {
    private apiBaseUrl: string;
    private options: DataverseClientOptions;

    /**
     * Creates a new instance of DataverseClient.
     * @param client Web client. Eg: ConnStringClient, NtlmClient, OAuthClient, etc.
     * @param options Configuration of DataverseClient.
     */
    public constructor(
        private client: WebClient,
        options?: DataverseClientOptions
    ) {
        this.options = {
            apiVersion: "9.0",
            ...options
        };

        this.apiBaseUrl = `/api/data/v${this.options.apiVersion}/`;
    }

    private readonly defaultHeaders = {
        "OData-Version": "4.0",
        "OData-MaxVersion": "4.0",
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8"
    };

    private readonly preferRepresentationHeaders = {
        "Prefer": "return=representation"
    }

    private getMaxPageSizeHeader(maxPageSize: number) {
        return { "Prefer": `odata.maxpagesize=${maxPageSize}` };
    }

    private async request(requestOptions: RequestOptions): Promise<Response> {
        const { method, url, data, headers } = requestOptions;

        try {
            const result = await this.client.request({
                method: method,
                url: `${this.apiBaseUrl}${url}`,
                data: data,
                headers: { ...this.defaultHeaders, ...headers }
            });
            return result;
        }
        catch (except: any) {
            throw new Error(except);
        }
    }

    /**
     * Gets a record from its id.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param id Guid of the record you want to retrieve.
     * @param options Selected fields.
     * @returns The record
     */
    public async retrieveRecord<TModele extends Modele = Modele>(
        entitySetName: string,
        id: string,
        options?: RetrieveOptions
    ): Promise<TModele> {
        const result = await this.request({
            method: "get",
            url: `${entitySetName}(${id})${convertRetrieveOptionsToString(options)}`
        });

        return result.data;
    }

    /**
     * Retrieves a collection of records.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param options OData query options. Can be a a custom string, a query options object or the nextLink of a previous result of retrieveMultipleRecords().
     * @param maxPageSize Max page size to retrieve. Default value is 5000.
     * @example
     * // Retrieve 2 accounts. Select only the name.
     * retrieveMultipleRecords("accounts", "?$select=name&$top=2");
     * // Retrieve all contacts with the last name Smith. Select only the first name and the last name.
     * retrieveMultipleRecords("contacts", {
     *      select: ["firstname", "lastname"],
     *      filter: [{ conditions: [{ attribute: "lastname", operator: "eq", value: "Smith"}] }]
     * });
     * @returns Collection of records.
     */
    public async retrieveMultipleRecords<TModele extends Modele = Modele>(
        entitySetName: string,
        options?: RetrieveMultipleOptions,
        maxPageSize?: number
    ): Promise<EntityCollection<TModele>> {
        const result = await this.request({
            method: "get",
            url: `${entitySetName}${convertRetrieveMultipleOptionsToString(options)}`,
            headers: maxPageSize == null ? undefined : this.getMaxPageSizeHeader(maxPageSize)
        });

        return {
            entities: result.data.value,
            nextLink: result.data["@odata.nextLink"]?.replace(/.+\?/, "?")
        };
    }

    /**
     * Create a record.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param data Record to create.
     * @returns Created record.
     */
    public async createRecord<TModele extends Modele = Modele>(
        entitySetName: string,
        data: TModele
    ): Promise<TModele> {
        const result = await this.request({
            method: "post",
            url: entitySetName,
            data,
            headers: this.preferRepresentationHeaders
        });

        return result.data;
    }

    /**
     * Update a record.
     * @param entitySetName  Entity set name. Eg: accounts, contacts.
     * @param id Guid of the record you want to update.
     * @param data Record with updated data.
     * @returns Updated record.
     */
    public async updateRecord<TModele extends Modele = Modele>(entitySetName: string, id: string, data?: TModele): Promise<TModele> {
        const result = await this.request({
            method: "patch",
            url: `${entitySetName}(${id})`,
            data,
            headers: this.preferRepresentationHeaders
        });

        return result.data;
    }

    /**
     * Delete a record.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param id Guid of the record you want to delete.
     */
    public async deleteRecord(entitySetName: string, id: string) {
        await this.request({
            method: "delete",
            url: `${entitySetName}(${encodeURIComponent(id)})`
        });
    }

    public async executeAction(actionName: string, data: Record<string, any>) {
        const result = await this.request({
            method: "post",
            url: actionName,
            data
        });

        return result;
    }
}