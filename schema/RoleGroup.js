const mongoose = require("mongoose")

var RoleGroup = mongoose.Schema({

	roleIDs: { type: [String], required: true },
    assignable: { type: Boolean, required: true },
    exclusive:{type:Boolean, default:true},
    serverID: { type: String, required: true },
    groupName: { type: String, required: true },
    
})

module.exports = mongoose.model("RoleGroup", RoleGroup)
