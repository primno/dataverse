import { AxiosInstance } from "axios";
import { createAxiosClient } from "./axios-d365";

export class D365Client {
    private axiosClient: AxiosInstance | Promise<AxiosInstance>;
    private apiBaseUrl = "api/data/v9.0/";

    public constructor(connectionString: string) {
        this.axiosClient = createAxiosClient(connectionString);
    }

    private async getAxiosClient() {
        return await this.axiosClient;
    }

    public async retrieveRecord(entityLogicalName: string, id: string, options: string) {
        const client = await this.getAxiosClient();
        return (await client.get(`${this.apiBaseUrl}${entityLogicalName}(${encodeURIComponent(id)})?${options ?? ""}`)).data;
    }

    public async retrieveMultipleRecords(entityLogicalName: string, options?: string) {
        const client = await this.getAxiosClient();
        return (await client.get(`${this.apiBaseUrl}${entityLogicalName}?${options ?? ""}`)).data;
    }

    public async createRecord(entityLogicalName: string, data?: any) {
        const client = await this.getAxiosClient();
        return (await client.post(`${this.apiBaseUrl}${entityLogicalName}`, data)).data;
    }

    public async updateRecord(entityLogicalName: string, id: string, data?: any) {
        const client = await this.getAxiosClient();
        return (await client.patch(`${this.apiBaseUrl}${entityLogicalName}(${encodeURIComponent(id)})`, data)).data;
    }

    public async deleteRecord(entityLogicalName: string, id: string) {
        const client = await this.getAxiosClient();
        return (await client.delete(`${this.apiBaseUrl}${entityLogicalName}(${encodeURIComponent(id)})`)).data;
    }
}