Promise.prototype.delete = function (timeout) {
    if (this) this.then(msg => {
        setTimeout(async () => { msg.delete().catch(e => ({})) }, timeout * 1000)
    });
};

client.findChannel = function (channelName) {
    try {
        return client.channels.cache.find(x => x.name === channelName)
    } catch (err) {
        return undefined;
    }
};