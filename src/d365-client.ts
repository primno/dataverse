import { AxiosInstance, Method, AxiosResponse } from "axios";
import { createAxiosClient } from "./axios-d365";
import { isNullOrUndefined } from "./common";
import { convertQueryOptionsToString, MultipleQueryOptions, QueryOptions } from "./query-options";

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

/**
 * Configuration of D365-Client.
 */
export interface D365ClientOptions {
    /**
     * Configuration of persistence cache.
     */
    persistence?: PersistenceOptions;
}

interface RequestOptions {
    method: Method;
    uri: string;
    data?: any;
    headers?: Record<string, string>
}

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
    private apiVersion = "9.0";
    private apiBaseUrl = `/api/data/v${this.apiVersion}/`;
    private options: D365ClientOptions;

    public constructor(connectionString: string, options?: D365ClientOptions) {
        this.options = {
            persistence: {
                enabled: false,
                ...options?.persistence 
            }
        };

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
        catch(except: any) {
            if (except.isAxiosError) {
                const data = except.response.data;
                if (!isNullOrUndefined(data.error)) {
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
    public async retrieveRecord<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, id: string, options: QueryOptions): Promise<Model> {
        const result = await this.request({ method: "get", uri: `${entitySetName}(${id})${convertQueryOptionsToString(options)}` });
        return result.data;
    }

    /**
     * Retrieves a collection of records.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param options OData query options.
     * @returns Collection of records.
     */
    public async retrieveMultipleRecords<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, options: MultipleQueryOptions): Promise<Model[]> {
        const result = await this.request({ method: "get", uri: `${entitySetName}${convertQueryOptionsToString(options)}` });
        return result.data.value;
    }

    /**
     * Create a record.
     * @param entitySetName Entity set name. Eg: accounts, contacts.
     * @param data Record to create.
     * @returns Created record.
     */
    public async createRecord<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, data: Model): Promise<Model> {
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
    public async updateRecord<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, id: string, data?: Model): Promise<Model> {
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