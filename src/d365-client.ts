import { AxiosInstance, Method, AxiosResponse, AxiosError } from "axios";
import { createAxiosClient } from "./axios-d365";
import { isNullOrEmpty, isNullOrUndefined } from "./common";

export interface CreateResponse {
    entityType: string;
    id: string;
}

export interface ErrorResponse {
    errorCode: number;
    message: string;
}

export class D365Client {
    private axiosClient: AxiosInstance | Promise<AxiosInstance>;
    private apiBaseUrl = "api/data/v9.0/";

    public constructor(connectionString: string) {
        this.axiosClient = createAxiosClient(connectionString);
    }

    private async getAxiosClient() {
        return await this.axiosClient;
    }

    private async request(method: Method, resource: string, options?: string | null, data?: any): Promise<AxiosResponse> {
        const client = await this.getAxiosClient();
        try {
            const result = await client.request({
                method: method,
                url: `${this.apiBaseUrl}${resource}?${options ?? ""}`,
                data: data
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

    public async retrieveRecord<Model extends Record<string, any> = Record<string, any>>(entityLogicalName: string, id: string, options: string): Promise<Model> {
        return await (await this.request("get", `${entityLogicalName}(${encodeURIComponent(id)})`)).data;
    }

    public async retrieveMultipleRecords<Model extends Record<string, any> = Record<string, any>>(entityLogicalName: string, options?: string): Promise<Model[]> {
        const result = await this.request("get", entityLogicalName, options);
        return result.data.value;
    }

    public async createRecord<Model extends Record<string, any> = Record<string, any>>(entityLogicalName: string, data: Model): Promise<CreateResponse> {
        const result = await this.request("post", entityLogicalName, null, data);

        const regex = new RegExp(`${entityLogicalName}\\(([0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12})\\)$`);
        const regexResult = regex.exec(result.headers["odata-entityid"]);
        if (isNullOrUndefined(regexResult)) {
            throw new Error("Unable to extract id");
        }

        return {
            entityType: entityLogicalName,
            id: regexResult[1]
        };
    }

    public async updateRecord<Model extends Record<string, any> = Record<string, any>>(entityLogicalName: string, id: string, data?: Model): Promise<void> {
        await this.request("patch", `${entityLogicalName}(${encodeURIComponent(id)})`, null, data);
    }

    public async deleteRecord(entityLogicalName: string, id: string) {
        await this.request("delete", `${entityLogicalName}(${encodeURIComponent(id)})`);
    }

    public async executeAction(actionName: string, data: Record<string, any>) {
        return await (await this.request("post", actionName, null, data)).data;
    }
}