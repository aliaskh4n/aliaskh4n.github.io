import { api_url } from './constants.js';
import { routes } from './constants.js';

export class Requester {
    constructor(App) {
        this.app = App;
    }

    async send_request(endpoint, method = "GET", body = null, retries = 3) {
        let lastError;

        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        };

        const app_token = this.app.state.token;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                if (body) opts.body = JSON.stringify(body);
                if (app_token) opts.headers.Authorization = `Bearer ${app_token}`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const res = await fetch(
                    `${api_url}${endpoint}`, 
                    { ...opts, signal: controller.signal }
                );

                clearTimeout(timeoutId);

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error');

                return data;
            } catch (e) {
                lastError = e;

                console.warn(`API retry ${attempt + 1}/${retries}:`, e.message);

                if (attempt < retries - 1) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                }
            }
        }

        throw lastError;
    }

    async init(initData) {
        try {
            let res = await this.send_request(
                routes.init_auth,
                'POST', 
                { initData }
            );

            return res;
        } catch {            
            return null;
        }
    }

    async get_leaderboard(limit) {
        let res = await this.send_request(routes.leaderboard);

        if (!res.leaderboard || res.leaderboard.length === 0) {
            return {};
        }

        const richestPlayers = res.leaderboard.slice(0, limit);

        if (richestPlayers.length === 0) {
            return {};
        }
        
        return richestPlayers;
    }

    async get_version_leaderboard(userid) {
        try {
            let res = await this.send_request(routes.versions_checker + userid);
            return res.leaderboard ?? 0;
        } catch {
            return 0;
        }
    }
}
