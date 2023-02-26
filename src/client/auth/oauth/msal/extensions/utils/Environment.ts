/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "path";
import { Constants, Platform } from "./Constants";
import { PersistenceError } from "../error/PersistenceError";
import { StringUtils } from "@azure/msal-common";

export class Environment {
    static get homeEnvVar(): string {
        return this.getEnvironmentVariable(Constants.ENVIRONMENT.HOME);
    }
    
    static get lognameEnvVar(): string {
        return this.getEnvironmentVariable(Constants.ENVIRONMENT.LOGNAME);
    }

    static get userEnvVar(): string {
        return this.getEnvironmentVariable(Constants.ENVIRONMENT.USER);
    }

    static get lnameEnvVar(): string {
        return this.getEnvironmentVariable(Constants.ENVIRONMENT.LNAME);
    }

    static get usernameEnvVar(): string {
        return this.getEnvironmentVariable(Constants.ENVIRONMENT.USERNAME);
    }

    static getEnvironmentVariable(name: string): string {
        return process.env[name] as string;
    }

    static getEnvironmentPlatform(): string {
        return process.platform;
    }

    static isWindowsPlatform(): boolean {
        return this.getEnvironmentPlatform() === Platform.WINDOWS;
    }

    static isLinuxPlatform(): boolean {
        return this.getEnvironmentPlatform() === Platform.LINUX;
    }

    static isMacPlatform(): boolean {
        return this.getEnvironmentPlatform() === Platform.MACOS;
    }

    static isLinuxRootUser(): boolean {
        if (!process.getuid) {
            return false;
        }
        return process.getuid() === Constants.LINUX_ROOT_USER_GUID;
    }

    static getUserRootDirectory(): string {
        return !this.isWindowsPlatform ?
            this.getUserHomeDirOnUnix() as string :
            this.getUserHomeDirOnWindows();
    }

    static getUserHomeDirOnWindows(): string {
        return this.getEnvironmentVariable(Constants.ENVIRONMENT.LOCAL_APPLICATION_DATA);
    }

    static getUserHomeDirOnUnix(): string | null {
        if (this.isWindowsPlatform()) {
            throw PersistenceError.createNotSupportedError(
                "Getting the user home directory for unix is not supported in windows");
        }

        if (!StringUtils.isEmpty(this.homeEnvVar)) {
            return this.homeEnvVar;
        }

        let username = null;
        if (!StringUtils.isEmpty(this.lognameEnvVar)) {
            username = this.lognameEnvVar;
        } else if (!StringUtils.isEmpty(this.userEnvVar)) {
            username = this.userEnvVar;
        } else if (!StringUtils.isEmpty(this.lnameEnvVar)) {
            username = this.lnameEnvVar;
        } else if (!StringUtils.isEmpty(this.usernameEnvVar)) {
            username = this.usernameEnvVar;
        }

        if (this.isMacPlatform()) {
            return !StringUtils.isEmpty(username as string) ? path.join("/Users", username as string) : null;
        } else if (this.isLinuxPlatform()) {
            if (this.isLinuxRootUser()) {
                return "/root";
            } else {
                return !StringUtils.isEmpty(username as string) ? path.join("/home", username as string) : null;
            }
        } else {
            throw PersistenceError.createNotSupportedError(
                "Getting the user home directory for unix is not supported in windows");
        }

    }
}
