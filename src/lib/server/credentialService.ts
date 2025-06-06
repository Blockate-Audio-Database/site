import { CACHE_TTL } from "$lib/config/credentialService";
import { prisma, supabase } from "./db";

interface Credential {
    opencloudAPIKey: string;
    accountCookie: `_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|${string}`;
    userId: string;
}

interface Credentials {
    description: string;
    decrypted_secret: Credential;
}

const credentialsCache: { 
    cacheExpiration: number;
    credentials: Credentials[]
} = {
    cacheExpiration: 0,
    credentials: []
};

const channel = supabase.channel("updates")

channel.on("broadcast", { event: "forceCredentialsUpdate" }, () => {
    console.log("[ CREDENTIAL SERVICE ] Received forceCredentialsUpdate event, clearing cache...")
    credentialsCache.cacheExpiration = 0
}).subscribe();

export const getBots = async (): Promise<Credentials[]> => {

    if (credentialsCache.cacheExpiration < Date.now()) {
        // cache expired
        console.log("[ CREDENTIAL SERVICE ] Cache miss, fetching for potentially new credentials...")
        const data: { description: string, decrypted_secret: Credential }[] = await prisma.$queryRaw`
            select description, decrypted_secret from vault.decrypted_secrets;
        `

        credentialsCache.cacheExpiration = Date.now() + CACHE_TTL
        credentialsCache.credentials = data.map(x => ({
            description: x.description,
            decrypted_secret: JSON.parse(String(x.decrypted_secret))
        }))

        return credentialsCache.credentials
    } else {
        console.log("[ CREDENTIAL SERVICE ] Cache hit, returning cached credentials...")
        return credentialsCache.credentials
    }

}
