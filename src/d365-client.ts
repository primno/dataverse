import { AxiosInstance, Method, AxiosResponse } from "axios";
import { createAxiosClient } from "./axios-d365";
import { convertRetrieveMultipleOptionsToString, convertRetrieveOptionsToString, RetrieveMultipleOptions, RetrieveOptions } from "./query-options";

export interface ErrorResponse {
    errorCode: number;
    message: string;
}

export interface PersistenceOptionsEnabled {
    /**
     * Enable persistence. Default: false.
     */
    enabled: true;
    /**
     * Cache directory.
     */
    cacheDirectory: string;
    /**
     * Service name.
     */
    serviceName: string;
    /**
     * Account name.
     */
    accountName: string;
}

interface PersistenceOptionsDisabled {
    /**
     * Enable persistence. Default: false.
     */
    enabled?: false;
}

export type PersistenceOptions = PersistenceOptionsEnabled | PersistenceOptionsDisabled;

export type ApiVersion = "9.0" | "9.1" | "9.2";

/**
 * Configuration of D365-Client.
 */
export interface D365ClientOptions {
    /**
     * Configuration of persistence cache.
     */
    persistence?: PersistenceOptions;

    /**
     * WebAPI version. Default: 9.0.
     */
    apiVersion?: ApiVersion;
}

interface RequestOptions {
    method: Method;
    uri: string;
    data?: any;
    headers?: Record<string, string>
}

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

export {
    Condition,
    Expand,
    Filter,
    FilterCondition,
    FilterType,
    MultipleQueryOptions,
    Order,
    OrderBy,
    QueryOptions,
    QueryFunction
} from "./query-options";

export class D365Client {
    private axiosClient: AxiosInstance | Promise<AxiosInstance>;
    private apiBaseUrl: string;
    private options: D365ClientOptions;

    public constructor(connectionString: string, options?: D365ClientOptions) {
        this.options = {
            apiVersion: "9.0",
            ...options,

            persistence: {
                enabled: false,
                ...options?.persistence
            }
        };

        this.apiBaseUrl = `/api/data/v${this.options.apiVersion}/`
        this.axiosClient = createAxiosClient(connectionString, this.options);
    }

    private async getAxiosClient() {
        return await this.axiosClient;
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
        return {"Prefer": `odata.maxpagesize=${maxPageSize}`};
    }

    private async request(requestOptions: RequestOptions): Promise<AxiosResponse> {
        const { method, uri, data, headers } = requestOptions;

        const client = await this.getAxiosClient();
        try {
            const result = await client.request({
                method: method,
                url: `${this.apiBaseUrl}${uri}`,
                data: data,
                headers: { ...this.defaultHeaders, ...headers }
            });
            return result;
        }
        catch (except: any) {
            if (except.isAxiosError) {
                const data = except.response.data;
                if (data.error != null) {
                    const errorResponse = data.error as ErrorResponse
                    throw new Error(errorResponse.message);
                }
                else {
                    throw new Error(JSON.stringify(data));
                }
            }
            else {
                throw new Error(except);
            }
        }
    }

    /**
     * Gets a record from its id.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param id Guid of the record you want to retrieve.
     * @param options Selected fields.
     * @returns The record
     */
    public async retrieveRecord<TModele extends Modele = Modele>(entitySetName: string, id: string, options?: RetrieveOptions): Promise<TModele> {
        const result = await this.request({ method: "get", uri: `${entitySetName}(${id})${convertRetrieveOptionsToString(options)}` });
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
            uri: `${entitySetName}${convertRetrieveMultipleOptionsToString(options)}`,
            headers: maxPageSize == null ? undefined : this.getMaxPageSizeHeader(maxPageSize)
        });
        return { entities: result.data.value, nextLink: result.data["@odata.nextLink"]?.replace(/.+\?/, "?") };
    }

    /**
     * Create a record.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param data Record to create.
     * @returns Created record.
     */
    public async createRecord<TModele extends Modele = Modele>(entitySetName: string, data: TModele): Promise<TModele> {
        const result = await this.request({
            method: "post",
            uri: entitySetName,
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
            uri: `${entitySetName}(${id})`,
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
        await this.request({ method: "delete", uri: `${entitySetName}(${encodeURIComponent(id)})` });
    }

    public async executeAction(actionName: string, data: Record<string, any>) {
        const result = await this.request({ method: "post", uri: actionName, data });
        return result;
    }
}