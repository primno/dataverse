import { NtlmCredentials } from "axios-ntlm";
import { ConnectionStringProcessor } from "../../connection-string";

export function convertToNetworkCredential(connectionString: ConnectionStringProcessor): NtlmCredentials {
    return { 
        password: connectionString.password!,
        username: connectionString.userName!,
        domain: connectionString.domain!
    };
}

export { NtlmAuth } from "./ntlm-auth";