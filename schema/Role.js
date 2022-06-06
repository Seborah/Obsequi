const mongoose = require("mongoose")

var Role = mongoose.Schema({
	roleID: { type: String, required: true },
	assignable: { type: Boolean, required: true },
	serverID: { type: String, required: true },
})

module.exports = mongoose.model("Role", Role)
