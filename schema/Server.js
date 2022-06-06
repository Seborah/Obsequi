const mongoose = require("mongoose")

var Server = mongoose.Schema({
	selfAssign: { type: Boolean, required: true },
	serverID: { type: String, required: true },
})

module.exports = mongoose.model("Server", Server)
