const mongoose = require('mongoose');
const transactionSchema = mongoose.Schema(
    { 
        userId: mongoose.Types.ObjectId,
        imei: String, 
        description: String,
        screenDisplayId: {type: Number, default: 0},
        model: String,
        manufacturer: String,
        osCodename: String,
        osVersion: String,
        product: String,
        hardware: String,
        displayVersion: String,
        bundleId: String,
        versionCode: String,
        versionName: String,
        packageName: String,
        ipAddress: String,
        uri: String,
        contentType: String,
        http_user_agent: String,
        http_host: String,
        remote_port: String,
        http_accept_encoding: String,
        
    },
	{ timestamps: true}, {collection:'trackings'}
);

module.exports =  transactionSchema;