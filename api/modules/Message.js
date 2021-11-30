class Message {
    user;
    msg;
    id;
    constructor (id, user, msg) {
        this.user = user;
        this.msg = msg;
        this.id = id;
    }
}
module.exports = Message;