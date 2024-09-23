/**
 * @name AutoSignature
 * @version 1.1.3
 * @description Automatically appends a signature to every message you send, with configurable signature message.
 */

module.exports = (() => {
    const config = {
        info: {
            name: "AutoSignature",
            authors: [{
                name: "Tobi",
                discord_id: "821815734883319819",
                github_username: "tobiil0l"
            }],
            version: "1.1.3",
            description: "Automatically appends a signature to every message you send, with configurable signature message.",
            github: "https://github.com/tobiil0l/AutoSignature",
            github_raw: "https://raw.githubusercontent.com/tobiil0l/AutoSignature/master/AutoSignature.plugin.js"
        },
        changelog: [
            {
                title: "New",
                type: "added",
                items: ["Initial release of AutoSignature plugin with configurable signature message."]
            }
        ]
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getVersion() { return config.info.version; }
        getDescription() { return config.info.description; }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const { Patcher, WebpackModules, PluginUtilities, Settings } = Api;

            return class AutoSignature extends Plugin {
                constructor() {
                    super();
                    this.defaultSettings = {
                        signature: "\n-#  This account is not affiliated with, endorsed by, or in any way associated with the brand or the company Discover Financial Services or its subsidiaries. [Learn More](<https://discover.com/>)"
                    };
                    this.settings = this.loadSettings(this.defaultSettings);
                }

                onStart() {
                    this.patchSendMessage();
                }

                onStop() {
                    Patcher.unpatchAll();
                }

                getSettingsPanel() {
                    return Settings.SettingPanel.build(
                        () => this.saveSettings(this.settings),
                        new Settings.SettingGroup("Signature Settings").append(
                            new Settings.Textbox("Signature", "Enter the signature to be appended to each message.", this.settings.signature, value => {
                                this.settings.signature = value;
                            }, { rows: 5 })
                        )
                    );
                }

                patchSendMessage() {
                    const MessageModule = WebpackModules.getByProps("sendMessage");
                    Patcher.before(MessageModule, "sendMessage", (_, args) => {
                        const message = args[1].content;
                        args[1].content = message + "\n" + this.settings.signature;
                    });
                }
            };
        };

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
