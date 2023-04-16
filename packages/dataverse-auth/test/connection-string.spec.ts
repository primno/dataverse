import { AuthenticationType, ConnectionString, LoginPromptType } from "../src/connection-string";

describe("Connection-string", () => {
    describe("Enum values", () => {
        describe("AuthType", () => {
            const connectionStrings = [
                new ConnectionString("AuthType=oauth"),
                new ConnectionString("AuthType=OAUTH"),
            ];

            connectionStrings.forEach((cs) => {
                it(`should be OAuth for ${cs.toString()}`, () => {
                    expect(cs.authType).toBe(AuthenticationType.OAuth);
                });
            });
        });

        describe("LoginPrompt", () => {
            const connectionStrings = [
                new ConnectionString("LoginPrompt=always"),
                new ConnectionString("LoginPrompt=ALWAYS"),
            ];

            connectionStrings.forEach((cs) => {
                it(`should be Auto for ${cs.toString()}`, () => {
                    expect(cs.loginPrompt).toBe(LoginPromptType.Always);
                });
            });
        });
    });

    describe("Alternate names", () => {
        describe("AuthType", () => {
            const connectionStrings = [
                new ConnectionString("AuthType=AD"),
                new ConnectionString("AuthenticationType=AD")
            ];

            connectionStrings.forEach((cs) => {
                it(`should have an auth type for ${cs.toString()}`, () => {
                    expect(cs.authType).toBe(AuthenticationType.AD);
                });
            });
        });

        describe("ServiceUri", () => {
            const connectionStrings = [
                new ConnectionString("ServiceUri=https://foo.com"),
                new ConnectionString("Url=https://foo.com"),
                new ConnectionString("Service Uri=https://foo.com"),
                new ConnectionString("Server=https://foo.com")
            ];

            connectionStrings.forEach((cs) => {
                it(`should have a service uri for ${cs.toString()}`, () => {
                    expect(cs.serviceUri).toBe("https://foo.com");
                });
            });
        });

        describe("UserName", () => {
            const connectionStrings = [
                new ConnectionString("UserName=foo"),
                new ConnectionString("User Name=foo"),
                new ConnectionString("UserId=foo"),
                new ConnectionString("User Id=foo")
            ];

            connectionStrings.forEach((cs) => {
                it(`should have a username for ${cs.toString()}`, () => {
                    expect(cs.userName).toBe("foo");
                });
            });
        });

        describe("HomeRealmUri", () => {
            const connectionStrings = [
                new ConnectionString("HomeRealmUri=https://foo.com"),
                new ConnectionString("Home Realm Uri=https://foo.com")
            ];

            connectionStrings.forEach((cs) => {
                it(`should have a home realm uri for ${cs.toString()}`, () => {
                    expect(cs.homeRealmUri).toBe("https://foo.com");
                });
            });
        });

        describe("ClientId", () => {
            const connectionStrings = [
                new ConnectionString("ClientId=foo"),
                new ConnectionString("AppId=foo"),
                new ConnectionString("ApplicationId=foo")
            ];

            connectionStrings.forEach((cs) => {
                it(`should have a client id for ${cs.toString()}`, () => {
                    expect(cs.clientId).toBe("foo");
                });
            });
        });

        describe("RedirectUri", () => {
            const connectionStrings = [
                new ConnectionString("RedirectUri=https://foo.com"),
                new ConnectionString("ReplyUrl=https://foo.com")
            ];

            connectionStrings.forEach((cs) => {
                it(`should have a redirect uri for ${cs.toString()}`, () => {
                    expect(cs.redirectUri).toBe("https://foo.com");
                });
            });
        });
    });

    describe("OAuth", () => {
        describe("Sample app", () => {
            const cs = new ConnectionString("AuthType=OAuth;UserName=foo; Password=bar");

            it("should not have a sample client id", () => {
                expect(cs.clientId).toBe("51f81489-12ee-4a9e-aaae-a2591f45987d");
            });

            it("should not have a sample redirect url", () => {
                expect(cs.redirectUri).toBe("app://58145B91-0C36-4500-8554-080854F2AC97");
            });
        });

        describe("custom app", () => {
            const cs = new ConnectionString("AuthType=OAuth;ClientId=foo;RedirectUri=bar");

            it("should have a client id", () => {
                expect(cs.clientId).toBe("foo");
            });

            it("should have a redirect url", () => {
                expect(cs.redirectUri).toBe("bar");
            });
        });

        describe("username flow", () => {
            const cs = new ConnectionString("AuthType=OAuth;UserName=foo; Password=bar");

            it("should have a username", () => {
                expect(cs.userName).toBe("foo");
            });

            it("should have a password", () => {
                expect(cs.password).toBe("bar");
            });
        });

        describe("client secret flow", () => {
            const cs = new ConnectionString("AuthType=OAuth;ClientId=foo;ClientSecret=bar");

            it("should have a client id", () => {
                expect(cs.clientId).toBe("foo");
            });

            it("should have a client secret", () => {
                expect(cs.clientSecret).toBe("bar");
            });
        });
    });

    describe("AD", () => {
        const cs = new ConnectionString("AuthType=AD;UserName=foo; Password=bar");

        it("should be AD", () => {
            expect(cs.authType).toBe(AuthenticationType.AD);
        });

        it("should have a username", () => {
            expect(cs.userName).toBe("foo");
        });

        it("should have a password", () => {
            expect(cs.password).toBe("bar");
        });
    });
});