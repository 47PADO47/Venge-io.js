const fetch = require('node-fetch');

module.exports = class Venge {
    #hash = "";
    constructor(username, password) {
        this.serviceURL = 'https://gateway.venge.io/';
        this.username = username;
        this.password = password;
        this.#hash = "";
        this.authorized = false;
    };

    getStatus() {
        const res = this.#fetch("online.php");
        return res ?? {};
    };

    async login(username = this.username, password = this.password) {
        if (!this.csrToken()) return this.#log("CSR token is not available");
        if (!username || !password) return this.#log("Username or password are required");

        const params = new URLSearchParams({username, password}).toString();
        const res = await this.#fetch(`?request=login`, {body: params});

        this.authorized = res?.success ?? false;

        if (!this.authorized) return this.#log("Login failed ❌");
        
        if (res.hash) this.setHash(res.hash);

        this.#log("Logged in successfully ☑️");

        this.username = username;
        this.password = password;
        return res;
    };

    logout() {
        if (!this.authorized) return this.#log("You are already logged out");
        this.authorized = false;
        this.#hash = "";
        this.#log("Logged out successfully ☑️");
        return this.authorized;
    };

    async getProfile(username) {
        if (!username) return this.#log("Username field is required");
        const res = await this.#fetch(`?request=get_profile_details&username=${username}`);
        return res ?? {};
    };

    async getSkinList() {
        const res = await this.#fetch("?request=get_skins_list");
        return res?.result ?? [];
    };

    async getSkinNames() {
        const res = await this.#fetch("?request=get_all_skin_names");
        return res?.result ?? [];
    };

    async getMarketStreamer() {
        const res = await this.#fetch("?request=get_market_streamer");
        return res?.streamer ?? "";
    };

    async getMarketListing(rarity = "All", itemType = "All", prices = "All") {
        const params = new URLSearchParams({rarity, itemType, prices}).toString();
        const res = await this.#fetch("?request=get_market_listing", {body: params});
        return res?.result ?? [];
    };

    async getClans() {
        const res = await this.#fetch("?request=leaderboard&sort=clans");
        return res?.result ?? [];
    };

    async getDailyLeaderboard() {
        const res = await this.#fetch("?request=leaderboard&sort=rank");
        return res?.result ?? [];
    };

    async getWeeklyLeaderboard() {
        const res = await this.#fetch("?request=leaderboard&sort=weekly");
        return res?.result ?? [];
    };

    async getGlobalLeaderboard() {
        const res = await this.#fetch("?request=leaderboard&sort=score");
        return res?.result ?? [];
    };

    async getFollowersLeaderboard() {
        const res = await this.#fetch("?request=leaderboard&sort=followers");
        return res?.result ?? [];
    };

    async getHeadshotsLeaderboard() {
        const res = await this.#fetch("?request=leaderboard&sort=headshots");
        return res?.result ?? [];
    };

    async getKillsLeaderboard() {
        const res = await this.#fetch("?request=leaderboard&sort=kills");
        return res?.result ?? [];
    };

    async getPriceChanges(id) {
        if (!id) return this.#log("ID field is required");
        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`?request=get_price_changes`, {body: params});
        return res?.price_changes ?? [];
    };

    async buyItem(id) {
        if (!id) return this.#log("ID field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`?request=buy_item&hash=${this.#hash}`, {body: params});
        return res;
    };
    
    async sellItem(id) {
        if (!id) return this.#log("ID field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`?request=sell_item&hash=${this.#hash}`, {body: params});
        return res;
    };

    async resellItem(id) {
        if (!id) return this.#log("ID field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`?request=resell_item&hash=${this.#hash}`, {body: params});
        return res;
    };

    async getItemPrices(id) {
        if (!id) return this.#log("ID field is required");
        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`?request=get_price_details`, {body: params});
        return res ?? {};
    };

    async searchSkin(skin_name, prices = "All") {
        const params = new URLSearchParams({skin_name, prices}).toString();
        const res = await this.#fetch(`?request=search_skins`, {body: params});
        return res?.result ?? [];
    };

    async getAccountBalance() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_account_balance&hash=${this.#hash}`);
        return res;
    };

    async getInventory() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_inventory&hash=${this.#hash}`);
        return res;
    };

    async getMySales() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_my_sales&hash=${this.#hash}`);
        return res;
    };

    async getMyTrades() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_trades&hash=${this.#hash}`);
        return res;
    };

    async transferVG(username, ammount, message = "Enjoy your new coins - sent via api") {
        if (!this.authorized) return this.#log("You are not logged-in");
        if (!username || !ammount) return this.#log("Username and ammount are required");

        const params = new URLSearchParams({username, ammount, message}).toString();
        const res = await this.#fetch(`?request=trade_vg&hash=${this.#hash}`, {body: params});
        return res;
    };

    async getMyListings() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_my_listing&hash=${this.#hash}`);
        return res?.result ?? [];
    };

    async cancelListing(id) {
        if (!this.authorized) return this.#log("You are not logged-in");
        if (!id) return this.#log("ID field is required");

        const params = new URLSearchParams({id}).toString();
        const res = await this.#fetch(`?request=cancel_listing&hash=${this.#hash}`, {body: params});
        return res;
    };

    async reportUser(username) {
        if (!username) return this.#log("Username field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const params = new URLSearchParams({username}).toString();
        const res = await this.#fetch(`?request=report_user&hash=${this.#hash}`, {body: params});
        return res;
    };

    async followUser (username) {
        if (!username) return this.#log("Username field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const params = new URLSearchParams({username}).toString();
        const res = await this.#fetch(`?request=add_friend&hash=${this.#hash}`, {body: params});
        return res;
    };

    async getMyDetails() {
        if(!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_details&hash=${this.#hash}`);
        return res;
    };

    async getMyEmoji() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_emoji&hash=${this.#hash}`);
        return res?.Emoji ?? {};
    };

    async getMyAccount() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_account&hash=${this.#hash}`);
        return res ?? {};
    };

    async getMyFollowers() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_followers&hash=${this.#hash}`);
        return res?.result ?? [];
    };

    async getMyFollowings() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_followings&hash=${this.#hash}`);
        return res?.result ?? [];
    };

    async getMyClan() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_clan_details&hash=${this.#hash}`);
        return res?.result ?? {};
    };

    async getClans() {
        const res = await this.#fetch("?request=get_clans");
        return res?.result ?? [];
    };

    async setEmail(email) {
        if (!email) return this.#log("Email field is required");
        if (!this.authorized) return this.#log("You are not logged-in");
        
        const res = await this.#fetch(`?request=save_account&hash=${this.#hash}`, {body: `password=&email=${email}&kill_message=&twitch=`});
        return res?.message ?? "";
    };

    async setPassword(password) {
        if (!password) return this.#log("Password field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const res = await this.#fetch(`?request=save_account&hash=${this.#hash}`, {body: `password=${password}&email=&kill_message=&twitch=`});
        return res?.message ?? "";
    };

    async setKillMessage(kill_message) {
        if (!kill_message) return this.#log("Kill message field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const res = await this.#fetch(`?request=save_account&hash=${this.#hash}`, {body: `password=&email=&kill_message=${kill_message}&twitch=`});
        return res?.message ?? "";
    };

    async setTwitch(twitch) {
        if (!twitch) return this.#log("Twitch field is required");
        if (!this.authorized) return this.#log("You are not logged-in");

        const res = await this.#fetch(`?request=save_account&hash=${this.#hash}`, {body: `password=&email=&kill_message=&twitch=${twitch}`});
        return res?.message ?? "";
    };

    async getAnalytics() {
        if (!this.authorized) return this.#log("You are not logged-in");
        const res = await this.#fetch(`?request=get_analytics&hash=${this.#hash}`);
        return res ?? {};
    };

    async getMenu() {
        const res = await this.#fetch("?request=get_menu");
        return res ?? {};
    };

    async getBanners() {
        const res = await this.#fetch("?request=get_banners");
        return res?.banners ?? {};
    };

    async getLoadout() {
        const res = await this.#fetch("?request=get_loadout");
        return res?.result ?? [];
    };

    async getWeapons(type) {
        if (!type) return this.#log("Type field is required");
        const types = ["Hero", "Rifle", "Shotgun", "Sniper", "Handgun"];
        if (!types.includes(type)) return this.#log(`Type must be one of the following: ${types.join(", ")}`);

        const res = await this.#fetch(`?request=get_weapons_v2`, {body: `type=${type}`});
        return res?.result ?? [];
    };

    async getPublishedMaps() {
        const res = await this.#fetch("?request=get_published_maps");
        return res?.result ?? [];
    };

    async getModesV2() {
        const res = await this.#fetch("?request=get_modes_v2");
        return res?.result ?? [];
    };

    async getOffers() {
        const res = await this.#fetch("?request=get_offers");
        return res?.items ?? [];
    };

    #cleanName(name) {
        return name.replace(/\[color="(.*?)"\]/g, '')
        .replace(/\[\/color]/g, '')
        .replace(/\[rainbow\](.*?)\[\/rainbow] /g, '')
        .replace(/\\/g, '').replace(/\[(.*?)\]/g, '').trim();
    };

    async csrToken() {
        const res = await this.#fetch("?request=get_csr_token");
        return res.success;
    };

    setHash(hash) {
        this.#hash = hash;
    };

    getMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(prop => prop !== "constructor");
    };

    async #fetch(url, opts = {}) {
        const res = await fetch(this.serviceURL + url, {
            ...opts,
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://venge.io",
                "Origin": "https://venge.io"
            }
        });
        if (res.status != 200) return this.#log("Venge API returned a status different from 200: " + res.status);

        const json = await res.json()
        .catch(e => this.#log("Venge API returned a non-JSON response"));
        if (!json.success) return this.#log("Venge API returned an error: " + json.message);

        return json;
    };

    #log(...data) {
        console.log("\x1b[35m[VENGE.IO]\x1b[0m", ...data);
    };
};