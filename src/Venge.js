const fetch = require('node-fetch');

module.exports = class Venge {
    #urls = {};
    #hash = "";
    #headers = {};
    constructor(username, password, grecaptchaToken) {
        this.#urls = {
            account: "https://gateway.venge.io/",
            matchmaking: "https://matchmaking.venge.io/",
        };
        this.username = username;
        this.password = password;
        this.grecaptchaToken = grecaptchaToken;
        this.#hash = "";
        this.authorized = false;
        this.#headers = {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://venge.io",
            "Origin": "https://venge.io",
        };
    };

    async getStatus() {
        const res = await fetch(`${this.#urls.account}online.php`, {
            headers: this.#headers
        });
        if (res.status != 200) return this.#log("Venge API returned a status different from 200: " + res.status);

        const json = await res.json()
        .catch(() => this.#log("Venge API returned a non-JSON response"));
        if (!json?.success) return this.#log("Venge API returned an error: " + json?.message ?? "Unknown error");

        return json ?? {};
    };

    async login(username = this.username, password = this.password, grecaptchaToken = this.grecaptchaToken) {
        if (!await this.csrToken()) return this.#log("CSR token is not available");
        if (!username || !password || !grecaptchaToken) return this.#log("Username, password and grecaptchaToken are required");

        const params = new URLSearchParams({username, password, token: grecaptchaToken}).toString();
        const res = await this.#fetch(`login_v2`, {body: params});

        this.#setAuthorized(res?.success ?? false);

        if (!this.authorized) return this.#log("Login failed ❌");
        
        if (res.hash) this.setHash(res.hash);

        this.#log("Logged in successfully ☑️");

        this.username = username;
        this.password = password;
        return res;
    };

    logout() {
        if (!this.authorized) return this.#log("You are already logged out");
        this.#setAuthorized(false);
        this.#hash = "";
        this.#log("Logged out successfully ☑️");
        return this.authorized;
    };

    async createAccount(username, password, grecaptchaToken) {
        if (!username || !password || !grecaptchaToken) return this.#log("Username, password and grecaptchaToken are required");
        
        const params = new URLSearchParams({username, password, token: grecaptchaToken}).toString();
        const res = await this.#fetch(`create_account_v2`, {body: params});
        return res ?? {};
    };

    async getProfile(username) {
        if (!username) return this.#log("Username field is required");
        const res = await this.#fetch(`get_profile_details&username=${username}`);
        return res ?? {};
    };

    async getSkinList() {
        const res = await this.#fetch("get_skins_list");
        return res?.result ?? [];
    };

    async getSkinNames() {
        const res = await this.#fetch("get_all_skin_names");
        return res?.result ?? [];
    };

    async getMarketStreamer() {
        const res = await this.#fetch("get_market_streamer");
        return res?.streamer ?? "";
    };

    async getMarketListing(rarity = "All", itemType = "All", prices = "All") {
        const params = new URLSearchParams({rarity, itemType, prices}).toString();
        const res = await this.#fetch("get_market_listing", {body: params});
        return res?.result ?? [];
    };

    async getClansLeaderboard() {
        const res = await this.#fetch("leaderboard&sort=clans");
        return res?.result ?? [];
    };

    async getDailyLeaderboard() {
        const res = await this.#fetch("leaderboard&sort=rank");
        return res?.result ?? [];
    };

    async getWeeklyLeaderboard() {
        const res = await this.#fetch("leaderboard&sort=weekly");
        return res?.result ?? [];
    };

    async getGlobalLeaderboard() {
        const res = await this.#fetch("leaderboard&sort=score");
        return res?.result ?? [];
    };

    async getFollowersLeaderboard() {
        const res = await this.#fetch("leaderboard&sort=followers");
        return res?.result ?? [];
    };

    async getHeadshotsLeaderboard() {
        const res = await this.#fetch("leaderboard&sort=headshots");
        return res?.result ?? [];
    };

    async getKillsLeaderboard() {
        const res = await this.#fetch("leaderboard&sort=kills");
        return res?.result ?? [];
    };

    async getPriceChanges(id) {
        if (!id) return this.#log("ID field is required");
        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`get_price_changes`, {body: params});
        return res?.price_changes ?? [];
    };

    async buyItem(id) {
        if (!id) return this.#log("ID field is required");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`buy_item`, {body: params}, true);
        return res;
    };
    
    async sellItem(id) {
        if (!id) return this.#log("ID field is required");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`sell_item`, {body: params}, true);
        return res;
    };

    async resellItem(id) {
        if (!id) return this.#log("ID field is required");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`resell_item`, {body: params}, true);
        return res;
    };

    async getItemPrices(id) {
        if (!id) return this.#log("ID field is required");
        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`get_price_details`, {body: params});
        return res ?? {};
    };

    async searchSkin(skin_name, prices = "All") {
        const params = new URLSearchParams({skin_name, prices}).toString();
        const res = await this.#fetch(`search_skins`, {body: params});
        return res?.result ?? [];
    };

    async getInventory(version = 2) {
        const opts = [1,2];
        if (!opts.includes(version)) return this.#log(`Version must be one of the following: ${opts.join(", ")}`);
        const res = await this.#fetch(`get_inventory${version === 1 ? "" : `_v${version}`}`, null, true);
        return res;
    };

    async getMySales() {
        const res = await this.#fetch(`get_my_sales`, null, true);
        return res;
    };

    async getMyTrades() {
        const res = await this.#fetch(`get_trades`, null, true);
        return res;
    };

    async transferVG(username, ammount, message = "Enjoy your new coins - sent via api") {
        if (!username || !ammount) return this.#log("Username and ammount are required");

        const params = new URLSearchParams({username, ammount, message}).toString();
        const res = await this.#fetch(`trade_vg`, {body: params}, true);
        return res;
    };

    async getMyListings() {
        const res = await this.#fetch(`get_my_listing`, null, true);
        return res?.result ?? [];
    };

    async cancelListing(id) {
        if (!id) return this.#log("ID field is required");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`cancel_listing`, {body: params}, true);
        return res;
    };

    async reportUser(username) {
        if (!username) return this.#log("Username field is required");

        const params = new URLSearchParams({username}).toString();
        const res = await this.#fetch(`report_user`, {body: params}, true);
        return res;
    };

    async followUser (username) {
        if (!username) return this.#log("Username field is required");

        const params = new URLSearchParams({username}).toString();
        const res = await this.#fetch(`add_friend`, {body: params}, true);
        return res;
    };

    async getMyDetails() {
        if(!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`get_details`, null, true);
        return res;
    };

    async getMyEmoji() {
        const res = await this.#fetch(`get_emoji`, null, true);
        return res?.Emoji ?? {};
    };

    async getMyAccount() {
        const res = await this.#fetch(`get_account`, null, true);
        return res ?? {};
    };

    async getMyFollowers() {
        const res = await this.#fetch(`get_followers`, null, true);
        return res?.result ?? [];
    };

    async getMyFollowings() {
        const res = await this.#fetch(`get_followings`, null, true);
        return res?.result ?? [];
    };

    async getMyClan() {
        const res = await this.#fetch(`get_clan_details`, null, true);
        return res?.result ?? {};
    };

    async getClans() {
        const res = await this.#fetch("get_clans");
        return res?.result ?? [];
    };

    async setEmail(email) {
        if (!email) return this.#log("Email field is required");
        
        const res = await this.#fetch(`save_account`, null, true, {body: `password=&email=${email}&kill_message=&twitch=`});
        return res?.message ?? "";
    };

    async setPassword(password) {
        if (!password) return this.#log("Password field is required");

        const res = await this.#fetch(`save_account`, null, true, {body: `password=${password}&email=&kill_message=&twitch=`});
        return res?.message ?? "";
    };

    async setKillMessage(kill_message) {
        if (!kill_message) return this.#log("Kill message field is required");

        const res = await this.#fetch(`save_account`, null, true, {body: `password=&email=&kill_message=${kill_message}&twitch=`});
        return res?.message ?? "";
    };

    async setTwitch(twitch) {
        if (!twitch) return this.#log("Twitch field is required");

        const res = await this.#fetch(`save_account`, null, true, {body: `password=&email=&kill_message=&twitch=${twitch}`});
        return res?.message ?? "";
    };

    async getAnalytics(version = 2) {
        const opts = [1,2];
        if (!opts.includes(version)) return this.#log(`Version must be one of the following: ${opts.join(", ")}`);

        const res = await this.#fetch(`get_analytics${version == 1 ? '': `_v${version}`}`, null, true);
        return res ?? {};
    };

    async getMenu() {
        const res = await this.#fetch("get_menu");
        return res ?? {};
    };

    async getBanners() {
        const res = await this.#fetch("get_banners");
        return res?.banners ?? {};
    };

    async getLoadout(version = 4) {
        const opts = [1,2,3,4];
        if (!opts.includes(version)) return this.#log(`Version must be one of the following: ${opts.join(", ")}`);
        const res = await this.#fetch(`get_loadout_${version === 1 ? "" : `_v${version}`}`);
        return res?.result ?? [];
    };

    async getWeapons(type, version = 3) {
        if (!type) return this.#log("Type field is required");
        const types = ["Hero", "Rifle", "Shotgun", "Sniper", "Handgun", "Charm"];
        if (!types.includes(type)) return this.#log(`Type must be one of the following: ${types.join(", ")}`);

        const opts = [1,2,3];
        if (!opts.includes(version)) return this.#log(`Version must be one of the following: ${opts.join(", ")}`);

        const res = await this.#fetch(`get_weapons${version === 1 ? "" : `_v${version}`}`, {body: `type=${type}`});
        return res?.result ?? [];
    };

    async getPublishedMaps() {
        const res = await this.#fetch("get_published_maps");
        return res?.result ?? [];
    };

    async getModesV2() {
        const res = await this.#fetch("get_modes_v2");
        return res?.result ?? [];
    };

    async getOffers(version = 3) {
        const opts = [1, 2, 3];
        if (!opts.includes(version)) return this.#log(`Version must be one of the following: ${opts.join(", ")}`);
        const res = await this.#fetch(`get_offers${version === 1 ? "" : `_v${version}`}`);
        return res?.items ?? [];
    };

    async testCall(name = "None") {
        const res = await this.#fetch("ab_test_call", {body: `test_name=${name}`});
        return res ?? {};
    };

    async testView(data = "") {
        const res = await this.#fetch("ab_test_view", {body: data});
        return res ?? {};
    };

    async getCoinDetails() {
        const res = await this.#fetch("get_coin_details", null, true);
        return res ?? {};
    };

    async getClaimCampaign() {
        const res = await this.#fetch("get_claim_campaign");
        return res ?? {};
    };

    async buyFreeLootbox() {
        const res = await this.#fetch("buy_free_lootbox", null, true);
        return res ?? {};
    };

    async equipItem(item_id) {
        if (!item_id) return this.#log("Item ID field is required");
        const res = await this.#fetch("equip_item", {body: `id=${item_id}`}, true);
        return res ?? {};
    };

    async getQuests() {
        const res = await this.#fetch("get_quests");
        return res ?? {};
    };

    async getDeathScreenMessages() {
        const res = await this.#fetch("get_death_screen_messages");
        return res?.data ?? [];
    };

    async selectEmoji(name = "") {
        if (!name) return this.#log("Name field is required");
        const res = await this.#fetch("select_emoji", {body: `emoji=${name}`}, true);
        return res ?? {};
    };

    async checkCreatorCode(name="") {
        if (!name) return this.#log("Name field is required");
        const res = await this.#fetch("check_creator_code", {body: `creator_code=${name}`}, true);
        return res ?? {};
    };

    async getRetentionStats() {
        const res = await this.#fetch("retention_stats");
        return res ?? {};
    };

    async getCircularLayout() {
        const res = await this.#fetch("get_circular_layout");
        return res ?? {};
    };

    async findRoom(opts = {
        country: "EU",
        maps: "Sierra - POINT",
        is_mobile: false,
        version: "",
        max_players: 6,
    }) {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`find_room_v3&auth=${this.#hash}`, {
            body: new URLSearchParams(opts).toString()
        }, false, "matchmaking");
        return res ?? {};
    };

    async getRoom(id) {
        if (!id) return this.#log("ID field is required");
        const res = await this.#fetch(`get_room&hash=${id.toUpperCase()}`, null, false, "matchmaking");
        return res ?? {};
    };

    async destroyRoom() {
        const res = await this.#fetch("destroy_room", null, false, "matchmaking");
        return res ?? {};
    };

    async createRoom(opts = {
        country: "EU",
        maps: "Sierra - POINT",
        is_mobile: false,
        version: "",
        max_players: 6,
    }) {
        if (!this.authorized) return this.#log("You are not logged-in");

        const res = await this.#fetch(`create_room_v2&auth=${this.#hash}`, {
            body: new URLSearchParams(opts).toString()
        }, false, "matchmaking");
        return res ?? {};
    };

    async searchCustomGame(keyword) {
        const res = await this.#fetch("search_custom_game", {
            body: `keyword=${keyword}`,
        });
        return res ?? {};
    }

    async buyOffer(id) {
        if (!id) return this.#log("ID field is required");
        const res = await this.#fetch("buy_offer", {body: `offer_id=${id}`}, true);
        return res ?? {};
    };

    async redeemReward() {
        const res = await this.#fetch("redeem_reward", null, true);
        return res ?? {};
    };

    async clearQuests() {
        const res = await this.#fetch("clear_quests", null, true);
        return res ?? {};
    };

    async buyLootbox(id) {
        if (!id) return this.#log("ID field is required");
        const res = await this.#fetch("buy_lootbox", {body: `offer_id=${id}`}, true);
        return res ?? {};
    };

    async claimQuestReward(index) {
        const res = await this.#fetch("claim_quest_reward", {bpdy: `index=${index}`}, true);
        return res ?? {};
    };

    async unequipItem(item_id) {
        if (!item_id) return this.#log("Item ID field is required");
        const res = await this.#fetch("unequip_item", {body: `id=${item_id}`}, true);
        return res ?? {};
    };

    async setLoadout(opts = {
        itemId: "",
        itemName: "",
        itemType: "",
    }) {
        const res = await this.#fetch("set_loadout", {
            body: new URLSearchParams(opts).toString()
        },
        true);
        return res ?? {};
    };

    async joinClan(clan_id) {
        if (!clan_id) return this.#log("Clan ID field is required");

        const res = await this.#fetch("join_clan", {body: `id=${clan_id}`}, true);
        return res ?? {};
    };

    async createClan(opts = {
        name: "",
        slug: "",
        social_link: "",
    }) {
        const res = await this.#fetch("create_clan", {
            body: new URLSearchParams(opts).toString()
        }, true);
        return res ?? {};
    };

    async quitClan() {
        const res = await this.#fetch("quit_clan", null, true);
        return res ?? {};
    };

    async getClanMembers() {
        const res = await this.#fetch("get_clan_members", null, true);
        return res ?? {};
    };

    async getPendingClanMembers() {
        const res = await this.#fetch("get_waiting_clan_members", null, true);
        return res ?? {};
    };

    async kickClanMember(username) {
        if (!username) return this.#log("Username field is required");

        const res = await this.#fetch("kick_clan_member", {body: `username=${username}`}, true);
        return res ?? {};
    };

    async approveClanMember(username) {
        if (!username) return this.#log("Username field is required");

        const res = await this.#fetch("approve_clan_member", {body: `username=${username}`}, true);
        return res ?? {};
    };

    async getClanMatches() {
        const res = await this.#fetch("get_clan_matches", null, true);
        return res ?? {};
    };

    async getClanBalance() {
        const res = await this.#fetch("get_clan_balance", null, true);
        return res ?? {};
    };

    async depositClanCoins(ammount) {
        if (!ammount) return this.#log("Ammount field is required");

        const res = await this.#fetch("deposit_clan", {body: `coins=${ammount}`}, true);
        return res ?? {};
    };

    async getClanMemberSettings(username) {
        if (!username) return this.#log("Username field is required");

        const res = await this.#fetch("get_member_settings", {body: `username=${username}`}, true);
        return res ?? {};
    };

    async setClanMemberSettings(opts = {
        username: "",
        role: "",
        can_accept_requests: false,
        can_manage_chat: false,
    }) {
        const res = await this.#fetch("update_member_settings", {
            body: new URLSearchParams(opts).toString()
        }, true);
        return res ?? {};
    };

    async removeClanRole(username) {
        if (!username) return this.#log("Username field is required");

        const res = await this.#fetch("remove_clan_role", {body: `username=${username}`}, true);
        return res ?? {};
    };

    async updateClanSettings(opts = {
        welcome_message: "Hello!",
        social_link: "",
    }) {
        const res = await this.#fetch("update_clan_settings", {
            body: new URLSearchParams(opts).toString()
        }, true);
        return res ?? {};
    };

    async leaveClan() {
        const res = await this.#fetch("leave_clan", null, true);
        return res ?? {};
    };

    async deleteClan() {
        const res = await this.#fetch("delete_clan", null, true);
        return res ?? {};
    };

    cleanName(name) {
        if (!data) return "";
        return name.replace(/\[color="(.*?)"\]/g, '')
        .replace(/\[\/color]/g, '')
        .replace(/\[rainbow\](.*?)\[\/rainbow] /g, '')
        .replace(/\\/g, '').replace(/\[(.*?)\]/g, '').trim();
    };

    formatMarkup(data) {
        if (!data) return "";
        return data.replace(/\[color="(.*?)"\]/g, '<span style="color:$1">')
        .replace(/\[\/color]/g, '</span>')
        .replace(/\\/g, '');
    };

    formatNumber (num) {
        if (!data) return "";
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    };

    async csrToken() {
        const res = await this.#fetch("get_csr_token");
        return res.success;
    };

    setHash(hash) {
        this.#hash = hash;
        this.#setAuthorized(true);
        this.#log("Successfully logged in via hash ☑️");
    };

    #setAuthorized(authorized = true) {
        this.authorized = authorized;
    };

    getMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(prop => prop !== "constructor");
    };

    async #fetch(request, opts = {}, auth = false, url = "account") {
        if (auth && !this.authorized) return this.#log("You are not logged-in");

        const res = await fetch(`${this.#urls[url]}?request=${request}${auth ? `&hash=${this.#hash}` : ""}`, {
            ...opts,
            method: "POST",
            headers: this.#headers
        });
        if (res.status != 200) return this.#log("Venge API returned a status different from 200: " + res.status);

        const json = await res.json()
        .catch(() => this.#log("Venge API returned a non-JSON response"));
        
        if (json == "[]") return this.#log("Venge API returned an empty response (err. 404 or no data)");
        if (!json?.success) return this.#log("Venge API returned an error: " + json?.message ?? "Unknown error");

        return json;
    };

    #log(...data) {
        console.log("\x1b[35m[VENGE.IO]\x1b[0m", ...data);
    };
};