import { Environment } from "@azure/msal-node-extensions";
import { AxiosInstance, Method, AxiosResponse, AxiosError } from "axios";
import { createAxiosClient } from "./axios-d365";
import { isNullOrUndefined } from "./common";
import { convertQueryOptionsToString, MultipleQueryOptions, QueryOptions } from "./query-options";

export interface ErrorResponse {
    errorCode: number;
    message: string;
}

export interface D365ClientOptions {
    cacheDirectory: string;
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
            cacheDirectory: options?.cacheDirectory ?? Environment.getUserRootDirectory()
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

    public async retrieveRecord<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, id: string, options: QueryOptions): Promise<Model> {
        const result = await this.request({ method: "get", uri: `${entitySetName}(${id})` });
        return result.data;
    }

    public async retrieveMultipleRecords<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, options: MultipleQueryOptions): Promise<Model[]> {
        const result = await this.request({ method: "get", uri: `${entitySetName}${convertQueryOptionsToString(options)}` });
        return result.data.value;
    }

    public async createRecord<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, data: Model): Promise<Model> {
        const result = await this.request({
            method: "post",
            uri: entitySetName,
            data,
            headers: this.preferRepresentationHeaders
        });
        return result.data;
    }

    public async updateRecord<Model extends Record<string, any> = Record<string, any>>(entitySetName: string, id: string, data?: Model): Promise<Model> {
        const result = await this.request({
            method: "patch",
            uri: `${entitySetName}(${id})`,
            data,
            headers: this.preferRepresentationHeaders
         });
        return result.data;
    }

    public async deleteRecord(entitySetName: string, id: string) {
        await this.request({ method: "delete", uri: `${entitySetName}(${encodeURIComponent(id)})` });
    }

    public async executeAction(actionName: string, data: Record<string, any>) {
        const result = await this.request({ method: "post", uri: actionName, data });
        return result;
    }
}