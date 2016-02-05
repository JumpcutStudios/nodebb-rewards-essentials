"use strict";

var rewards = {},
	groups = require.main.require('./src/groups'),
	notifications = require.main.require('./src/notifications'),
	emailer = require.main.require('./src/emailer');

rewards.get = function(rewards, callback) {
	getGroupList(function(err, groups) {
		rewards = rewards.concat([
			{
				"rid": "essentials/add-to-group",
				"name": "Add to Group",
				"inputs": [
					{
						"type": "select",
						"name": "groupname",
						"label": "Group Name:",
						"values": groups
					}
				]
			},
			{
				"rid": "essentials/alert-user",
				"name": "Send alert message",
				"inputs": [
					{
						"type": "text",
						"name": "title",
						"label": "Title:"
					},
					{
						"type": "text",
						"name": "message",
						"label": "Message:"
					}
				]
			}
		]);

		callback(false, rewards);
	});
};

rewards.addToGroup = function(data) {
	groups.join(data.reward.groupname, data.uid);
};


rewards.alertUser = function(data) {
	notifications.create({
			bodyShort: data.reward.message,
			topicTitle: data.reward.title,
			path: data.reward.message,
			nid: ':reward:' + data.uid
		}, function(err, notification) {
			if (!err && notification) {
				notifications.push(notification, [data.uid]);
			}
		});
	emailer.send('test', data.uid, {reward_message: data.reward.message});
};



function getGroupList(callback) {
	var list = [];

	groups.getGroups('groups:createtime', 0, -1, function(err, groups) {
		groups.forEach(function(group) {
			var name = group;
			if ((name = group.match(/cid:([0-9]*):privileges:groups:([\s\S]*)/)) !== null) {
				name = 'Category ' + name[1] + ' group with privilege ' + name[2];
			}

			list.push({
				name: name ? name : group,
				value: group
			});
		});

		callback(err, list);
	});
}

module.exports = rewards;