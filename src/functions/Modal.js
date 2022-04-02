const axios = require('axios');

module.exports = class Modal {
    constructor(interaction, title, modalId, components = []) {
        this.interaction = interaction;
        this.title = title;
        this.modalId = modalId;
        this.components = components;
        this.new();
    }
    async new() {
        await client.api.interactions(this.interaction.id, this.interaction.token).callback.post({
            data: {
                type: 9,
                data: {
                    title: this.title,
                    custom_id: this.modalId,
                    components: this.components,
                },
            },
        });
    }
}